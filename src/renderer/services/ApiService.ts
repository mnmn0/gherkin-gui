import {
  SpecificationFile,
  GenerationConfig,
  TestConfig,
  ExecutionStatus,
  ReportFile,
  TestReport,
  ProjectConfig,
  ValidationResult,
} from '../../main/types';

export class ApiService {
  // File operations
  async listSpecifications(): Promise<SpecificationFile[]> {
    return window.electron.invoke('file:list-specs', undefined);
  }

  async loadSpecification(filePath: string): Promise<string> {
    return window.electron.invoke('file:load-spec', filePath);
  }

  async saveSpecification(filePath: string, content: string): Promise<void> {
    return window.electron.invoke('file:save-spec', { filePath, content });
  }

  async deleteSpecification(filePath: string): Promise<void> {
    return window.electron.invoke('file:delete-spec', filePath);
  }

  async createSpecification(name: string, content?: string): Promise<string> {
    return window.electron.invoke('file:create-spec', { name, content });
  }

  // Code generation
  async generateCode(
    specContent: string,
    config: GenerationConfig,
  ): Promise<string> {
    return window.electron.invoke('code:generate', { specContent, config });
  }

  async validateCode(code: string): Promise<ValidationResult> {
    return window.electron.invoke('code:validate', code);
  }

  // Test execution
  async executeTests(config: TestConfig): Promise<string> {
    return window.electron.invoke('test:execute', config);
  }

  async getTestStatus(executionId: string): Promise<ExecutionStatus> {
    return window.electron.invoke('test:status', executionId);
  }

  async cancelTest(executionId: string): Promise<void> {
    return window.electron.invoke('test:cancel', executionId);
  }

  // Report management
  async listReports(): Promise<ReportFile[]> {
    return window.electron.invoke('report:list', undefined);
  }

  async loadReport(filePath: string): Promise<TestReport> {
    return window.electron.invoke('report:load', filePath);
  }

  async deleteReport(filePath: string): Promise<void> {
    return window.electron.invoke('report:delete', filePath);
  }

  // Project configuration
  async loadProjectConfig(): Promise<ProjectConfig> {
    return window.electron.invoke('project:load-config', undefined);
  }

  async saveProjectConfig(config: ProjectConfig): Promise<void> {
    return window.electron.invoke('project:save-config', config);
  }

  async validateProjectConfig(
    config: ProjectConfig,
  ): Promise<ValidationResult> {
    return window.electron.invoke('project:validate-config', config);
  }

  // Event listeners
  onExecutionProgress(callback: (data: any) => void): () => void {
    return window.electron.on('execution:progress', callback);
  }

  onExecutionComplete(callback: (data: any) => void): () => void {
    return window.electron.on('execution:complete', callback);
  }

  onFileChanged(callback: (data: any) => void): () => void {
    return window.electron.on('file:changed', callback);
  }

  onError(callback: (data: any) => void): () => void {
    return window.electron.on('error:occurred', callback);
  }

  removeAllListeners(channel: string): void {
    window.electron.removeAllListeners(channel);
  }
}

// Create singleton instance
export const apiService = new ApiService();
