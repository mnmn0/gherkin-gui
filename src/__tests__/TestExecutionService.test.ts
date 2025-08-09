import * as fs from 'fs';
import { TestExecutionService } from '../main/services/TestExecutionService';
import { TestConfig } from '../main/types';

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn(),
}));

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

describe('TestExecutionService', () => {
  let service: TestExecutionService;
  const mockSpawn = jest.requireMock('child_process').spawn;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    service = new TestExecutionService();
    jest.clearAllMocks();
  });

  describe('executeTests', () => {
    it('should execute tests with Maven', async () => {
      const config: TestConfig = {
        specificationPath: 'src/test/resources/features',
        javaClasspath: ['target/classes', 'target/test-classes'],
        springProfiles: ['test'],
        jvmArgs: ['-Xmx512m'],
        environmentVars: { SPRING_PROFILES_ACTIVE: 'test' },
      };

      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
        kill: jest.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);
      mockFs.existsSync.mockReturnValue(true);

      const executionId = await service.executeTests(config, 'maven');
      expect(executionId).toBeDefined();
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should execute tests with Gradle', async () => {
      const config: TestConfig = {
        specificationPath: 'src/test/resources/features',
        javaClasspath: ['build/classes', 'build/test-classes'],
        springProfiles: ['test'],
        jvmArgs: ['-Xmx512m'],
        environmentVars: { SPRING_PROFILES_ACTIVE: 'test' },
      };

      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        }),
        kill: jest.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);
      mockFs.existsSync.mockReturnValue(true);

      const executionId = await service.executeTests(config, 'gradle');
      expect(executionId).toBeDefined();
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should handle missing build file', async () => {
      const config: TestConfig = {
        specificationPath: 'src/test/resources/features',
        javaClasspath: [],
        springProfiles: [],
        jvmArgs: [],
        environmentVars: {},
      };

      mockFs.existsSync.mockReturnValue(false);

      await expect(service.executeTests(config, 'maven')).rejects.toThrow();
    });
  });

  describe('cancelExecution', () => {
    it('should cancel running execution', async () => {
      const config: TestConfig = {
        specificationPath: 'src/test/resources/features',
        javaClasspath: [],
        springProfiles: [],
        jvmArgs: [],
        environmentVars: {},
      };

      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);
      mockFs.existsSync.mockReturnValue(true);

      const executionId = await service.executeTests(config, 'maven');
      const result = await service.cancelExecution(executionId);

      expect(result).toBe(true);
      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('should return false for non-existent execution', async () => {
      const result = await service.cancelExecution('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('parseJUnitResults', () => {
    it('should parse valid JUnit XML', () => {
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
        <testsuite name="TestSuite" tests="2" failures="1" errors="0" time="1.234">
          <testcase classname="com.example.Test" name="testPass" time="0.5"/>
          <testcase classname="com.example.Test" name="testFail" time="0.734">
            <failure message="Assertion failed" type="AssertionError">
              Stack trace here
            </failure>
          </testcase>
        </testsuite>`;

      const result = service.parseJUnitResults(xmlContent);

      expect(result).toBeDefined();
      expect(result.testSuites).toHaveLength(1);
      expect(result.testSuites[0].name).toBe('TestSuite');
      expect(result.testSuites[0].testResults).toHaveLength(2);
      expect(result.summary.totalTests).toBe(2);
      expect(result.summary.passedTests).toBe(1);
      expect(result.summary.failedTests).toBe(1);
    });

    it('should handle invalid XML', () => {
      const invalidXml = '<invalid>xml';

      expect(() => service.parseJUnitResults(invalidXml)).toThrow();
    });

    it('should handle empty XML', () => {
      const emptyXml = '<?xml version="1.0" encoding="UTF-8"?><root/>';

      const result = service.parseJUnitResults(emptyXml);
      expect(result.testSuites).toHaveLength(0);
      expect(result.summary.totalTests).toBe(0);
    });
  });

  describe('getExecutionStatus', () => {
    it('should return correct status for running execution', async () => {
      const config: TestConfig = {
        specificationPath: 'src/test/resources/features',
        javaClasspath: [],
        springProfiles: [],
        jvmArgs: [],
        environmentVars: {},
      };

      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);
      mockFs.existsSync.mockReturnValue(true);

      const executionId = await service.executeTests(config, 'maven');
      const status = service.getExecutionStatus(executionId);

      expect(status).toBeDefined();
      expect(status?.status).toBe('running');
      expect(status?.executionId).toBe(executionId);
    });

    it('should return null for non-existent execution', () => {
      const status = service.getExecutionStatus('non-existent-id');
      expect(status).toBeNull();
    });
  });
});
