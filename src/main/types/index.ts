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
  testName: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  errorMessage?: string;
  stackTrace?: string;
  assertions: TestAssertion[];
}

export interface TestAssertion {
  message: string;
  passed: boolean;
  expected?: any;
  actual?: any;
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
  name: string;
  createdAt: string;
  size: number;
}

export interface TestReport {
  id: string;
  executionId: string;
  timestamp: Date;
  specificationPath: string;
  testResult: TestResult;
  configuration: TestConfig;
  startTime: string;
  endTime: string;
  environment: string;
  reportName?: string;
  summary: TestSummary;
  testSuites: TestSuite[];
}

export interface TestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  successRate: number;
  executionTime: number;
  recentFailures?: TestFailure[];
}

export interface TestFailure {
  testName: string;
  errorMessage: string;
  timestamp: string;
}

export interface TestSuite {
  name: string;
  testResults: TestResult[];
  status: 'passed' | 'failed' | 'skipped';
  executionTime: number;
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
  category:
    | 'filesystem'
    | 'parsing'
    | 'generation'
    | 'execution'
    | 'configuration';
  severity: 'info' | 'warning' | 'error' | 'critical';
  context?: Record<string, any>;
  timestamp: Date;
}

export interface GenerationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'junit5' | 'junit4' | 'testng' | 'cucumber' | 'custom';
  content: string;
  variables: TemplateVariable[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'boolean' | 'number' | 'array';
  defaultValue?: string;
  description?: string;
}

export interface ProjectConfig {
  projectName: string;
  description?: string;
  specificationDirectory: string;
  reportDirectory: string;
  testConfiguration: {
    buildTool: 'maven' | 'gradle';
    javaVersion: string;
    testFramework: string;
    springBootVersion: string;
  };
  codeGeneration?: {
    defaultPackage: string;
    baseTestClass?: string;
    generateStepDefinitions: boolean;
    includePageObjects: boolean;
  };
  fileWatching?: {
    enabled: boolean;
    autoRegenerate: boolean;
  };
}

export interface GlobalConfig {
  language?: string;
  theme?: 'light' | 'dark' | 'auto';
  autoSave?: boolean;
  showWelcomeScreen?: boolean;
  editor?: {
    fontFamily?: string;
    fontSize?: number;
    tabSize?: number;
    wordWrap?: boolean;
    showLineNumbers?: boolean;
    highlightActiveLine?: boolean;
  };
  ui?: {
    sidebarWidth?: number;
    zoomLevel?: number;
    compactMode?: boolean;
    showStatusBar?: boolean;
  };
  maxRecentFiles?: number;
  backupInterval?: number;
  enableTelemetry?: boolean;
  enableDebugLogging?: boolean;
}

export interface ConfigurationPreset {
  id: string;
  name: string;
  description: string;
  category: 'project' | 'testing' | 'generation' | 'editor';
  config: Partial<ProjectConfig & GlobalConfig>;
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConfigurationPresetData {
  name: string;
  description: string;
  category: 'project' | 'testing' | 'generation' | 'editor';
  config: Partial<ProjectConfig & GlobalConfig>;
}
