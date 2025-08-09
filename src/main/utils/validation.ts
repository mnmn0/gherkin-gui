import {
  GherkinFeature,
  GherkinScenario,
  GherkinStep,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  TestConfig,
  ProjectConfig,
} from '../types';

export class GherkinValidator {
  private errors: ValidationError[] = [];

  private warnings: ValidationWarning[] = [];

  validateFeature(feature: GherkinFeature): ValidationResult {
    this.errors = [];
    this.warnings = [];

    if (!feature.name || feature.name.trim() === '') {
      this.addError('Feature must have a name', 'MISSING_FEATURE_NAME');
    }

    if (!feature.scenarios || feature.scenarios.length === 0) {
      this.addWarning('Feature has no scenarios', 'NO_SCENARIOS');
    } else {
      feature.scenarios.forEach((scenario, index) => {
        this.validateScenario(scenario, index);
      });
    }

    if (feature.background) {
      this.validateBackground(feature.background.steps);
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  private validateScenario(scenario: GherkinScenario, index: number): void {
    if (!scenario.name || scenario.name.trim() === '') {
      this.addError(
        `Scenario ${index + 1} must have a name`,
        'MISSING_SCENARIO_NAME',
        index + 1,
      );
    }

    if (!scenario.steps || scenario.steps.length === 0) {
      this.addError(
        `Scenario "${scenario.name}" has no steps`,
        'NO_STEPS',
        index + 1,
      );
    } else {
      scenario.steps.forEach((step, stepIndex) => {
        this.validateStep(step, stepIndex, index);
      });
    }

    if (scenario.examples) {
      this.validateExamples(scenario);
    }
  }

  private validateStep(
    step: GherkinStep,
    stepIndex: number,
    scenarioIndex: number,
  ): void {
    const validKeywords = ['Given', 'When', 'Then', 'And', 'But'];

    if (!validKeywords.includes(step.keyword)) {
      this.addError(
        `Invalid step keyword "${step.keyword}"`,
        'INVALID_KEYWORD',
        scenarioIndex + 1,
      );
    }

    if (!step.text || step.text.trim() === '') {
      this.addError(
        `Step ${stepIndex + 1} in scenario ${scenarioIndex + 1} must have text`,
        'MISSING_STEP_TEXT',
        scenarioIndex + 1,
      );
    }

    if (step.dataTable && !Array.isArray(step.dataTable)) {
      this.addError(
        'Data table must be an array',
        'INVALID_DATA_TABLE',
        scenarioIndex + 1,
      );
    }
  }

  private validateBackground(steps: GherkinStep[]): void {
    if (!steps || steps.length === 0) {
      this.addWarning('Background has no steps', 'EMPTY_BACKGROUND');
      return;
    }

    const hasWhenOrThen = steps.some(
      (step) => step.keyword === 'When' || step.keyword === 'Then',
    );

    if (hasWhenOrThen) {
      this.addWarning(
        'Background should only contain Given steps',
        'BACKGROUND_INVALID_KEYWORDS',
      );
    }
  }

  private validateExamples(scenario: GherkinScenario): void {
    if (!scenario.examples) return;

    if (!scenario.examples.headers || scenario.examples.headers.length === 0) {
      this.addError('Examples must have headers', 'MISSING_EXAMPLE_HEADERS');
    }

    if (!scenario.examples.rows || scenario.examples.rows.length === 0) {
      this.addWarning('Examples have no data rows', 'EMPTY_EXAMPLES');
    } else {
      const headerCount = scenario.examples.headers.length;
      scenario.examples.rows.forEach((row, index) => {
        if (row.length !== headerCount) {
          this.addError(
            `Example row ${index + 1} has ${row.length} columns but expected ${headerCount}`,
            'EXAMPLE_COLUMN_MISMATCH',
          );
        }
      });
    }
  }

  private addError(message: string, code: string, line?: number): void {
    this.errors.push({ message, code, line });
  }

  private addWarning(message: string, code: string, line?: number): void {
    this.warnings.push({ message, code, line });
  }
}

export class TestConfigValidator {
  validateTestConfig(config: TestConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!config.specificationPath) {
      errors.push({
        message: 'Specification path is required',
        code: 'MISSING_SPEC_PATH',
      });
    }

    if (!config.buildTool) {
      errors.push({
        message: 'Build tool must be specified',
        code: 'MISSING_BUILD_TOOL',
      });
    } else if (!['maven', 'gradle'].includes(config.buildTool)) {
      errors.push({
        message: 'Build tool must be either maven or gradle',
        code: 'INVALID_BUILD_TOOL',
      });
    }

    if (!config.buildFilePath) {
      errors.push({
        message: 'Build file path is required',
        code: 'MISSING_BUILD_FILE',
      });
    }

    if (config.javaClasspath && config.javaClasspath.length === 0) {
      warnings.push({
        message: 'Java classpath is empty',
        code: 'EMPTY_CLASSPATH',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export class ProjectConfigValidator {
  validateProjectConfig(config: ProjectConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!config.projectName || config.projectName.trim() === '') {
      errors.push({
        message: 'Project name is required',
        code: 'MISSING_PROJECT_NAME',
      });
    }

    if (!config.projectPath || config.projectPath.trim() === '') {
      errors.push({
        message: 'Project path is required',
        code: 'MISSING_PROJECT_PATH',
      });
    }

    if (!config.buildTool) {
      errors.push({
        message: 'Build tool must be specified',
        code: 'MISSING_BUILD_TOOL',
      });
    }

    if (!config.buildFilePath) {
      errors.push({
        message: 'Build file path is required',
        code: 'MISSING_BUILD_FILE',
      });
    }

    if (config.defaultClasspath && config.defaultClasspath.length === 0) {
      warnings.push({
        message: 'Default classpath is empty',
        code: 'EMPTY_DEFAULT_CLASSPATH',
      });
    }

    if (
      config.codeGenerationTemplates &&
      config.codeGenerationTemplates.length === 0
    ) {
      warnings.push({
        message: 'No code generation templates defined',
        code: 'NO_TEMPLATES',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export function validateGherkinSyntax(content: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const lines = content.split('\n');

  let hasFeature = false;
  let inScenario = false;
  let inBackground = false;
  let inExamples = false;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const lineNumber = index + 1;

    if (trimmedLine.startsWith('Feature:')) {
      if (hasFeature) {
        errors.push({
          line: lineNumber,
          message: 'Multiple features in a single file',
          code: 'MULTIPLE_FEATURES',
        });
      }
      hasFeature = true;
      if (trimmedLine === 'Feature:') {
        errors.push({
          line: lineNumber,
          message: 'Feature must have a name',
          code: 'MISSING_FEATURE_NAME',
        });
      }
    }

    if (
      trimmedLine.startsWith('Scenario:') ||
      trimmedLine.startsWith('Scenario Outline:')
    ) {
      inScenario = true;
      inBackground = false;
      inExamples = false;
      if (trimmedLine === 'Scenario:' || trimmedLine === 'Scenario Outline:') {
        errors.push({
          line: lineNumber,
          message: 'Scenario must have a name',
          code: 'MISSING_SCENARIO_NAME',
        });
      }
    }

    if (trimmedLine.startsWith('Background:')) {
      if (inScenario) {
        errors.push({
          line: lineNumber,
          message: 'Background must come before scenarios',
          code: 'BACKGROUND_POSITION',
        });
      }
      inBackground = true;
    }

    if (trimmedLine.startsWith('Examples:')) {
      if (!inScenario) {
        errors.push({
          line: lineNumber,
          message: 'Examples must be within a Scenario Outline',
          code: 'EXAMPLES_WITHOUT_SCENARIO',
        });
      }
      inExamples = true;
    }

    const stepKeywords = ['Given', 'When', 'Then', 'And', 'But'];
    const startsWithKeyword = stepKeywords.some((keyword) =>
      trimmedLine.startsWith(`${keyword} `),
    );

    if (startsWithKeyword && !inScenario && !inBackground) {
      errors.push({
        line: lineNumber,
        message: 'Step found outside of scenario or background',
        code: 'ORPHAN_STEP',
      });
    }
  });

  if (!hasFeature) {
    errors.push({
      message: 'No feature found in file',
      code: 'NO_FEATURE',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
