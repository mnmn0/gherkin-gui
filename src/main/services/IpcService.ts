import { ipcMain, IpcMainInvokeEvent, WebContents } from 'electron';
import * as path from 'path';
import { FileManagerService } from './FileManagerService';
import { CodeGenerationService } from './CodeGenerationService';
import { TestExecutionService } from './TestExecutionService';
import { FileWatcherService } from './FileWatcherService';
import {
  GherkinValidator,
  TestConfigValidator,
  ProjectConfigValidator,
} from '../utils/validation';
import { IpcChannels, IpcEvents } from '../types/ipc';
import { ProjectConfig, TestReport, GenerationConfig } from '../types';

export class IpcService {
  private fileManager: FileManagerService;

  private codeGenerator: CodeGenerationService;

  private testExecutor: TestExecutionService;

  private fileWatcher: FileWatcherService;

  private gherkinValidator: GherkinValidator;

  private testConfigValidator: TestConfigValidator;

  private projectConfigValidator: ProjectConfigValidator;

  private webContents: WebContents | null = null;

  private currentProjectConfig: ProjectConfig | null = null;

  constructor(projectPath?: string) {
    this.fileManager = new FileManagerService(projectPath);
    this.codeGenerator = new CodeGenerationService();
    this.testExecutor = new TestExecutionService();
    this.fileWatcher = new FileWatcherService();
    this.gherkinValidator = new GherkinValidator();
    this.testConfigValidator = new TestConfigValidator();
    this.projectConfigValidator = new ProjectConfigValidator();

    this.setupIpcHandlers();
    this.setupServiceListeners();
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  private setupIpcHandlers(): void {
    // File operations
    ipcMain.handle('file:list-specs', this.handleListSpecs.bind(this));
    ipcMain.handle('file:load-spec', this.handleLoadSpec.bind(this));
    ipcMain.handle('file:save-spec', this.handleSaveSpec.bind(this));
    ipcMain.handle('file:delete-spec', this.handleDeleteSpec.bind(this));
    ipcMain.handle('file:create-spec', this.handleCreateSpec.bind(this));

    // Code generation
    ipcMain.handle('code:generate', this.handleGenerateCode.bind(this));
    ipcMain.handle('code:validate', this.handleValidateCode.bind(this));

    // Test execution
    ipcMain.handle('test:execute', this.handleExecuteTest.bind(this));
    ipcMain.handle('test:status', this.handleGetTestStatus.bind(this));
    ipcMain.handle('test:cancel', this.handleCancelTest.bind(this));

    // Report management
    ipcMain.handle('report:list', this.handleListReports.bind(this));
    ipcMain.handle('report:load', this.handleLoadReport.bind(this));
    ipcMain.handle('report:delete', this.handleDeleteReport.bind(this));

    // Project configuration
    ipcMain.handle(
      'project:load-config',
      this.handleLoadProjectConfig.bind(this),
    );
    ipcMain.handle(
      'project:save-config',
      this.handleSaveProjectConfig.bind(this),
    );
    ipcMain.handle(
      'project:validate-config',
      this.handleValidateProjectConfig.bind(this),
    );
  }

  private setupServiceListeners(): void {
    // File watcher events
    this.fileWatcher.on('file-changed', (event) => {
      this.sendToRenderer('file:changed', {
        filePath: event.filePath,
        changeType: event.changeType,
      });
    });

    // Test execution events
    this.testExecutor.on('execution:started', (data) => {
      this.sendToRenderer('execution:started', data);
    });

    this.testExecutor.on('execution:progress', (progress) => {
      this.sendToRenderer('execution:progress', progress);
    });

    this.testExecutor.on('execution:completed', (data) => {
      this.sendToRenderer('execution:complete', data);
      this.saveTestReport(data.executionId, data.result);
    });

    this.testExecutor.on('execution:failed', (data) => {
      this.sendToRenderer('error:occurred', {
        code: 'TEST_EXECUTION_FAILED',
        message: data.error,
        category: 'execution',
      });
    });

    this.testExecutor.on('execution:cancelled', (data) => {
      this.sendToRenderer('execution:cancelled', data);
    });
  }

  private sendToRenderer<K extends keyof IpcEvents>(
    channel: K,
    data: IpcEvents[K],
  ): void {
    if (this.webContents) {
      this.webContents.send(channel, data);
    }
  }

  // File operation handlers
  private async handleListSpecs(): Promise<
    IpcChannels['file:list-specs']['response']
  > {
    try {
      return await this.fileManager.listSpecifications();
    } catch (error) {
      this.sendError(
        'FILE_LIST_ERROR',
        `Failed to list specifications: ${error}`,
        'filesystem',
      );
      return [];
    }
  }

  private async handleLoadSpec(
    event: IpcMainInvokeEvent,
    filePath: string,
  ): Promise<IpcChannels['file:load-spec']['response']> {
    try {
      this.validateFilePath(filePath);
      return await this.fileManager.loadSpecification(filePath);
    } catch (error) {
      this.sendError(
        'FILE_LOAD_ERROR',
        `Failed to load specification: ${error}`,
        'filesystem',
      );
      throw error;
    }
  }

  private async handleSaveSpec(
    event: IpcMainInvokeEvent,
    { filePath, content }: IpcChannels['file:save-spec']['request'],
  ): Promise<IpcChannels['file:save-spec']['response']> {
    try {
      this.validateFilePath(filePath);
      this.validateGherkinContent(content);

      await this.fileManager.saveSpecification(filePath, content);
    } catch (error) {
      this.sendError(
        'FILE_SAVE_ERROR',
        `Failed to save specification: ${error}`,
        'filesystem',
      );
      throw error;
    }
  }

  private async handleDeleteSpec(
    event: IpcMainInvokeEvent,
    filePath: string,
  ): Promise<IpcChannels['file:delete-spec']['response']> {
    try {
      this.validateFilePath(filePath);
      await this.fileManager.deleteSpecification(filePath);
    } catch (error) {
      this.sendError(
        'FILE_DELETE_ERROR',
        `Failed to delete specification: ${error}`,
        'filesystem',
      );
      throw error;
    }
  }

  private async handleCreateSpec(
    event: IpcMainInvokeEvent,
    { name, content }: IpcChannels['file:create-spec']['request'],
  ): Promise<IpcChannels['file:create-spec']['response']> {
    try {
      this.validateFileName(name);
      if (content) {
        this.validateGherkinContent(content);
      }

      return await this.fileManager.createSpecification(name, content);
    } catch (error) {
      this.sendError(
        'FILE_CREATE_ERROR',
        `Failed to create specification: ${error}`,
        'filesystem',
      );
      throw error;
    }
  }

  // Code generation handlers
  private async handleGenerateCode(
    event: IpcMainInvokeEvent,
    { specContent, config }: IpcChannels['code:generate']['request'],
  ): Promise<IpcChannels['code:generate']['response']> {
    try {
      this.validateGherkinContent(specContent);
      this.validateGenerationConfig(config);

      const ast = await this.codeGenerator.parseGherkin(specContent);
      return await this.codeGenerator.generateJUnitCode(ast, config);
    } catch (error) {
      this.sendError(
        'CODE_GENERATION_ERROR',
        `Failed to generate code: ${error}`,
        'generation',
      );
      throw error;
    }
  }

  private async handleValidateCode(
    event: IpcMainInvokeEvent,
    code: string,
  ): Promise<IpcChannels['code:validate']['response']> {
    try {
      return await this.codeGenerator.validateGeneration(code);
    } catch (error) {
      this.sendError(
        'CODE_VALIDATION_ERROR',
        `Failed to validate code: ${error}`,
        'generation',
      );
      return {
        valid: false,
        errors: [
          {
            message: `Validation failed: ${error}`,
            code: 'VALIDATION_ERROR',
          },
        ],
        warnings: [],
      };
    }
  }

  // Test execution handlers
  private async handleExecuteTest(
    event: IpcMainInvokeEvent,
    config: IpcChannels['test:execute']['request'],
  ): Promise<IpcChannels['test:execute']['response']> {
    try {
      this.validateTestConfig(config);
      return await this.testExecutor.executeTests(config);
    } catch (error) {
      this.sendError(
        'TEST_EXECUTION_ERROR',
        `Failed to execute tests: ${error}`,
        'execution',
      );
      throw error;
    }
  }

  private async handleGetTestStatus(
    event: IpcMainInvokeEvent,
    executionId: string,
  ): Promise<IpcChannels['test:status']['response']> {
    try {
      return await this.testExecutor.getExecutionStatus(executionId);
    } catch (error) {
      this.sendError(
        'TEST_STATUS_ERROR',
        `Failed to get test status: ${error}`,
        'execution',
      );
      throw error;
    }
  }

  private async handleCancelTest(
    event: IpcMainInvokeEvent,
    executionId: string,
  ): Promise<IpcChannels['test:cancel']['response']> {
    try {
      await this.testExecutor.cancelExecution(executionId);
    } catch (error) {
      this.sendError(
        'TEST_CANCEL_ERROR',
        `Failed to cancel test: ${error}`,
        'execution',
      );
      throw error;
    }
  }

  // Report management handlers
  private async handleListReports(): Promise<
    IpcChannels['report:list']['response']
  > {
    try {
      return await this.fileManager.listReports();
    } catch (error) {
      this.sendError(
        'REPORT_LIST_ERROR',
        `Failed to list reports: ${error}`,
        'filesystem',
      );
      return [];
    }
  }

  private async handleLoadReport(
    event: IpcMainInvokeEvent,
    filePath: string,
  ): Promise<IpcChannels['report:load']['response']> {
    try {
      this.validateFilePath(filePath);
      return await this.fileManager.loadReport(filePath);
    } catch (error) {
      this.sendError(
        'REPORT_LOAD_ERROR',
        `Failed to load report: ${error}`,
        'filesystem',
      );
      throw error;
    }
  }

  private async handleDeleteReport(
    event: IpcMainInvokeEvent,
    filePath: string,
  ): Promise<IpcChannels['report:delete']['response']> {
    try {
      this.validateFilePath(filePath);
      await this.fileManager.deleteReport(filePath);
    } catch (error) {
      this.sendError(
        'REPORT_DELETE_ERROR',
        `Failed to delete report: ${error}`,
        'filesystem',
      );
      throw error;
    }
  }

  // Project configuration handlers
  private async handleLoadProjectConfig(): Promise<
    IpcChannels['project:load-config']['response']
  > {
    try {
      if (this.currentProjectConfig) {
        return this.currentProjectConfig;
      }

      // Load default configuration
      const defaultConfig: ProjectConfig = {
        projectName: 'Spring Boot Test Project',
        projectPath: process.cwd(),
        buildTool: 'maven',
        buildFilePath: path.join(process.cwd(), 'pom.xml'),
        defaultClasspath: [],
        defaultSpringProfiles: ['test'],
        codeGenerationTemplates: [],
      };

      this.currentProjectConfig = defaultConfig;
      return defaultConfig;
    } catch (error) {
      this.sendError(
        'CONFIG_LOAD_ERROR',
        `Failed to load project config: ${error}`,
        'configuration',
      );
      throw error;
    }
  }

  private async handleSaveProjectConfig(
    event: IpcMainInvokeEvent,
    config: IpcChannels['project:save-config']['request'],
  ): Promise<IpcChannels['project:save-config']['response']> {
    try {
      const validation =
        this.projectConfigValidator.validateProjectConfig(config);
      if (!validation.valid) {
        throw new Error(
          `Invalid project configuration: ${validation.errors.map((e) => e.message).join(', ')}`,
        );
      }

      this.currentProjectConfig = config;

      // TODO: Persist configuration to file
    } catch (error) {
      this.sendError(
        'CONFIG_SAVE_ERROR',
        `Failed to save project config: ${error}`,
        'configuration',
      );
      throw error;
    }
  }

  private async handleValidateProjectConfig(
    event: IpcMainInvokeEvent,
    config: IpcChannels['project:validate-config']['request'],
  ): Promise<IpcChannels['project:validate-config']['response']> {
    try {
      return this.projectConfigValidator.validateProjectConfig(config);
    } catch (error) {
      this.sendError(
        'CONFIG_VALIDATION_ERROR',
        `Failed to validate project config: ${error}`,
        'configuration',
      );
      return {
        valid: false,
        errors: [
          {
            message: `Validation failed: ${error}`,
            code: 'VALIDATION_ERROR',
          },
        ],
        warnings: [],
      };
    }
  }

  // Validation helpers
  private validateFilePath(filePath: string): void {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid file path');
    }

    if (filePath.includes('..') || filePath.includes('~')) {
      throw new Error('Invalid file path: path traversal not allowed');
    }
  }

