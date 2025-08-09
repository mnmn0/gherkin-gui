import { GenerationTemplate } from '../types';

export const DEFAULT_TEMPLATES: GenerationTemplate[] = [
  {
    id: 'spring-boot-integration-test',
    name: 'Spring Boot Integration Test',
    description: 'Full integration test with Spring Boot context',
    type: 'junit5',
    content: `package {{packageName}};

{{imports}}
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("{{testProfile}}")
@Transactional
public class {{className}} {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private {{serviceClass}} {{serviceInstance}};

    private TestContext testContext;

    @BeforeEach
    void setUp() {
        testContext = new TestContext();
        {{setupCode}}
    }

    @AfterEach
    void tearDown() {
        {{teardownCode}}
    }

{{testMethods}}

{{stepMethods}}

    private static class TestContext {
        // Test context variables
    }
}`,
    variables: [
      {
        name: 'packageName',
        type: 'string',
        description: 'Java package name for the test class',
        defaultValue: 'com.example.test',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Name of the test class',
      },
      {
        name: 'testProfile',
        type: 'string',
        description: 'Spring profile for testing',
        defaultValue: 'test',
      },
      {
        name: 'serviceClass',
        type: 'string',
        description: 'Main service class to test',
        defaultValue: 'ApplicationService',
      },
      {
        name: 'serviceInstance',
        type: 'string',
        description: 'Instance name for the service',
        defaultValue: 'applicationService',
      },
      {
        name: 'setupCode',
        type: 'string',
        description: 'Custom setup code',
        defaultValue: '// Initialize test data',
      },
      {
        name: 'teardownCode',
        type: 'string',
        description: 'Custom teardown code',
        defaultValue: '// Cleanup test data',
      },
    ],
    isDefault: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'spring-boot-webmvc-test',
    name: 'Spring Boot Web MVC Test',
    description: 'Web layer test using @WebMvcTest',
    type: 'junit5',
    content: `package {{packageName}};

{{imports}}
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.*;

@WebMvcTest({{controllerClass}}.class)
@ActiveProfiles("{{testProfile}}")
public class {{className}} {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private {{serviceClass}} {{serviceInstance}};

    private TestContext testContext;

    @BeforeEach
    void setUp() {
        testContext = new TestContext();
        {{setupCode}}
    }

{{testMethods}}

{{stepMethods}}

    private static class TestContext {
        private ObjectMapper objectMapper = new ObjectMapper();
        
        public String toJson(Object obj) throws Exception {
            return objectMapper.writeValueAsString(obj);
        }
    }
}`,
    variables: [
      {
        name: 'packageName',
        type: 'string',
        description: 'Java package name for the test class',
        defaultValue: 'com.example.web',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Name of the test class',
      },
      {
        name: 'controllerClass',
        type: 'string',
        description: 'Controller class to test',
        defaultValue: 'UserController',
      },
      {
        name: 'serviceClass',
        type: 'string',
        description: 'Service class to mock',
        defaultValue: 'UserService',
      },
      {
        name: 'serviceInstance',
        type: 'string',
        description: 'Instance name for the mocked service',
        defaultValue: 'userService',
      },
      {
        name: 'testProfile',
        type: 'string',
        description: 'Spring profile for testing',
        defaultValue: 'test',
      },
      {
        name: 'setupCode',
        type: 'string',
        description: 'Custom setup code for mocks',
        defaultValue: '// Setup mock behaviors',
      },
    ],
    isDefault: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'spring-boot-datajpa-test',
    name: 'Spring Boot Data JPA Test',
    description: 'Data layer test using @DataJpaTest',
    type: 'junit5',
    content: `package {{packageName}};

{{imports}}
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("{{testProfile}}")
public class {{className}} {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private {{repositoryClass}} {{repositoryInstance}};

    private TestContext testContext;

    @BeforeEach
    void setUp() {
        testContext = new TestContext();
        {{setupCode}}
    }

{{testMethods}}

{{stepMethods}}

    private static class TestContext {
        // Test data and utilities
    }
}`,
    variables: [
      {
        name: 'packageName',
        type: 'string',
        description: 'Java package name for the test class',
        defaultValue: 'com.example.repository',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Name of the test class',
      },
      {
        name: 'repositoryClass',
        type: 'string',
        description: 'Repository interface to test',
        defaultValue: 'UserRepository',
      },
      {
        name: 'repositoryInstance',
        type: 'string',
        description: 'Instance name for the repository',
        defaultValue: 'userRepository',
      },
      {
        name: 'testProfile',
        type: 'string',
        description: 'Spring profile for testing',
        defaultValue: 'test',
      },
      {
        name: 'setupCode',
        type: 'string',
        description: 'Custom setup code for test data',
        defaultValue: '// Setup test entities',
      },
    ],
    isDefault: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'cucumber-step-definitions',
    name: 'Cucumber Step Definitions',
    description: 'Cucumber step definitions with Spring Boot',
    type: 'cucumber',
    content: `package {{packageName}};

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.And;
import io.cucumber.java.en.But;
import io.cucumber.spring.CucumberContextConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@CucumberContextConfiguration
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("{{testProfile}}")
public class {{className}} {

    private TestContext testContext = new TestContext();

{{stepMethods}}

    private static class TestContext {
        // Shared test context across steps
    }
}`,
    variables: [
      {
        name: 'packageName',
        type: 'string',
        description: 'Java package name for step definitions',
        defaultValue: 'com.example.steps',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Name of the step definitions class',
      },
      {
        name: 'testProfile',
        type: 'string',
        description: 'Spring profile for testing',
        defaultValue: 'test',
      },
    ],
    isDefault: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'testcontainers-integration-test',
    name: 'TestContainers Integration Test',
    description: 'Integration test with TestContainers for database',
    type: 'junit5',
    content: `package {{packageName}};

{{imports}}
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("{{testProfile}}")
@Testcontainers
public class {{className}} {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("{{postgresVersion}}")
            .withDatabaseName("{{databaseName}}")
            .withUsername("{{dbUsername}}")
            .withPassword("{{dbPassword}}");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    private TestContext testContext;

    @BeforeEach
    void setUp() {
        testContext = new TestContext();
        {{setupCode}}
    }

{{testMethods}}

{{stepMethods}}

    private static class TestContext {
        // Test context with container support
    }
}`,
    variables: [
      {
        name: 'packageName',
        type: 'string',
        description: 'Java package name for the test class',
        defaultValue: 'com.example.integration',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Name of the test class',
      },
      {
        name: 'postgresVersion',
        type: 'string',
        description: 'PostgreSQL container version',
        defaultValue: 'postgres:15',
      },
      {
        name: 'databaseName',
        type: 'string',
        description: 'Test database name',
        defaultValue: 'testdb',
      },
      {
        name: 'dbUsername',
        type: 'string',
        description: 'Database username',
        defaultValue: 'testuser',
      },
      {
        name: 'dbPassword',
        type: 'string',
        description: 'Database password',
        defaultValue: 'testpass',
      },
      {
        name: 'testProfile',
        type: 'string',
        description: 'Spring profile for testing',
        defaultValue: 'integration-test',
      },
      {
        name: 'setupCode',
        type: 'string',
        description: 'Custom setup code',
        defaultValue: '// Initialize test data with containers',
      },
    ],
    isDefault: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
];

export class TemplateEngine {
  substituteVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(placeholder, value || '');
    }

    return result;
  }

  validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const placeholders = template.match(/\{\{[^}]+\}\}/g) || [];

    for (const placeholder of placeholders) {
      const variableName = placeholder.replace(/[{}]/g, '');
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(variableName)) {
        errors.push(`Invalid variable name: ${variableName}`);
      }
    }

    const unclosedBraces = template.match(/\{\{[^}]*$/g);
    if (unclosedBraces) {
      errors.push('Unclosed template braces found');
    }

    const unmatchedClosing = template.match(/[^{]\}\}/g);
    if (unmatchedClosing) {
      errors.push('Unmatched closing braces found');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  extractVariables(template: string): string[] {
    const matches = template.match(/\{\{([^}]+)\}\}/g) || [];
    return matches
      .map((match) => match.replace(/[{}]/g, ''))
      .filter((value, index, array) => array.indexOf(value) === index);
  }

  createTemplateFromGenerated(
    generatedCode: string,
    templateName: string,
  ): GenerationTemplate {
    const variablePattern =
      /\b(?:com\.example\.[a-z]+|UserService|UserController|test|TestClass)\b/g;
    const variables = new Set<string>();

    let template = generatedCode;

    template = template.replace(
      /package\s+(com\.example\.[a-z]+);/,
      (match, packageName) => {
        variables.add('packageName');
        return 'package {{packageName}};';
      },
    );

    template = template.replace(
      /public\s+class\s+([A-Z][a-zA-Z0-9]*)\s*\{/,
      (match, className) => {
        variables.add('className');
        return 'public class {{className}} {';
      },
    );

    template = template.replace(
      /@ActiveProfiles\("([^"]+)"\)/,
      (match, profile) => {
        variables.add('testProfile');
        return '@ActiveProfiles("{{testProfile}}")';
      },
    );

    const templateVariables = Array.from(variables).map((name) => ({
      name,
      type: 'string' as const,
      description: `${name} parameter`,
    }));

    return {
      id: `generated-${Date.now()}`,
      name: templateName,
      description: `Generated template: ${templateName}`,
      type: 'custom',
      content: template,
      variables: templateVariables,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export function getTemplateByName(
  name: string,
): GenerationTemplate | undefined {
  return DEFAULT_TEMPLATES.find((template) => template.name === name);
}

export function getTemplatesForSpringBootType(
  type: 'web' | 'data' | 'integration',
): GenerationTemplate[] {
  const typeKeywords = {
    web: ['WebMvcTest', 'MockMvc', 'Controller'],
    data: ['DataJpaTest', 'Repository', 'Entity'],
    integration: ['SpringBootTest', 'TestRestTemplate', 'Integration'],
  };

  const keywords = typeKeywords[type] || [];

  return DEFAULT_TEMPLATES.filter((template) =>
    keywords.some(
      (keyword) =>
        template.name.includes(keyword) ||
        template.description.includes(keyword) ||
        template.content.includes(keyword),
    ),
  );
}
