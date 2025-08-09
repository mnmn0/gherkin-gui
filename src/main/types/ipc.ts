import {
  SpecificationFile,
  GenerationConfig,
  TestConfig,
  ExecutionStatus,
  ReportFile,
  TestReport,
  ProjectConfig,
  ValidationResult,
  ExecutionProgress,
  TestResult,
} from './index';

export interface IpcChannels {
  'file:list-specs': {
    request: void;
    response: SpecificationFile[];
  };
  'file:load-spec': {
    request: string;
    response: string;
  };
  'file:save-spec': {
    request: { filePath: string; content: string };
    response: void;
  };
  'file:delete-spec': {
    request: string;
    response: void;
  };
  'file:create-spec': {
    request: { name: string; content?: string };
    response: string;
  };
  'code:generate': {
    request: { specContent: string; config: GenerationConfig };
    response: string;
  };
  'code:validate': {
    request: string;
    response: ValidationResult;
  };
  'test:execute': {
    request: TestConfig;
    response: string;
  };
  'test:status': {
    request: string;
    response: ExecutionStatus;
  };
  'test:cancel': {
    request: string;
    response: void;
  };
  'report:list': {
    request: void;
    response: ReportFile[];
  };
  'report:load': {
    request: string;
    response: TestReport;
  };
  'report:delete': {
    request: string;
    response: void;
  };
  'project:load-config': {
    request: void;
    response: ProjectConfig;
  };
  'project:save-config': {
    request: ProjectConfig;
    response: void;
  };
  'project:validate-config': {
    request: ProjectConfig;
    response: ValidationResult;
  };
}

export interface IpcEvents {
  'execution:progress': ExecutionProgress;
  'execution:complete': { executionId: string; result: TestResult };
  'file:changed': {
    filePath: string;
    changeType: 'created' | 'modified' | 'deleted';
  };
  'error:occurred': {
    code: string;
    message: string;
    category: string;
  };
}

export type IpcChannel = keyof IpcChannels;
export type IpcEvent = keyof IpcEvents;
