@integration @user-management
Feature: User Account Management
  As a system administrator
  I want to manage user accounts
  So that I can control system access

  Background:
    Given the user management system is initialized
    And the database is connected
    And I am logged in as an administrator

  @smoke @critical
  Scenario: Create a new user account
    Given I am on the user management page
    And I have administrator privileges
    When I click the "Create User" button
    And I fill in the user details:
      | Field     | Value           |
      | Username  | john.doe        |
      | Email     | john@example.com|
      | Role      | USER            |
      | Status    | ACTIVE          |
    And I click the "Save" button
    Then the user account should be created successfully
    And I should see a confirmation message "User created successfully"
    And the user should appear in the user list
    And an email notification should be sent to john@example.com

  @data-validation
  Scenario: Validate user input during creation
    Given I am on the user creation form
    When I submit the form with invalid data:
      | Field     | Value   | Error Message              |
      | Username  |         | Username is required       |
      | Email     | invalid | Please enter a valid email |
      | Role      |         | Role must be selected      |
    Then I should see the appropriate error messages
    And the form should not be submitted

  @security @authorization
  Scenario: Unauthorized access to user management
    Given I am not logged in as an administrator
    When I try to access the user management page
    Then I should be redirected to the login page
    And I should see an error message "Insufficient privileges"

  Scenario Outline: Create users with different roles
    Given I am on the user creation form
    When I create a user with role "<role>"
    And I set the status to "<status>"
    Then the user should be created with "<expectedPermissions>" permissions
    And the user should have "<accessLevel>" access level

    Examples:
      | role       | status   | expectedPermissions | accessLevel |
      | ADMIN      | ACTIVE   | FULL               | HIGH        |
      | USER       | ACTIVE   | LIMITED            | MEDIUM      |
      | VIEWER     | ACTIVE   | READ_ONLY          | LOW         |
      | ADMIN      | INACTIVE | NONE               | NONE        |