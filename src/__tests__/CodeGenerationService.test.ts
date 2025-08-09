import { CodeGenerationService } from '../main/services/CodeGenerationService';
import { GenerationConfig } from '../main/types';

describe('CodeGenerationService', () => {
  let service: CodeGenerationService;

  beforeEach(() => {
    service = new CodeGenerationService();
  });

  describe('Gherkin Parsing', () => {
    it('should parse Gherkin content', async () => {
      const content = `Feature: User Login
  Scenario: Successful login
    Given I am on login page
    When I enter valid credentials
    Then I should see dashboard`;

      const ast = await service.parseGherkin(content);

      expect(ast.feature.name).toBe('User Login');
      expect(ast.feature.scenarios).toHaveLength(1);
      expect(ast.feature.scenarios[0].steps).toHaveLength(3);
    });

    it('should throw error for invalid Gherkin', async () => {
      const invalidContent = 'Invalid Gherkin content';

      await expect(service.parseGherkin(invalidContent)).rejects.toThrow();
    });
  });

  describe('JUnit Code Generation', () => {
    it('should generate basic JUnit test code', async () => {
      const content = `Feature: User Login
  Scenario: Successful login
    Given I am on login page
    When I enter valid credentials
    Then I should see dashboard`;

      const config: GenerationConfig = {
        packageName: 'com.example.test',
        className: 'UserLoginTest',
        springBootAnnotations: ['@SpringBootTest'],
      };

      const ast = await service.parseGherkin(content);
      const code = await service.generateJUnitCode(ast, config);

      expect(code).toContain('package com.example.test;');
      expect(code).toContain('public class UserLoginTest');
      expect(code).toContain('@SpringBootTest');
      expect(code).toContain('@Test');
      expect(code).toContain('void testSuccessfulLogin()');
      expect(code).toContain('givenIAmOnLoginPage()');
      expect(code).toContain('whenIEnterValidCredentials()');
      expect(code).toContain('thenIShouldSeeDashboard()');
    });

    it('should generate code with WebMvcTest annotation', async () => {
      const content = `Feature: API Tests
  Scenario: Get user endpoint
    Given the API is running
    When I call GET /users
    Then I get 200 response`;

      const config: GenerationConfig = {
        packageName: 'com.example.web',
        className: 'ApiTest',
        springBootAnnotations: ['@WebMvcTest'],
      };

      const ast = await service.parseGherkin(content);
      const code = await service.generateJUnitCode(ast, config);

      expect(code).toContain('@WebMvcTest');
      expect(code).toContain('MockMvc');
    });

    it('should generate code with DataJpaTest annotation', async () => {
      const content = `Feature: Database Tests
  Scenario: Save user
    Given a user entity
    When I save the user
    Then the user is persisted`;

      const config: GenerationConfig = {
        packageName: 'com.example.data',
        className: 'DatabaseTest',
        springBootAnnotations: ['@DataJpaTest'],
      };

      const ast = await service.parseGherkin(content);
      const code = await service.generateJUnitCode(ast, config);

      expect(code).toContain('@DataJpaTest');
      expect(code).toContain('TestEntityManager');
    });

    it('should handle scenarios with data tables', async () => {
      const content = `Feature: User Management
  Scenario: Create multiple users
    Given the following users:
      | name  | email           |
      | Alice | alice@test.com  |
      | Bob   | bob@test.com    |
    When I create the users
    Then all users are saved`;

      const config: GenerationConfig = {
        packageName: 'com.example.test',
        className: 'UserManagementTest',
        springBootAnnotations: ['@SpringBootTest'],
      };

      const ast = await service.parseGherkin(content);
      const code = await service.generateJUnitCode(ast, config);

      expect(code).toContain('givenTheFollowingUsersWithDataTable');
      expect(code).toContain('Object[][] dataTable');
      expect(code).toContain('Handle data table with 3 rows');
    });

    it('should handle scenarios with doc strings', async () => {
      const content = `Feature: API Request
  Scenario: POST request with JSON
    Given I have request body:
      """
      {
        "name": "John",
        "email": "john@test.com"
      }
      """
    When I send POST request
    Then I get success response`;

      const config: GenerationConfig = {
        packageName: 'com.example.test',
        className: 'ApiRequestTest',
        springBootAnnotations: ['@SpringBootTest'],
      };

      const ast = await service.parseGherkin(content);
      const code = await service.generateJUnitCode(ast, config);

      expect(code).toContain('givenIHaveRequestBodyWithDocString');
      expect(code).toContain('String docString');
      expect(code).toContain('Handle doc string content');
    });

    it('should handle background steps', async () => {
      const content = `Feature: User Operations
  Background:
    Given the system is initialized
    And test data is loaded
    
  Scenario: Get user
    When I request user details
    Then I get user information`;

      const config: GenerationConfig = {
        packageName: 'com.example.test',
        className: 'UserOperationsTest',
        springBootAnnotations: ['@SpringBootTest'],
      };

      const ast = await service.parseGherkin(content);
      const code = await service.generateJUnitCode(ast, config);

      expect(code).toContain('givenTheSystemIsInitialized');
      expect(code).toContain('andTestDataIsLoaded');
    });

    it('should generate proper class names from feature names', async () => {
      const content = `Feature: Complex Feature Name With Special Characters!
  Scenario: Test scenario
    Given something`;

      const config: GenerationConfig = {
        packageName: 'com.example.test',
        className: '', // Let it auto-generate
        springBootAnnotations: ['@SpringBootTest'],
      };

      const ast = await service.parseGherkin(content);
      const code = await service.generateJUnitCode(ast, config);

      expect(code).toContain(
        'public class ComplexFeatureNameWithSpecialCharactersTest',
      );
    });

    it('should include custom imports', async () => {
      const content = `Feature: Custom Test
  Scenario: Test with custom imports
    Given something`;

      const config: GenerationConfig = {
        packageName: 'com.example.test',
        className: 'CustomTest',
        springBootAnnotations: ['@SpringBootTest'],
        customImports: [
          'import com.example.CustomService;',
          'import static com.example.TestUtils.*;',
        ],
      };

      const ast = await service.parseGherkin(content);
      const code = await service.generateJUnitCode(ast, config);

      expect(code).toContain('import com.example.CustomService;');
      expect(code).toContain('import static com.example.TestUtils.*;');
    });
  });

  describe('Code Validation', () => {
    it('should validate correct generated code', async () => {
      const validCode = `package com.example.test;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class TestClass {
    @Test
    void testMethod() {
        // test implementation
    }
}`;

      const result = await service.validateGeneration(validCode);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing package declaration', async () => {
      const invalidCode = `import org.junit.jupiter.api.Test;

@SpringBootTest
public class TestClass {
    @Test
    void testMethod() {}
}`;

      const result = await service.validateGeneration(invalidCode);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_PACKAGE',
        }),
      );
    });

    it('should detect missing test methods', async () => {
      const invalidCode = `package com.example.test;

import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class TestClass {
    void nonTestMethod() {}
}`;

      const result = await service.validateGeneration(invalidCode);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'NO_TEST_METHODS',
        }),
      );
    });

    it('should detect unbalanced braces', async () => {
      const invalidCode = `package com.example.test;

import org.junit.jupiter.api.Test;

public class TestClass {
    @Test
    void testMethod() {
        // missing closing brace
}`;

      const result = await service.validateGeneration(invalidCode);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'UNBALANCED_BRACES',
        }),
      );
    });

    it('should warn about missing Spring annotations', async () => {
      const codeWithoutSpring = `package com.example.test;

import org.junit.jupiter.api.Test;

public class TestClass {
    @Test
    void testMethod() {}
}`;

      const result = await service.validateGeneration(codeWithoutSpring);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          code: 'MISSING_SPRING_ANNOTATIONS',
        }),
      );
    });
  });

  describe('Cucumber Code Generation', () => {
    it('should generate Cucumber step definitions', async () => {
      const content = `Feature: User Login
  Scenario: Successful login
    Given I am on login page
    When I enter valid credentials
    Then I should see dashboard`;

      const config: GenerationConfig = {
        packageName: 'com.example.steps',
        className: 'UserLoginTest',
        springBootAnnotations: ['@SpringBootTest'],
      };

      const ast = await service.parseGherkin(content);
      const code = service.generateCucumberCompatibleCode(ast, config);

      expect(code).toContain('package com.example.steps;');
      expect(code).toContain('import io.cucumber.java.en.Given;');
      expect(code).toContain('import io.cucumber.java.en.When;');
      expect(code).toContain('import io.cucumber.java.en.Then;');
      expect(code).toContain('@Given("I am on login page")');
      expect(code).toContain('@When("I enter valid credentials")');
      expect(code).toContain('@Then("I should see dashboard")');
      expect(code).toContain('PendingException()');
    });

    it('should handle parameterized steps', async () => {
      const content = `Feature: User Management
  Scenario: Create user with name
    Given I have user "John Doe" with age 25
    When I create the user
    Then the user should be saved`;

      const config: GenerationConfig = {
        packageName: 'com.example.steps',
        className: 'UserManagementTest',
        springBootAnnotations: ['@SpringBootTest'],
      };

      const ast = await service.parseGherkin(content);
      const code = service.generateCucumberCompatibleCode(ast, config);

      expect(code).toContain('@Given("I have user (.+) with age (\\\\d+)")');
    });
  });

  describe('Template Generation', () => {
    it('should generate integration test template', () => {
      const template = service.generateSpringBootTestTemplate('integration');

      expect(template).toContain('@SpringBootTest');
      expect(template).toContain('WebEnvironment.RANDOM_PORT');
      expect(template).toContain('@AutoConfigureTestDatabase');
    });

    it('should generate web test template', () => {
      const template = service.generateSpringBootTestTemplate('web');

      expect(template).toContain('@WebMvcTest');
      expect(template).toContain('@AutoConfigureTestDatabase');
    });

    it('should generate data test template', () => {
      const template = service.generateSpringBootTestTemplate('data');

      expect(template).toContain('@DataJpaTest');
      expect(template).toContain('@AutoConfigureTestDatabase');
    });
  });
});
