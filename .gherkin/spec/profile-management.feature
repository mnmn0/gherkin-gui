Feature: Profile Management
  Scenario: Update profile
    Given I am logged in
    When I update my profile
    Then changes should be saved