  private validateFileName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid file name');
    }

    if (!/^[a-zA-Z0-9\-_\s.]+$/.test(name)) {
      throw new Error(
        'Invalid file name: only alphanumeric characters, spaces, hyphens, underscores, and dots are allowed',
      );
    }
  }

  private validateGherkinContent(content: string): void {
    const validation = this.gherkinValidator.validate(content);
    if (!validation.valid && validation.errors.length > 0) {
      throw new Error(
        `Invalid Gherkin content: ${validation.errors.map((e) => e.message).join(', ')}`,
      );
    }
  }

  private validateGenerationConfig(config: GenerationConfig): void {
    if (!config.packageName || !config.className) {
      throw new Error('Package name and class name are required');
    }

    if (!/^[a-z][a-z0-9.]*$/.test(config.packageName)) {
      throw new Error('Invalid package name format');
    }

    if (!/^[A-Z][a-zA-Z0-9]*$/.test(config.className)) {
      throw new Error('Invalid class name format');
    }
  }

  private validateTestConfig(config: any): void {
    const validation = this.testConfigValidator.validateTestConfig(config);
    if (!validation.valid) {
      throw new Error(
        `Invalid test configuration: ${validation.errors.map((e) => e.message).join(', ')}`,
      );
    }
  }

  private async saveTestReport(
    executionId: string,
    testResult: any,
  ): Promise<void> {
    try {
      const report: TestReport = {
        id: `report-${executionId}`,
        executionId,
        timestamp: new Date(),
        specificationPath: testResult.specificationPath || 'unknown',
        testResult,
        configuration: {} as any, // TODO: Include actual test configuration
      };

      await this.fileManager.saveReport(report);
    } catch (error) {
      // Report save failed - continue silently
    }
  }

  private sendError(code: string, message: string, category: string): void {
    this.sendToRenderer('error:occurred', {
      code,
      message,
      category,
    });
  }

  setupFileWatching(): void {
    const specPath = path.join(process.cwd(), '.gherkin', 'spec');
    const reportPath = path.join(process.cwd(), '.gherkin', 'report');

    this.fileWatcher.watchDirectory(specPath);
    this.fileWatcher.watchDirectory(reportPath);
  }

  cleanup(): void {
    this.testExecutor.cleanup();
    this.fileWatcher.unwatchAll();
    ipcMain.removeAllListeners();
  }
}
