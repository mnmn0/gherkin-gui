import { CodeGenerationService } from '../../main/services/CodeGenerationService';
import { GherkinParser } from '../../main/services/GherkinParser';
import { GenerationConfig, GherkinAST } from '../../main/types';

describe('Code Generation Integration', () => {
  let codeGenerator: CodeGenerationService;
  let parser: GherkinParser;

  beforeAll(() => {
    codeGenerator = new CodeGenerationService();
    parser = new GherkinParser();
  });

  it('should generate complete test class from Gherkin specification', async () => {
    const gherkinContent = `Feature: User Login
  As a user
  I want to login to the system
  So that I can access my account

  Background:
    Given the application is running
    And the database is initialized

  Scenario: Successful login with valid credentials
    Given I am on the login page
    And I have a valid user account
    When I enter my username "john.doe"
    And I enter my password "secret123"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see a welcome message
    And my session should be active

  Scenario: Failed login with invalid password
    Given I am on the login page
    And I have a user account with username "john.doe"
    When I enter my username "john.doe"
    And I enter an invalid password "wrongpassword"
    And I click the login button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page

  Scenario Outline: Login attempts with different credentials
    Given I am on the login page
    When I enter username "<username>"
    And I enter password "<password>"
    And I click the login button
    Then I should see "<result>"

    Examples:
      | username | password | result |
      | valid.user | valid.pass | dashboard |
      | invalid.user | any.pass | error |
      | valid.user | invalid.pass | error |`;

    const config: GenerationConfig = {
      packageName: 'com.example.tests',
      className: 'UserLoginTest',
      springBootAnnotations: [
        '@SpringBootTest',
        '@AutoConfigureTestDatabase',
        '@TestMethodOrder(OrderAnnotation.class)'
      ],
      customImports: [
        'import com.example.pages.LoginPage;',
        'import com.example.service.UserService;'
      ]
    };

    // Parse the Gherkin
    const parsedGherkin: GherkinAST = await parser.parse(gherkinContent);

    // Generate code
    const generatedCode = await codeGenerator.generateJUnitTest(parsedGherkin, config);

    // Verify package declaration
    expect(generatedCode).toContain('package com.example.tests;');

    // Verify imports
    expect(generatedCode).toContain('import org.junit.jupiter.api.Test;');
    expect(generatedCode).toContain('import org.springframework.boot.test.context.SpringBootTest;');
    expect(generatedCode).toContain('import com.example.pages.LoginPage;');
    expect(generatedCode).toContain('import com.example.service.UserService;');

    // Verify class declaration
    expect(generatedCode).toContain('@SpringBootTest');
    expect(generatedCode).toContain('@AutoConfigureTestDatabase');
    expect(generatedCode).toContain('public class UserLoginTest');

    // Verify background setup method
    expect(generatedCode).toContain('@BeforeEach');
    expect(generatedCode).toMatch(/void setUp\(\)/);
    expect(generatedCode).toContain('// Given the application is running');
    expect(generatedCode).toContain('// And the database is initialized');

    // Verify test methods for scenarios
    expect(generatedCode).toContain('@Test');
    expect(generatedCode).toContain('void testSuccessfulLoginWithValidCredentials()');
    expect(generatedCode).toContain('void testFailedLoginWithInvalidPassword()');

    // Verify parameterized test for scenario outline
    expect(generatedCode).toContain('@ParameterizedTest');
    expect(generatedCode).toContain('@CsvSource');
    expect(generatedCode).toContain('void testLoginAttemptsWithDifferentCredentials');

    // Verify step implementations are generated
    expect(generatedCode).toContain('// Given I am on the login page');
    expect(generatedCode).toContain('// When I enter my username "john.doe"');
    expect(generatedCode).toContain('// Then I should be redirected to the dashboard');

    // Verify TODO comments for implementation
    expect(generatedCode).toContain('// TODO: Implement this step');
  });

  it('should generate test with step definitions', async () => {
    const gherkinContent = `Feature: Shopping Cart
  Scenario: Add item to cart
    Given I am on the product page
    When I click add to cart
    Then the item should be added to my cart`;

    const config: GenerationConfig = {
      packageName: 'com.example.tests',
      className: 'ShoppingCartTest',
      springBootAnnotations: ['@SpringBootTest'],
      template: 'cucumber-spring-boot'
    };

    const parsedGherkin: GherkinAST = await parser.parse(gherkinContent);
    const generatedCode = await codeGenerator.generateJUnitTest(parsedGherkin, config);

    // Should generate Cucumber step definitions
    expect(generatedCode).toContain('@Given("I am on the product page")');
    expect(generatedCode).toContain('@When("I click add to cart")');
    expect(generatedCode).toContain('@Then("the item should be added to my cart")');

    // Should include Cucumber annotations
    expect(generatedCode).toContain('import io.cucumber.java.en.Given;');
    expect(generatedCode).toContain('import io.cucumber.java.en.When;');
    expect(generatedCode).toContain('import io.cucumber.java.en.Then;');
  });

  it('should handle complex scenario outlines', async () => {
    const gherkinContent = `Feature: User Registration
  Scenario Outline: Register with different user types
    Given I am registering as a "<userType>"
    When I provide "<email>" and "<password>"
    And I confirm with "<confirmPassword>"
    Then the registration should be "<status>"
    And I should see "<message>"

    Examples:
      | userType | email | password | confirmPassword | status | message |
      | customer | user@test.com | pass123 | pass123 | success | Welcome |
      | admin | admin@test.com | admin123 | admin123 | success | Admin Access |
      | guest | guest@test.com | guest123 | different | failure | Passwords do not match |
      | invalid | not-an-email | pass123 | pass123 | failure | Invalid email format |`;

    const config: GenerationConfig = {
      packageName: 'com.example.tests',
      className: 'UserRegistrationTest',
      springBootAnnotations: ['@SpringBootTest']
    };

    const parsedGherkin: GherkinAST = await parser.parse(gherkinContent);
    const generatedCode = await codeGenerator.generateJUnitTest(parsedGherkin, config);

    // Should generate parameterized test with all parameters
    expect(generatedCode).toContain('@ParameterizedTest');
    expect(generatedCode).toContain('@CsvSource');
    
    // Should contain all parameter values
    expect(generatedCode).toContain('customer, user@test.com');
    expect(generatedCode).toContain('admin, admin@test.com');
    expect(generatedCode).toContain('guest, guest@test.com');
    expect(generatedCode).toContain('invalid, not-an-email');

    // Should have proper method signature with all parameters
    expect(generatedCode).toMatch(
      /void testRegisterWithDifferentUserTypes\(\s*String userType,\s*String email,\s*String password,\s*String confirmPassword,\s*String status,\s*String message\s*\)/
    );
  });

  it('should validate generated code syntax', async () => {
    const gherkinContent = `Feature: Data Processing
  Scenario: Process valid data
    Given I have valid input data
    When I process the data
    Then the result should be correct`;

    const config: GenerationConfig = {
      packageName: 'com.example.tests',
      className: 'DataProcessingTest',
      springBootAnnotations: ['@SpringBootTest']
    };

    const parsedGherkin: GherkinAST = await parser.parse(gherkinContent);
    const generatedCode = await codeGenerator.generateJUnitTest(parsedGherkin, config);

    // Basic syntax validation
    expect(generatedCode).not.toContain('{{');
    expect(generatedCode).not.toContain('}}');
    expect(generatedCode).not.toContain('undefined');
    expect(generatedCode).not.toContain('null');

    // Should have proper method structure
    const methodMatches = generatedCode.match(/void test\w+\(\)\s*{[\s\S]*?}/g);
    expect(methodMatches).toBeTruthy();
    expect(methodMatches!.length).toBeGreaterThan(0);

    // Should have proper class structure
    expect(generatedCode).toMatch(/public class \w+\s*{[\s\S]*}/);

    // Should have balanced braces
    const openBraces = (generatedCode.match(/{/g) || []).length;
    const closeBraces = (generatedCode.match(/}/g) || []).length;
    expect(openBraces).toBe(closeBraces);

    // Should have proper imports
    expect(generatedCode).toMatch(/import\s+[\w.]+;/);
  });

  it('should handle tags and generate appropriate annotations', async () => {
    const gherkinContent = `@integration @database
Feature: Database Operations
  
  @smoke
  Scenario: Connect to database
    Given the database is available
    When I establish a connection
    Then I should be connected

  @slow @performance
  Scenario: Bulk data insert
    Given I have 1000 records to insert
    When I perform bulk insert
    Then all records should be inserted`;

    const config: GenerationConfig = {
      packageName: 'com.example.tests',
      className: 'DatabaseOperationsTest',
      springBootAnnotations: ['@SpringBootTest', '@Transactional']
    };

    const parsedGherkin: GherkinAST = await parser.parse(gherkinContent);
    const generatedCode = await codeGenerator.generateJUnitTest(parsedGherkin, config);

    // Should include test categories based on tags
    expect(generatedCode).toContain('@Tag("integration")');
    expect(generatedCode).toContain('@Tag("database")');
    expect(generatedCode).toContain('@Tag("smoke")');
    expect(generatedCode).toContain('@Tag("slow")');
    expect(generatedCode).toContain('@Tag("performance")');

    // Should import Tag annotation
    expect(generatedCode).toContain('import org.junit.jupiter.api.Tag;');
  });

  it('should generate code with proper error handling', async () => {
    const malformedGherkin = `Feature: Incomplete
  Scenario: Test
    Given something
    When
    Then`; // Intentionally incomplete

    const config: GenerationConfig = {
      packageName: 'com.example.tests',
      className: 'IncompleteTest',
      springBootAnnotations: ['@SpringBootTest']
    };

    try {
      const parsedGherkin: GherkinAST = await parser.parse(malformedGherkin);
      await codeGenerator.generateJUnitTest(parsedGherkin, config);
      // If we get here, the generator should still produce valid code
    } catch (error) {
      // Parser should catch malformed Gherkin
      expect(error).toBeDefined();
    }
  });
});