import {
  GherkinAST,
  GherkinFeature,
  GherkinScenario,
  GherkinStep,
  GenerationConfig,
  ValidationResult,
} from '../types';
import { GherkinParser } from './GherkinParser';

export class CodeGenerationService {
  private parser: GherkinParser;

  constructor() {
    this.parser = new GherkinParser();
  }

  async parseGherkin(content: string): Promise<GherkinAST> {
    try {
      return this.parser.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse Gherkin: ${error}`);
    }
  }

  async generateJUnitCode(
    ast: GherkinAST,
    config: GenerationConfig,
  ): Promise<string> {
    const { feature } = ast;
    const className = config.className || this.generateClassName(feature.name);
    const packageName = config.packageName || 'com.example.test';

    const imports = this.generateImports(config);
    const classAnnotations = this.generateClassAnnotations(config);
    const setupMethods = this.generateSetupMethods(feature);
    const testMethods = this.generateTestMethods(feature, config);
    const stepMethods = this.generateStepMethods(feature);

    const javaCode = `package ${packageName};

${imports}

${classAnnotations}
public class ${className} {

${setupMethods}

${testMethods}

${stepMethods}
}`;

    return this.formatJavaCode(javaCode);
  }

  async validateGeneration(code: string): Promise<ValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    if (!code.includes('package ')) {
      errors.push({
        message: 'Generated code must have a package declaration',
        code: 'MISSING_PACKAGE',
      });
    }

    if (
      !code.includes('@SpringBootTest') &&
      !code.includes('@WebMvcTest') &&
      !code.includes('@DataJpaTest')
    ) {
      warnings.push({
        message: 'Consider adding Spring Boot test annotations',
        code: 'MISSING_SPRING_ANNOTATIONS',
      });
    }

    if (!code.includes('@Test')) {
      errors.push({
        message: 'Generated code must have test methods',
        code: 'NO_TEST_METHODS',
      });
    }

    const braces = this.countBraces(code);
    if (braces.open !== braces.close) {
      errors.push({
        message: 'Unbalanced braces in generated code',
        code: 'UNBALANCED_BRACES',
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private generateImports(config: GenerationConfig): string {
    const defaultImports = [
      'import org.junit.jupiter.api.Test;',
      'import org.junit.jupiter.api.BeforeEach;',
      'import org.junit.jupiter.api.AfterEach;',
      'import org.springframework.boot.test.context.SpringBootTest;',
      'import org.springframework.test.context.ActiveProfiles;',
      'import static org.junit.jupiter.api.Assertions.*;',
    ];

    const springBootImports = [
      'import org.springframework.beans.factory.annotation.Autowired;',
      'import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;',
      'import org.springframework.transaction.annotation.Transactional;',
    ];

    if (config.springBootAnnotations.includes('@WebMvcTest')) {
      springBootImports.push(
        'import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;',
        'import org.springframework.test.web.servlet.MockMvc;',
        'import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;',
        'import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;',
      );
    }

    if (config.springBootAnnotations.includes('@DataJpaTest')) {
      springBootImports.push(
        'import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;',
        'import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;',
      );
    }

    const allImports = [...defaultImports, ...springBootImports];

    if (config.customImports) {
      allImports.push(...config.customImports);
    }

    return allImports.join('\n');
  }

  private generateClassAnnotations(config: GenerationConfig): string {
    const annotations = ['@SpringBootTest'];

    if (
      config.springBootAnnotations &&
      config.springBootAnnotations.length > 0
    ) {
      annotations.splice(0, 1, ...config.springBootAnnotations);
    }

    annotations.push('@ActiveProfiles("test")');
    annotations.push('@Transactional');

    return annotations.join('\n');
  }

  private generateSetupMethods(feature: GherkinFeature): string {
    const setupCode = `    private TestContext testContext;

    @BeforeEach
    void setUp() {
        testContext = new TestContext();
        // Initialize test data and mocks
        initializeTestEnvironment();
    }

    @AfterEach
    void tearDown() {
        // Cleanup test data
        cleanupTestEnvironment();
    }

    private void initializeTestEnvironment() {
        // Setup code for ${feature.name}
    }

    private void cleanupTestEnvironment() {
        // Cleanup code for ${feature.name}
    }`;

    return setupCode;
  }

  private generateTestMethods(
    feature: GherkinFeature,
    _config: GenerationConfig,
  ): string {
    const testMethods: string[] = [];

    feature.scenarios.forEach((scenario, index) => {
      const methodName = this.generateMethodName(scenario.name);
      const testMethod = this.generateTestMethod(scenario, methodName, index);
      testMethods.push(testMethod);
    });

    return testMethods.join('\n\n');
  }

  private generateTestMethod(
    scenario: GherkinScenario,
    methodName: string,
    _index: number,
  ): string {
    const tags = scenario.tags.length > 0 ? scenario.tags.join(', ') : '';
    const tagComment = tags ? `    // Tags: ${tags}\n` : '';

    let testCode = `${tagComment}    @Test
    void ${methodName}() {
        // ${scenario.name}
`;

    if (scenario.examples) {
      testCode += `        // This is a scenario outline - consider using @ParameterizedTest
        // Example data: ${JSON.stringify(scenario.examples.headers)}
`;
    }

    scenario.steps.forEach((step) => {
      const stepCall = this.generateStepCall(step);
      testCode += `        ${stepCall};\n`;
    });

    testCode += '    }';

    return testCode;
  }

  private generateStepCall(step: GherkinStep): string {
    const methodName = this.generateStepMethodName(step);

    if (step.dataTable) {
      return `${methodName}WithDataTable(${JSON.stringify(step.dataTable)})`;
    }
    if (step.docString) {
      return `${methodName}WithDocString("${step.docString.replace(/"/g, '\\"')}")`;
    }
    return `${methodName}()`;
  }

  private generateStepMethods(feature: GherkinFeature): string {
    const stepMethods = new Set<string>();

    const processSteps = (steps: GherkinStep[]) => {
      steps.forEach((step) => {
        const methodName = this.generateStepMethodName(step);
        const methodSignature = this.generateStepMethodSignature(
          step,
          methodName,
        );
        stepMethods.add(methodSignature);
      });
    };

    if (feature.background) {
      processSteps(feature.background.steps);
    }

    feature.scenarios.forEach((scenario) => {
      processSteps(scenario.steps);
    });

    return Array.from(stepMethods).join('\n\n');
  }

  private generateStepMethodSignature(
    step: GherkinStep,
    methodName: string,
  ): string {
    let signature = `    private void ${methodName}(`;
    const params: string[] = [];

    if (step.dataTable) {
      params.push('Object[][] dataTable');
      signature += `${params.join(', ')}) {
        // Implement: ${step.keyword} ${step.text}
        // Handle data table with ${step.dataTable.length} rows
        fail("Step implementation pending");
    }`;
    } else if (step.docString) {
      params.push('String docString');
      signature += `${params.join(', ')}) {
        // Implement: ${step.keyword} ${step.text}
        // Handle doc string content
        fail("Step implementation pending");
    }`;
    } else {
      signature += `) {
        // Implement: ${step.keyword} ${step.text}
        fail("Step implementation pending");
    }`;
    }

    return signature;
  }

  private generateClassName(featureName: string): string {
    return `${featureName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')}Test`;
  }

  private generateMethodName(scenarioName: string): string {
    return `test${scenarioName
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')}`;
  }

  private generateStepMethodName(step: GherkinStep): string {
    const prefix = step.keyword.toLowerCase();
    const text = step.text
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');

    return `${prefix}${text.charAt(0).toUpperCase()}${text.slice(1)}`;
  }

  private formatJavaCode(code: string): string {
    const lines = code.split('\n');
    const formatted: string[] = [];
    let indentLevel = 0;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.includes('}') && !trimmed.includes('{')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      if (trimmed.length > 0) {
        formatted.push('    '.repeat(indentLevel) + trimmed);
      } else {
        formatted.push('');
      }

      if (trimmed.includes('{') && !trimmed.includes('}')) {
        indentLevel++;
      }
    }

    return formatted.join('\n');
  }

