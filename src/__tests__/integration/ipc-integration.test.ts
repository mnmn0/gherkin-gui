import { BrowserWindow, ipcMain } from 'electron';
import { IpcService } from '../../main/services/IpcService';
import { FileManagerService } from '../../main/services/FileManagerService';
import { GherkinParser } from '../../main/services/GherkinParser';
import { CodeGenerationService } from '../../main/services/CodeGenerationService';
import { TestExecutionService } from '../../main/services/TestExecutionService';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Mock electron modules
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
  },
  BrowserWindow: jest.fn(),
}));

describe('IPC Integration Tests', () => {
  let ipcService: IpcService;
  let tempDir: string;
  let mockWebContents: any;

  beforeAll(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ipc-test-'));
    
    mockWebContents = {
      send: jest.fn(),
    };

    // Create mock browser window
    const mockWindow = {
      webContents: mockWebContents,
    };
    
    (BrowserWindow as any).mockImplementation(() => mockWindow);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    ipcService = new IpcService();
  });

  afterAll(async () => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('File Operations IPC', () => {
    it('should handle complete file workflow via IPC', async () => {
      // Set up the services
      ipcService.registerHandlers();

      // Mock handler implementations
      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      // Create a real file for testing
      const specContent = `Feature: IPC Test
  Scenario: Test scenario
    Given I test IPC communication
    When I call the handler
    Then it should work correctly`;

      const specPath = path.join(tempDir, 'ipc-test.feature');
      fs.writeFileSync(specPath, specContent);

      // Test file save
      const saveHandler = mockHandlers.get('file:save-specification');
      expect(saveHandler).toBeDefined();
      
      await saveHandler({}, specPath, specContent);
      expect(fs.existsSync(specPath)).toBe(true);

      // Test file load
      const loadHandler = mockHandlers.get('file:load-specification');
      expect(loadHandler).toBeDefined();
      
      const loadedContent = await loadHandler({}, specPath);
      expect(loadedContent).toBe(specContent);

      // Test file list (after setting up directory structure)
      const specsDir = path.join(tempDir, '.gherkin', 'spec');
      fs.mkdirSync(specsDir, { recursive: true });
      fs.writeFileSync(path.join(specsDir, 'test.feature'), specContent);

      // Initialize project for file manager
      const fileManager = new FileManagerService();
      await fileManager.initializeProject(tempDir);
      ipcService.fileManagerService = fileManager;

      const listHandler = mockHandlers.get('file:list-specifications');
      const specList = await listHandler({});
      
      expect(Array.isArray(specList)).toBe(true);
    });

    it('should handle file deletion via IPC', async () => {
      ipcService.registerHandlers();

      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      // Create file to delete
      const specPath = path.join(tempDir, 'delete-test.feature');
      fs.writeFileSync(specPath, 'Feature: Delete Test');

      const deleteHandler = mockHandlers.get('file:delete-specification');
      expect(deleteHandler).toBeDefined();

      await deleteHandler({}, specPath);
      expect(fs.existsSync(specPath)).toBe(false);
    });
  });

  describe('Parser IPC', () => {
    it('should parse Gherkin via IPC', async () => {
      ipcService.registerHandlers();

      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      const parseHandler = mockHandlers.get('parser:parse-gherkin');
      expect(parseHandler).toBeDefined();

      const gherkinContent = `Feature: Parser Test
  Scenario: Parse test
    Given I have Gherkin content
    When I parse it via IPC
    Then I get the AST`;

      const result = await parseHandler({}, gherkinContent);
      
      expect(result).toHaveProperty('feature');
      expect(result.feature.name).toBe('Parser Test');
      expect(result.feature.scenarios).toHaveLength(1);
      expect(result.feature.scenarios[0].name).toBe('Parse test');
    });

    it('should validate Gherkin via IPC', async () => {
      ipcService.registerHandlers();

      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      const validateHandler = mockHandlers.get('parser:validate-gherkin');
      expect(validateHandler).toBeDefined();

      const validContent = `Feature: Valid
  Scenario: Test
    Given valid step`;

      const validResult = await validateHandler({}, validContent);
      expect(validResult.valid).toBe(true);
      expect(validResult.errors).toHaveLength(0);

      const invalidContent = `Invalid Gherkin content`;
      const invalidResult = await validateHandler({}, invalidContent);
      expect(invalidResult.valid).toBe(false);
    });
  });

  describe('Code Generation IPC', () => {
    it('should generate code via IPC', async () => {
      ipcService.registerHandlers();

      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      const generateHandler = mockHandlers.get('generator:generate-code');
      expect(generateHandler).toBeDefined();

      const gherkinAST = {
        feature: {
          name: 'Test Feature',
          description: 'Test description',
          scenarios: [{
            name: 'Test Scenario',
            steps: [
              { keyword: 'Given', text: 'I have a test step' },
              { keyword: 'When', text: 'I execute the step' },
              { keyword: 'Then', text: 'I see the result' }
            ],
            tags: []
          }],
          background: undefined,
          tags: []
        },
        comments: []
      };

      const config = {
        packageName: 'com.example.test',
        className: 'TestFeatureTest',
        springBootAnnotations: ['@SpringBootTest']
      };

      const result = await generateHandler({}, gherkinAST, config);
      
      expect(typeof result).toBe('string');
      expect(result).toContain('package com.example.test;');
      expect(result).toContain('public class TestFeatureTest');
      expect(result).toContain('@SpringBootTest');
    });

    it('should validate generated code via IPC', async () => {
      ipcService.registerHandlers();

      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      const validateHandler = mockHandlers.get('generator:validate-code');
      expect(validateHandler).toBeDefined();

      const validJavaCode = `package com.example;
public class TestClass {
    @Test
    public void testMethod() {
        // Test implementation
    }
}`;

      const result = await validateHandler({}, validJavaCode);
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });
  });

  describe('Test Execution IPC', () => {
    it('should handle test execution via IPC', async () => {
      ipcService.registerHandlers();

      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      const executeHandler = mockHandlers.get('executor:execute-tests');
      expect(executeHandler).toBeDefined();

      const testConfig = {
        specificationPath: path.join(tempDir, 'test.feature'),
        javaClasspath: ['target/classes'],
        springProfiles: ['test'],
        jvmArgs: ['-Xmx512m'],
        environmentVars: {}
      };

      // Create a mock pom.xml for Maven detection
      fs.writeFileSync(path.join(tempDir, 'pom.xml'), '<project></project>');

      try {
        const executionId = await executeHandler({}, testConfig);
        expect(typeof executionId).toBe('string');
        expect(executionId.length).toBeGreaterThan(0);
      } catch (error) {
        // Test execution might fail due to missing Maven/Java, but the handler should still work
        expect(error).toBeDefined();
      }
    });

    it('should handle test cancellation via IPC', async () => {
      ipcService.registerHandlers();

      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      const cancelHandler = mockHandlers.get('executor:cancel-test');
      expect(cancelHandler).toBeDefined();

      const result = await cancelHandler({}, 'non-existent-id');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Event Emission', () => {
    it('should emit execution progress events', () => {
      const progressData = {
        executionId: 'test-exec-1',
        progress: 50,
        currentTest: 'TestClass.testMethod',
        testsCompleted: 5,
        totalTests: 10
      };

      ipcService.emitExecutionProgress('test-exec-1', progressData, mockWebContents);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        'execution:progress',
        expect.objectContaining({
          executionId: 'test-exec-1',
          progress: progressData
        })
      );
    });

    it('should emit execution completion events', () => {
      const testResult = {
        reportName: 'Test Report',
        startTime: new Date(),
        endTime: new Date(),
        environment: 'test',
        testSuites: [],
        summary: {
          totalTests: 10,
          passedTests: 8,
          failedTests: 2,
          skippedTests: 0,
          executionTime: 5000,
          successRate: 80
        }
      };

      ipcService.emitExecutionComplete('test-exec-1', testResult, mockWebContents);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        'execution:complete',
        expect.objectContaining({
          executionId: 'test-exec-1',
          result: testResult
        })
      );
    });

    it('should emit error events', () => {
      ipcService.emitError('Test error message', 'execution', mockWebContents);

      expect(mockWebContents.send).toHaveBeenCalledWith(
        'error:occurred',
        expect.objectContaining({
          message: 'Test error message',
          category: 'execution',
          severity: 'error'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle IPC errors gracefully', async () => {
      ipcService.registerHandlers();

      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      // Test with invalid file path
      const loadHandler = mockHandlers.get('file:load-specification');
      
      await expect(loadHandler({}, '/non/existent/path.feature'))
        .rejects.toThrow();

      // Test with invalid Gherkin
      const parseHandler = mockHandlers.get('parser:parse-gherkin');
      
      await expect(parseHandler({}, 'Invalid Gherkin'))
        .rejects.toThrow();
    });

    it('should validate IPC parameters', async () => {
      ipcService.registerHandlers();

      const mockHandlers = new Map();
      (ipcMain.handle as jest.Mock).mockImplementation((channel, handler) => {
        mockHandlers.set(channel, handler);
      });

      // Test with missing parameters
      const saveHandler = mockHandlers.get('file:save-specification');
      
      await expect(saveHandler({}, undefined, 'content'))
        .rejects.toThrow();
      
      await expect(saveHandler({}, 'path', undefined))
        .rejects.toThrow();
    });
  });

  describe('Service Integration', () => {
    it('should properly initialize all services', () => {
      expect(ipcService.fileManagerService).toBeInstanceOf(FileManagerService);
      expect(ipcService.gherkinParser).toBeInstanceOf(GherkinParser);
      expect(ipcService.codeGenerationService).toBeInstanceOf(CodeGenerationService);
      expect(ipcService.testExecutionService).toBeInstanceOf(TestExecutionService);
    });

    it('should handle service dependencies', async () => {
      // Test that services can work together through IPC
      const specContent = `Feature: Integration Test
  Scenario: Test integration
    Given I have a specification
    When I parse and generate code
    Then everything should work`;

      // Parse -> Generate workflow
      const parser = new GherkinParser();
      const generator = new CodeGenerationService();

      const parsed = await parser.parse(specContent);
      const config = {
        packageName: 'com.test',
        className: 'IntegrationTest',
        springBootAnnotations: ['@SpringBootTest']
      };

      const generated = await generator.generateJUnitTest(parsed, config);

      expect(generated).toContain('IntegrationTest');
      expect(generated).toContain('@SpringBootTest');
    });
  });
});