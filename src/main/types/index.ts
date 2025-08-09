export interface SpecificationFile {
  id: string;
  name: string;
  filePath: string;
  lastModified: Date;
  size: number;
}

export interface GherkinFeature {
  name: string;
  description?: string;
  scenarios: GherkinScenario[];
  background?: GherkinBackground;
  tags: string[];
}

export interface GherkinBackground {
  steps: GherkinStep[];
}

export interface GherkinScenario {
  name: string;
  steps: GherkinStep[];
  tags: string[];
  examples?: GherkinExamples;
}

export interface GherkinExamples {
  headers: string[];
  rows: string[][];
}

export interface GherkinStep {
  keyword: 'Given' | 'When' | 'Then' | 'And' | 'But';
  text: string;
  docString?: string;
  dataTable?: string[][];
}

export interface GherkinAST {
  feature: GherkinFeature;
  comments: string[];
}

export interface TestConfig {
  specificationPath: string;
  javaClasspath: string[];
  springProfiles: string[];
  jvmArgs: string[];
  environmentVars: Record<string, string>;
  buildTool: 'maven' | 'gradle';
  buildFilePath: string;
}

export interface TestExecution {
  id: string;
  specificationPath: string;
  startTime: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
}

export interface TestResult {
  executionId: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  executionTime: number;
  testCases: TestCase[];
}

export interface TestCase {
  name: string;
  className: string;
  status: 'passed' | 'failed' | 'skipped';
  executionTime: number;
  errorMessage?: string;
  stackTrace?: string;
}

export interface ReportFile {
  id: string;
  executionId: string;
  filePath: string;
  timestamp: Date;
  summary: TestSummary;
}

export interface TestReport {
  id: string;
  executionId: string;
  timestamp: Date;
  specificationPath: string;
  testResult: TestResult;
  configuration: TestConfig;
}

export interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  successRate: number;
}

export interface ProjectConfig {
  projectName: string;
  projectPath: string;
  buildTool: 'maven' | 'gradle';
  buildFilePath: string;
  javaHome?: string;
  defaultClasspath: string[];
  defaultSpringProfiles: string[];
  codeGenerationTemplates: CodeTemplate[];
}

export interface CodeTemplate {
  name: string;
  description: string;
  template: string;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

export interface GenerationConfig {
  template?: string;
  packageName: string;
  className: string;
  springBootAnnotations: string[];
  customImports?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  code: string;
}

export interface ValidationWarning {
  line?: number;
  column?: number;
  message: string;
  code: string;
}

export interface ExecutionStatus {
  executionId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentTest?: string;
  message?: string;
}

export interface ExecutionProgress {
  executionId: string;
  progress: number;
  currentTest: string;
  testsCompleted: number;
  totalTests: number;
}

export interface AppError {
  code: string;
  message: string;
  category: 'filesystem' | 'parsing' | 'generation' | 'execution' | 'configuration';
  severity: 'info' | 'warning' | 'error' | 'critical';
  context?: Record<string, any>;
  timestamp: Date;
}