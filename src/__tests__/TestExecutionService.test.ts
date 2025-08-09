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
        buildTool: 'maven',
        buildFilePath: 'pom.xml',
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

      const executionId = await service.executeTests(config);
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
        buildTool: 'gradle',
        buildFilePath: 'build.gradle',
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

      const executionId = await service.executeTests(config);
      expect(executionId).toBeDefined();
      expect(mockSpawn).toHaveBeenCalled();
    });

    it('should execute tests even if build file path is missing', async () => {
      const config: TestConfig = {
        specificationPath: 'src/test/resources/features',
        javaClasspath: [],
        springProfiles: [],
        jvmArgs: [],
        environmentVars: {},
        buildTool: 'maven',
        buildFilePath: 'pom.xml',
      };

      mockFs.existsSync.mockReturnValue(false);

      // The service should still return an execution ID even if build file is missing
      // The actual validation happens when the process starts
      const executionId = await service.executeTests(config);
      expect(typeof executionId).toBe('string');
      expect(executionId).toHaveLength(36); // UUID length
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
        buildTool: 'maven',
        buildFilePath: 'pom.xml',
      };

      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);
      mockFs.existsSync.mockReturnValue(true);

      const executionId = await service.executeTests(config);
      await service.cancelExecution(executionId);

      // cancelExecution returns void in the actual implementation
      expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');
    });

    it('should handle non-existent execution', async () => {
      // cancelExecution returns void, so we just ensure it doesn't throw
      await expect(
        service.cancelExecution('non-existent-id'),
      ).resolves.toBeUndefined();
    });
  });

  // The parseJUnitResults method doesn't exist publicly - it's a private method
  // Removing these tests as they test private implementation details

  describe('getExecutionStatus', () => {
    it('should return correct status for running execution', async () => {
      const config: TestConfig = {
        specificationPath: 'src/test/resources/features',
        javaClasspath: [],
        springProfiles: [],
        jvmArgs: [],
        environmentVars: {},
        buildTool: 'maven',
        buildFilePath: 'pom.xml',
      };

      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn(),
        kill: jest.fn(),
      };

      mockSpawn.mockReturnValue(mockProcess);
      mockFs.existsSync.mockReturnValue(true);

      const executionId = await service.executeTests(config);
      const status = await service.getExecutionStatus(executionId);

      expect(status).toBeDefined();
      expect(status?.status).toBe('running');
      expect(status?.executionId).toBe(executionId);
    });

    it('should throw for non-existent execution', async () => {
      await expect(
        service.getExecutionStatus('non-existent-id'),
      ).rejects.toThrow();
    });
  });
});
