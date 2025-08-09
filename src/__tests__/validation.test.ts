import {
  GherkinValidator,
  TestConfigValidator,
  ProjectConfigValidator,
  validateGherkinSyntax,
} from '../main/utils/validation';
import { GherkinFeature, TestConfig, ProjectConfig } from '../main/types';

describe('GherkinValidator', () => {
  let validator: GherkinValidator;

  beforeEach(() => {
    validator = new GherkinValidator();
  });

  describe('validateFeature', () => {
    it('should validate a valid feature', () => {
      const feature: GherkinFeature = {
        name: 'User Login',
        description: 'Test user login functionality',
        scenarios: [
          {
            name: 'Successful login',
            steps: [
              { keyword: 'Given', text: 'user is on login page' },
              { keyword: 'When', text: 'user enters valid credentials' },
              { keyword: 'Then', text: 'user is redirected to dashboard' },
            ],
            tags: ['@smoke'],
          },
        ],
        tags: ['@authentication'],
      };

      const result = validator.validateFeature(feature);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing feature name', () => {
      const feature: GherkinFeature = {
        name: '',
        scenarios: [],
        tags: [],
      };

      const result = validator.validateFeature(feature);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_FEATURE_NAME',
        }),
      );
    });

    it('should warn about feature with no scenarios', () => {
      const feature: GherkinFeature = {
        name: 'Empty Feature',
        scenarios: [],
        tags: [],
      };

      const result = validator.validateFeature(feature);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'NO_SCENARIOS',
        }),
      );
    });

    it('should validate scenario with examples', () => {
      const feature: GherkinFeature = {
        name: 'Login Tests',
        scenarios: [
          {
            name: 'Login with different users',
            steps: [
              { keyword: 'Given', text: 'user <username> exists' },
              { keyword: 'When', text: 'login with password <password>' },
              { keyword: 'Then', text: 'result is <result>' },
            ],
            tags: [],
            examples: {
              headers: ['username', 'password', 'result'],
              rows: [
                ['admin', 'admin123', 'success'],
                ['user', 'user123', 'success'],
              ],
            },
          },
        ],
        tags: [],
      };

      const result = validator.validateFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should detect column mismatch in examples', () => {
      const feature: GherkinFeature = {
        name: 'Login Tests',
        scenarios: [
          {
            name: 'Login with different users',
            steps: [{ keyword: 'Given', text: 'user exists' }],
            tags: [],
            examples: {
              headers: ['username', 'password'],
              rows: [['admin'], ['user', 'pass', 'extra']],
            },
          },
        ],
        tags: [],
      };

      const result = validator.validateFeature(feature);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'EXAMPLE_COLUMN_MISMATCH',
        }),
      );
    });

    it('should validate background steps', () => {
      const feature: GherkinFeature = {
        name: 'User Management',
        background: {
          steps: [
            { keyword: 'Given', text: 'database is clean' },
            { keyword: 'Given', text: 'test users are created' },
          ],
        },
        scenarios: [
          {
            name: 'Create user',
            steps: [
              { keyword: 'When', text: 'admin creates a new user' },
              { keyword: 'Then', text: 'user is saved' },
            ],
            tags: [],
          },
        ],
        tags: [],
      };

      const result = validator.validateFeature(feature);
      expect(result.valid).toBe(true);
    });

    it('should warn about When/Then in background', () => {
      const feature: GherkinFeature = {
        name: 'User Management',
        background: {
          steps: [
            { keyword: 'Given', text: 'database is clean' },
            { keyword: 'When', text: 'something happens' },
          ],
        },
        scenarios: [],
        tags: [],
      };

      const result = validator.validateFeature(feature);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'BACKGROUND_INVALID_KEYWORDS',
        }),
      );
    });
  });
});