  private countBraces(code: string): { open: number; close: number } {
    const open = (code.match(/\{/g) || []).length;
    const close = (code.match(/\}/g) || []).length;
    return { open, close };
  }

  generateSpringBootTestTemplate(
    testType: 'integration' | 'web' | 'data' = 'integration',
  ): string {
    switch (testType) {
      case 'web':
        return `@WebMvcTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)`;

      case 'data':
        return `@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)`;

      default:
        return `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)`;
    }
  }

  generateCucumberCompatibleCode(
    ast: GherkinAST,
    config: GenerationConfig,
  ): string {
    const { feature } = ast;
    const packageName = config.packageName || 'com.example.test.steps';

    return `package ${packageName};

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.And;
import io.cucumber.java.en.But;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class ${this.generateClassName(feature.name)}StepDefinitions {

${this.generateCucumberStepDefinitions(feature)}
}`;
  }

  private generateCucumberStepDefinitions(feature: GherkinFeature): string {
    const stepDefinitions = new Set<string>();

    const processSteps = (steps: GherkinStep[]) => {
      steps.forEach((step) => {
        const annotation = this.getCucumberAnnotation(step.keyword);
        const methodName = this.generateStepMethodName(step);
        const pattern = this.generateCucumberPattern(step.text);

        const stepDef = `    @${annotation}("${pattern}")
    public void ${methodName}() {
        // Implement: ${step.text}
        throw new io.cucumber.java.PendingException();
    }`;

        stepDefinitions.add(stepDef);
      });
    };

    if (feature.background) {
      processSteps(feature.background.steps);
    }

    feature.scenarios.forEach((scenario) => {
      processSteps(scenario.steps);
    });

    return Array.from(stepDefinitions).join('\n\n');
  }

  private getCucumberAnnotation(keyword: string): string {
    switch (keyword) {
      case 'And':
      case 'But':
        return 'Given'; // Default to Given for And/But steps
      default:
        return keyword;
    }
  }

  private generateCucumberPattern(stepText: string): string {
    return stepText
      .replace(/"/g, '\\"')
      .replace(/\d+/g, '(\\d+)')
      .replace(/\b[A-Z][a-z]+\b/g, '(.+)');
  }
}
