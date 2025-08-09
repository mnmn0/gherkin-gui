import { GherkinParser } from '../main/services/GherkinParser';

describe('GherkinParser', () => {
  let parser: GherkinParser;

  beforeEach(() => {
    parser = new GherkinParser();
  });

  describe('Basic Feature Parsing', () => {
    it('should parse a simple feature', () => {
      const content = `Feature: User Login
  As a user
  I want to login to the system
  So that I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to dashboard`;

      const ast = parser.parse(content);

      expect(ast.feature.name).toBe('User Login');
      expect(ast.feature.description).toContain('As a user');
      expect(ast.feature.scenarios).toHaveLength(1);
      expect(ast.feature.scenarios[0].name).toBe('Successful login');
      expect(ast.feature.scenarios[0].steps).toHaveLength(3);
    });

    it.skip('should parse feature with tags', () => {
      const content = `@authentication @smoke
Feature: User Login
  Login functionality

  @critical
  Scenario: Admin login
    Given I am admin user
    When I login
    Then I see admin dashboard`;

      const ast = parser.parse(content);

      expect(ast.feature.tags).toEqual(['@authentication', '@smoke']);
      expect(ast.feature.scenarios[0].tags).toEqual(['@critical']);
    });

    it('should parse feature with background', () => {
      const content = `Feature: User Management
  
  Background:
    Given the database is clean
    And test users are created

  Scenario: Create user
    Given I am on user creation page
    When I create a new user
    Then user is saved`;

      const ast = parser.parse(content);

      expect(ast.feature.background).toBeDefined();
      expect(ast.feature.background!.steps).toHaveLength(2);
      expect(ast.feature.background!.steps[0].keyword).toBe('Given');
      expect(ast.feature.background!.steps[0].text).toBe(
        'the database is clean',
      );
    });
  });

  describe('Scenario Parsing', () => {
    it('should parse multiple scenarios', () => {
      const content = `Feature: Test Feature

  Scenario: First scenario
    Given first condition
    When first action
    Then first result

  Scenario: Second scenario
    Given second condition
    When second action
    Then second result`;

      const ast = parser.parse(content);

      expect(ast.feature.scenarios).toHaveLength(2);
      expect(ast.feature.scenarios[0].name).toBe('First scenario');
      expect(ast.feature.scenarios[1].name).toBe('Second scenario');
    });

    it('should parse scenario with different step keywords', () => {
      const content = `Feature: Step Keywords

  Scenario: Test all keywords
    Given initial condition
    And another given condition
    When some action happens
    And another action happens
    Then expected result
    But not this result`;

      const ast = parser.parse(content);

      const { steps } = ast.feature.scenarios[0];
      expect(steps).toHaveLength(6);
      expect(steps[0].keyword).toBe('Given');
      expect(steps[1].keyword).toBe('And');
      expect(steps[2].keyword).toBe('When');
      expect(steps[3].keyword).toBe('And');
      expect(steps[4].keyword).toBe('Then');
      expect(steps[5].keyword).toBe('But');
    });
  });

  describe('Data Tables', () => {
    it('should parse steps with data tables', () => {
      const content = `Feature: Data Tables

  Scenario: User creation with data
    Given the following users exist:
      | name  | email           | role  |
      | Alice | alice@test.com  | admin |
      | Bob   | bob@test.com    | user  |
    When I list all users
    Then I should see 2 users`;

      const ast = parser.parse(content);

      const step = ast.feature.scenarios[0].steps[0];
      expect(step.dataTable).toBeDefined();
      expect(step.dataTable).toHaveLength(3);
      expect(step.dataTable![0]).toEqual(['name', 'email', 'role']);
      expect(step.dataTable![1]).toEqual(['Alice', 'alice@test.com', 'admin']);
    });
  });

  describe('Doc Strings', () => {
    it('should parse steps with doc strings using triple quotes', () => {
      const content = `Feature: Doc Strings

  Scenario: API request
    Given I send a POST request with body:
      """
      {
        "name": "John",
        "email": "john@test.com"
      }
      """
    When the request is processed
    Then I get success response`;

      const ast = parser.parse(content);

      const step = ast.feature.scenarios[0].steps[0];
      expect(step.docString).toBeDefined();
      expect(step.docString).toContain('"name": "John"');
      expect(step.docString).toContain('"email": "john@test.com"');
    });

    it('should parse steps with doc strings using single quotes', () => {
      const content = `Feature: Doc Strings

  Scenario: Text content
    Given I have the following text:
      '''
      This is a multi-line
      text content
      '''
    When I process it
    Then it should work`;

      const ast = parser.parse(content);

      const step = ast.feature.scenarios[0].steps[0];
      expect(step.docString).toBe('This is a multi-line\ntext content');
    });
  });

  describe('Scenario Outline', () => {
    it('should parse scenario outline with examples', () => {
      const content = `Feature: Login Tests

  Scenario Outline: Login with different users
    Given user <username> exists
    When I login with password <password>
    Then login result is <result>

    Examples:
      | username | password | result  |
      | admin    | admin123 | success |
      | user     | user123  | success |
      | guest    | wrong    | failure |`;

      const ast = parser.parse(content);

      const scenario = ast.feature.scenarios[0];
      expect(scenario.name).toBe('Login with different users');
      expect(scenario.examples).toBeDefined();
      expect(scenario.examples!.headers).toEqual([
        'username',
        'password',
        'result',
      ]);
      expect(scenario.examples!.rows).toHaveLength(3);
      expect(scenario.examples!.rows[0]).toEqual([
        'admin',
        'admin123',
        'success',
      ]);
    });
  });

  describe('Comments', () => {
    it('should extract comments from content', () => {
      const content = `# This is a comment
Feature: Test Feature
  # Another comment
  
  Scenario: Test scenario
    # Comment in scenario
    Given something
    # Comment after step
    When action
    Then result`;

      const ast = parser.parse(content);

      expect(ast.comments).toContain('# This is a comment');
      expect(ast.comments).toContain('# Another comment');
      expect(ast.comments).toContain('# Comment in scenario');
      expect(ast.comments).toContain('# Comment after step');
    });
  });

  describe('Formatting', () => {
    it('should format AST back to Gherkin', () => {
      const content = `@smoke
Feature: User Login
  Login functionality

  Background:
    Given system is ready

  @critical
  Scenario: Successful login
    Given I am on login page
    When I enter credentials
    Then I see dashboard

  Scenario Outline: Multiple logins
    Given user <user> exists
    When login with <password>
    Then result is <result>

    Examples:
      | user  | password | result  |
      | admin | pass123  | success |`;

      const ast = parser.parse(content);
      const formatted = parser.formatGherkin(ast);

      expect(formatted).toContain('@smoke');
      expect(formatted).toContain('Feature: User Login');
      expect(formatted).toContain('Background:');
      expect(formatted).toContain('@critical');
      expect(formatted).toContain('Scenario: Successful login');
      expect(formatted).toContain('Scenario Outline: Multiple logins');
      expect(formatted).toContain('Examples:');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for feature without name', () => {
      const content = `Feature:
  
  Scenario: Test
    Given something`;

      expect(() => parser.parse(content)).toThrow('Feature must have a name');
    });

    it('should handle empty content', () => {
      const content = '';

      expect(() => parser.parse(content)).toThrow('Feature must have a name');
    });

    it('should handle malformed Gherkin gracefully', () => {
      const content = `Feature: Test
  Some random text
  Scenario: Test
    Random step without keyword`;

      const ast = parser.parse(content);

      expect(ast.feature.name).toBe('Test');
      expect(ast.feature.scenarios).toHaveLength(1);
    });
  });

  describe('Validation', () => {
    it('should validate correct Gherkin syntax', () => {
      const content = `Feature: Valid Feature
  
  Scenario: Valid Scenario
    Given valid step
    When valid action
    Then valid result`;

      const result = parser.validate(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect syntax errors', () => {
      const content = `Scenario: No feature
    Given orphan step`;

      const result = parser.validate(content);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
