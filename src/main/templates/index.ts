import { CodeTemplate } from '../types';

export const DEFAULT_TEMPLATES: CodeTemplate[] = [
  {
    name: 'Spring Boot Integration Test',
    description: 'Full integration test with Spring Boot context',
    template: `package {{packageName}};

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
        description: 'Java package name for the test class',
        defaultValue: 'com.example.test',
        required: true,
      },
      {
        name: 'className',
        description: 'Name of the test class',
        required: true,
      },
      {
        name: 'testProfile',
        description: 'Spring profile for testing',
        defaultValue: 'test',
        required: false,
      },
      {
        name: 'serviceClass',
        description: 'Main service class to test',
        defaultValue: 'ApplicationService',
        required: false,
      },
      {
        name: 'serviceInstance',
        description: 'Instance name for the service',
        defaultValue: 'applicationService',
        required: false,
      },
      {
        name: 'setupCode',
        description: 'Custom setup code',
        defaultValue: '// Initialize test data',
        required: false,
      },
      {
        name: 'teardownCode',
        description: 'Custom teardown code',
        defaultValue: '// Cleanup test data',
        required: false,
      },
    ],
  },
  {
    name: 'Spring Boot Web MVC Test',
    description: 'Web layer test using @WebMvcTest',
    template: `package {{packageName}};

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
        description: 'Java package name for the test class',
        defaultValue: 'com.example.web',
        required: true,
      },
      {
        name: 'className',
        description: 'Name of the test class',
        required: true,
      },
      {
        name: 'controllerClass',
        description: 'Controller class to test',
        defaultValue: 'UserController',
        required: true,
      },
      {
        name: 'serviceClass',
        description: 'Service class to mock',
        defaultValue: 'UserService',
        required: true,
      },
      {
        name: 'serviceInstance',
        description: 'Instance name for the mocked service',
        defaultValue: 'userService',
        required: false,
      },
      {
        name: 'testProfile',
        description: 'Spring profile for testing',
        defaultValue: 'test',
        required: false,
      },
      {
        name: 'setupCode',
        description: 'Custom setup code for mocks',
        defaultValue: '// Setup mock behaviors',
        required: false,
      },
    ],
  },
  {
    name: 'Spring Boot Data JPA Test',
    description: 'Data layer test using @DataJpaTest',
    template: `package {{packageName}};

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
        description: 'Java package name for the test class',
        defaultValue: 'com.example.repository',
        required: true,
      },
      {
        name: 'className',
        description: 'Name of the test class',
        required: true,
      },
      {
        name: 'repositoryClass',
        description: 'Repository interface to test',
        defaultValue: 'UserRepository',
        required: true,
      },
      {
        name: 'repositoryInstance',
        description: 'Instance name for the repository',
        defaultValue: 'userRepository',
        required: false,
      },
      {
        name: 'testProfile',
        description: 'Spring profile for testing',
        defaultValue: 'test',
        required: false,
      },
      {
        name: 'setupCode',
        description: 'Custom setup code for test data',
        defaultValue: '// Setup test entities',
        required: false,
      },
    ],
  },
  {
    name: 'Cucumber Step Definitions',
    description: 'Cucumber step definitions with Spring Boot',
    template: `package {{packageName}};

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
        description: 'Java package name for step definitions',
        defaultValue: 'com.example.steps',
        required: true,
      },
      {
        name: 'className',
        description: 'Name of the step definitions class',
        required: true,
      },
      {
        name: 'testProfile',
        description: 'Spring profile for testing',
        defaultValue: 'test',
        required: false,
      },
    ],
  },
  {
    name: 'TestContainers Integration Test',
    description: 'Integration test with TestContainers for database',
    template: `package {{packageName}};

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
        description: 'Java package name for the test class',
        defaultValue: 'com.example.integration',
        required: true,
      },
      {
        name: 'className',
        description: 'Name of the test class',
        required: true,
      },
      {
        name: 'postgresVersion',
        description: 'PostgreSQL container version',
        defaultValue: 'postgres:15',
        required: false,
      },
      {
        name: 'databaseName',
        description: 'Test database name',
        defaultValue: 'testdb',
        required: false,
      },
      {
        name: 'dbUsername',
        description: 'Database username',
        defaultValue: 'testuser',
        required: false,
      },
      {
        name: 'dbPassword',
        description: 'Database password',
        defaultValue: 'testpass',
        required: false,
      },
      {
        name: 'testProfile',
        description: 'Spring profile for testing',
        defaultValue: 'integration-test',
        required: false,
      },
      {
        name: 'setupCode',
        description: 'Custom setup code',
        defaultValue: '// Initialize test data with containers',
        required: false,
      },
    ],
  },
];

export class TemplateEngine {
  substituteVariables(template: string, variables: Record<string, string>): string {
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
      .map(match => match.replace(/[{}]/g, ''))
      .filter((value, index, array) => array.indexOf(value) === index);
  }

  createTemplateFromGenerated(generatedCode: string, templateName: string): CodeTemplate {
    const variablePattern = /\b(?:com\.example\.[a-z]+|UserService|UserController|test|TestClass)\b/g;
    const variables = new Set<string>();
    
    let template = generatedCode;
    
    template = template.replace(/package\s+(com\.example\.[a-z]+);/, (match, packageName) => {
      variables.add('packageName');
      return 'package {{packageName}};';
    });
    
    template = template.replace(/public\s+class\s+([A-Z][a-zA-Z0-9]*)\s*\{/, (match, className) => {
      variables.add('className');
      return 'public class {{className}} {';
    });
    
    template = template.replace(/@ActiveProfiles\("([^"]+)"\)/, (match, profile) => {
      variables.add('testProfile');
      return '@ActiveProfiles("{{testProfile}}")';
    });

    const templateVariables = Array.from(variables).map(name => ({
      name,
      description: `${name} parameter`,
      required: true,
    }));

    return {
      name: templateName,
      description: `Generated template: ${templateName}`,
      template,
      variables: templateVariables,
    };
  }
}

export function getTemplateByName(name: string): CodeTemplate | undefined {
  return DEFAULT_TEMPLATES.find(template => template.name === name);
}

export function getTemplatesForSpringBootType(type: 'web' | 'data' | 'integration'): CodeTemplate[] {
  const typeKeywords = {
    web: ['WebMvcTest', 'MockMvc', 'Controller'],
    data: ['DataJpaTest', 'Repository', 'Entity'],
    integration: ['SpringBootTest', 'TestRestTemplate', 'Integration'],
  };

  const keywords = typeKeywords[type] || [];
  
  return DEFAULT_TEMPLATES.filter(template => 
    keywords.some(keyword => 
      template.name.includes(keyword) || 
      template.description.includes(keyword) ||
      template.template.includes(keyword)
    )
  );
}