import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { FileManagerService } from '../main/services/FileManagerService';
import { TestReport, TestResult, TestConfig } from '../main/types';

describe('FileManagerService', () => {
  let tempDir: string;
  let service: FileManagerService;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gherkin-test-'));
    service = new FileManagerService(tempDir);
  });

  afterEach(async () => {
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });

  describe('Specification Management', () => {
    it('should create specification directories', async () => {
      const specDir = path.join(tempDir, '.gherkin', 'spec');
      const reportDir = path.join(tempDir, '.gherkin', 'report');

      const specExists = await fs.access(specDir).then(() => true).catch(() => false);
      const reportExists = await fs.access(reportDir).then(() => true).catch(() => false);

      expect(specExists).toBe(true);
      expect(reportExists).toBe(true);
    });

    it('should create a new specification', async () => {
      const fileName = 'login.feature';
      const filePath = await service.createSpecification(fileName);

      expect(filePath).toContain(fileName);

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('Feature: login');
      expect(content).toContain('Scenario:');
    });

    it('should save and load specification', async () => {
      const fileName = 'test.feature';
      const content = `Feature: Test Feature
  Scenario: Test Scenario
    Given something
    When action
    Then result`;

      await service.saveSpecification(fileName, content);
      const loaded = await service.loadSpecification(fileName);

      expect(loaded).toBe(content);
    });

    it('should list specifications', async () => {
      await service.createSpecification('spec1.feature');
      await service.createSpecification('spec2.feature');

      const specs = await service.listSpecifications();

      expect(specs).toHaveLength(2);
      expect(specs.some(s => s.name === 'spec1.feature')).toBe(true);
      expect(specs.some(s => s.name === 'spec2.feature')).toBe(true);
    });

    it('should delete specification', async () => {
      const fileName = 'to-delete.feature';
      await service.createSpecification(fileName);

      let specs = await service.listSpecifications();
      expect(specs).toHaveLength(1);

      await service.deleteSpecification(fileName);

      specs = await service.listSpecifications();
      expect(specs).toHaveLength(0);
    });

    it('should prevent duplicate specification names', async () => {
      const fileName = 'duplicate.feature';
      await service.createSpecification(fileName);

      await expect(service.createSpecification(fileName)).rejects.toThrow();
    });

    it('should auto-add .feature extension', async () => {
      const filePath = await service.createSpecification('no-extension');
      expect(path.basename(filePath)).toBe('no-extension.feature');
    });

    it('should create backup when overwriting', async () => {
      const fileName = 'backup-test.feature';
      const originalContent = 'Original content';
      const newContent = 'New content';

      await service.saveSpecification(fileName, originalContent);
      await service.saveSpecification(fileName, newContent);

      const backupDir = path.join(tempDir, '.gherkin', 'spec', '.backup');
      const backupFiles = await fs.readdir(backupDir);
      
      expect(backupFiles.length).toBeGreaterThan(0);
      expect(backupFiles.some(f => f.startsWith(fileName))).toBe(true);
    });
  });

  describe('Report Management', () => {
    it('should save and load report', async () => {
      const testConfig: TestConfig = {
        specificationPath: '/test/spec.feature',
        javaClasspath: [],
        springProfiles: ['test'],
        jvmArgs: [],
        environmentVars: {},
        buildTool: 'maven',
        buildFilePath: '/test/pom.xml',
      };

      const testResult: TestResult = {
        executionId: 'exec-123',
        totalTests: 5,
        passedTests: 4,
        failedTests: 1,
        skippedTests: 0,
        executionTime: 1500,
        testCases: [
          {
            name: 'Test 1',
            className: 'com.test.Test1',
            status: 'passed',
            executionTime: 300,
          },
          {
            name: 'Test 2',
            className: 'com.test.Test2',
            status: 'failed',
            executionTime: 200,
            errorMessage: 'Assertion failed',
            stackTrace: 'Stack trace here',
          },
        ],
      };

      const report: TestReport = {
        id: 'report-123',
        executionId: 'exec-123',
        timestamp: new Date(),
        specificationPath: '/test/spec.feature',
        testResult,
        configuration: testConfig,
      };

      const savedPath = await service.saveReport(report);
      expect(savedPath).toContain('.json');

      const loaded = await service.loadReport(savedPath);
      expect(loaded.id).toBe(report.id);
      expect(loaded.executionId).toBe(report.executionId);
      expect(loaded.testResult.totalTests).toBe(5);
    });

    it('should list reports with summaries', async () => {
      const report1: TestReport = {
        id: 'report-1',
        executionId: 'exec-1',
        timestamp: new Date(),
        specificationPath: '/test/spec1.feature',
        testResult: {
          executionId: 'exec-1',
          totalTests: 10,
          passedTests: 8,
          failedTests: 2,
          skippedTests: 0,
          executionTime: 2000,
          testCases: [],
        },
        configuration: {} as TestConfig,
      };

      const report2: TestReport = {
        id: 'report-2',
        executionId: 'exec-2',
        timestamp: new Date(),
        specificationPath: '/test/spec2.feature',
        testResult: {
          executionId: 'exec-2',
          totalTests: 5,
          passedTests: 5,
          failedTests: 0,
          skippedTests: 0,
          executionTime: 1000,
          testCases: [],
        },
        configuration: {} as TestConfig,
      };

      await service.saveReport(report1);
      await service.saveReport(report2);

      const reports = await service.listReports();
      expect(reports).toHaveLength(2);
      
      const firstReport = reports.find(r => r.id === 'report-1');
      expect(firstReport?.summary.totalTests).toBe(10);
      expect(firstReport?.summary.successRate).toBe(80);

      const secondReport = reports.find(r => r.id === 'report-2');
      expect(secondReport?.summary.totalTests).toBe(5);
      expect(secondReport?.summary.successRate).toBe(100);
    });

    it('should delete report', async () => {
      const report: TestReport = {
        id: 'to-delete',
        executionId: 'exec-delete',
        timestamp: new Date(),
        specificationPath: '/test/spec.feature',
        testResult: {
          executionId: 'exec-delete',
          totalTests: 1,
          passedTests: 1,
          failedTests: 0,
          skippedTests: 0,
          executionTime: 100,
          testCases: [],
        },
        configuration: {} as TestConfig,
      };

      const savedPath = await service.saveReport(report);
      
      let reports = await service.listReports();
      expect(reports).toHaveLength(1);

      await service.deleteReport(savedPath);

      reports = await service.listReports();
      expect(reports).toHaveLength(0);
    });

    it('should handle invalid JSON in report files', async () => {
      const reportDir = path.join(tempDir, '.gherkin', 'report');
      const invalidReportPath = path.join(reportDir, 'invalid.json');
      
      await fs.writeFile(invalidReportPath, 'invalid json content');

      const reports = await service.listReports();
      expect(reports).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing specification file', async () => {
      await expect(service.loadSpecification('non-existent.feature')).rejects.toThrow();
    });

    it('should handle missing report file', async () => {
      await expect(service.loadReport('non-existent.json')).rejects.toThrow();
    });

    it('should return empty arrays for non-existent directories', async () => {
      const nonExistentService = new FileManagerService('/non/existent/path');
      
      const specs = await nonExistentService.listSpecifications();
      expect(specs).toEqual([]);

      const reports = await nonExistentService.listReports();
      expect(reports).toEqual([]);
    });
  });
});