describe('TestConfigValidator', () => {
  let validator: TestConfigValidator;

  beforeEach(() => {
    validator = new TestConfigValidator();
  });

  it('should validate a valid test config', () => {
    const config: TestConfig = {
      specificationPath: '/path/to/spec.feature',
      javaClasspath: ['/path/to/classes'],
      springProfiles: ['test'],
      jvmArgs: ['-Xmx512m'],
      environmentVars: { SPRING_PROFILES_ACTIVE: 'test' },
      buildTool: 'maven',
      buildFilePath: '/path/to/pom.xml',
    };

    const result = validator.validateTestConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing required fields', () => {
    const config = {} as TestConfig;

    const result = validator.validateTestConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_SPEC_PATH',
      }),
    );
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_BUILD_TOOL',
      }),
    );
  });

  it('should detect invalid build tool', () => {
    const config: TestConfig = {
      specificationPath: '/path/to/spec.feature',
      javaClasspath: [],
      springProfiles: [],
      jvmArgs: [],
      environmentVars: {},
      buildTool: 'ant' as any,
      buildFilePath: '/path/to/build.xml',
    };

    const result = validator.validateTestConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_BUILD_TOOL',
      }),
    );
  });
});

describe('ProjectConfigValidator', () => {
  let validator: ProjectConfigValidator;

  beforeEach(() => {
    validator = new ProjectConfigValidator();
  });

  it('should validate a valid project config', () => {
    const config: ProjectConfig = {
      projectName: 'My Spring Boot App',
      specificationDirectory: '.gherkin/spec',
      reportDirectory: '.gherkin/report',
      testConfiguration: {
        buildTool: 'maven',
        javaVersion: '11',
        testFramework: 'junit5',
        springBootVersion: '3.0.0',
      },
    };

    const result = validator.validateProjectConfig(config);
    expect(result.valid).toBe(true);
  });

  it('should detect missing required fields', () => {
    const config = {} as ProjectConfig;

    const result = validator.validateProjectConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_PROJECT_NAME',
      }),
    );
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'MISSING_SPEC_DIRECTORY',
      }),
    );
  });

  it('should validate project config with minimal fields', () => {
    const config: ProjectConfig = {
      projectName: 'Test Project',
      specificationDirectory: '.gherkin/spec',
      reportDirectory: '.gherkin/report',
      testConfiguration: {
        buildTool: 'maven',
        javaVersion: '11',
        testFramework: 'junit5',
        springBootVersion: '3.0.0',
      },
    };

    const result = validator.validateProjectConfig(config);
    expect(result.valid).toBe(true);
    expect(result.valid).toBe(true);
  });
});

describe('validateGherkinSyntax', () => {
  it('should validate valid Gherkin syntax', () => {
    const content = `Feature: User Login
      As a user
      I want to login
      
      Scenario: Successful login
        Given user is on login page
        When user enters valid credentials
        Then user is redirected to dashboard`;

    const result = validateGherkinSyntax(content);
    expect(result.valid).toBe(true);
  });

  it('should detect missing feature', () => {
    const content = `Scenario: Some test
      Given something
      When action
      Then result`;

    const result = validateGherkinSyntax(content);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'NO_FEATURE',
      }),
    );
  });

  it('should detect orphan steps', () => {
    const content = `Feature: Test Feature
      Given this is an orphan step
      
      Scenario: Valid scenario
        Given valid step
        When valid action
        Then valid result`;

    const result = validateGherkinSyntax(content);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'ORPHAN_STEP',
      }),
    );
  });

  it('should detect background after scenario', () => {
    const content = `Feature: Test Feature
      
      Scenario: First scenario
        Given step
        
      Background:
        Given background step`;

    const result = validateGherkinSyntax(content);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: 'BACKGROUND_POSITION',
      }),
    );
  });

  it('should validate scenario outline with examples', () => {
    const content = `Feature: Login Tests
      
      Scenario Outline: Login with different users
        Given user <username> exists
        When login with password <password>
        Then result is <result>
        
      Examples:
        | username | password | result  |
        | admin    | admin123 | success |
        | user     | user123  | success |`;

    const result = validateGherkinSyntax(content);
    expect(result.valid).toBe(true);
  });
});
