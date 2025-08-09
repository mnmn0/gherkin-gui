import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  SpecificationFile,
  ReportFile,
  TestReport,
  TestSummary,
} from '../types';

export class FileManagerService {
  private projectPath: string;
  private specPath: string;
  private reportPath: string;

  constructor(projectPath?: string) {
    this.projectPath = projectPath || process.cwd();
    this.specPath = path.join(this.projectPath, '.gherkin', 'spec');
    this.reportPath = path.join(this.projectPath, '.gherkin', 'report');
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.specPath, { recursive: true });
      await fs.mkdir(this.reportPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create directories:', error);
    }
  }

  async listSpecifications(): Promise<SpecificationFile[]> {
    try {
      await this.ensureDirectories();
      const files = await fs.readdir(this.specPath);
      const specifications: SpecificationFile[] = [];

      for (const file of files) {
        if (file.endsWith('.feature')) {
          const filePath = path.join(this.specPath, file);
          const stats = await fs.stat(filePath);
          
          specifications.push({
            id: this.generateIdFromPath(filePath),
            name: file,
            filePath,
            lastModified: stats.mtime,
            size: stats.size,
          });
        }
      }

      return specifications.sort((a, b) => 
        b.lastModified.getTime() - a.lastModified.getTime()
      );
    } catch (error) {
      console.error('Failed to list specifications:', error);
      return [];
    }
  }

  async loadSpecification(filePath: string): Promise<string> {
    try {
      const resolvedPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(this.specPath, filePath);
      
      const content = await fs.readFile(resolvedPath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to load specification: ${error}`);
    }
  }

  async saveSpecification(fileName: string, content: string): Promise<string> {
    try {
      await this.ensureDirectories();
      
      if (!fileName.endsWith('.feature')) {
        fileName += '.feature';
      }
      
      const filePath = path.join(this.specPath, fileName);
      
      const backupPath = await this.createBackup(filePath);
      
      await fs.writeFile(filePath, content, 'utf-8');
      
      if (backupPath) {
        await this.cleanupOldBackups(fileName);
      }
      
      return filePath;
    } catch (error) {
      throw new Error(`Failed to save specification: ${error}`);
    }
  }

  async deleteSpecification(filePath: string): Promise<void> {
    try {
      const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.specPath, filePath);
      
      await this.createBackup(resolvedPath);
      
      await fs.unlink(resolvedPath);
    } catch (error) {
      throw new Error(`Failed to delete specification: ${error}`);
    }
  }

  async createSpecification(name: string, content?: string): Promise<string> {
    try {
      await this.ensureDirectories();
      
      if (!name.endsWith('.feature')) {
        name += '.feature';
      }
      
      const filePath = path.join(this.specPath, name);
      
      const exists = await this.fileExists(filePath);
      if (exists) {
        throw new Error(`Specification ${name} already exists`);
      }
      
      const defaultContent = content || this.getDefaultSpecificationContent(name);
      await fs.writeFile(filePath, defaultContent, 'utf-8');
      
      return filePath;
    } catch (error) {
      throw new Error(`Failed to create specification: ${error}`);
    }
  }

  async listReports(): Promise<ReportFile[]> {
    try {
      await this.ensureDirectories();
      const files = await fs.readdir(this.reportPath);
      const reports: ReportFile[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.reportPath, file);
          
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const report: TestReport = JSON.parse(content);
            const stats = await fs.stat(filePath);
            
            reports.push({
              id: report.id,
              executionId: report.executionId,
              filePath,
              timestamp: new Date(report.timestamp),
              summary: this.calculateSummary(report),
            });
          } catch (parseError) {
            console.error(`Failed to parse report ${file}:`, parseError);
          }
        }
      }

      return reports.sort((a, b) => 
        b.timestamp.getTime() - a.timestamp.getTime()
      );
    } catch (error) {
      console.error('Failed to list reports:', error);
      return [];
    }
  }

  async loadReport(filePath: string): Promise<TestReport> {
    try {
      const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.reportPath, filePath);
      
      const content = await fs.readFile(resolvedPath, 'utf-8');
      const report: TestReport = JSON.parse(content);
      
      if (typeof report.timestamp === 'string') {
        report.timestamp = new Date(report.timestamp);
      }
      
      return report;
    } catch (error) {
      throw new Error(`Failed to load report: ${error}`);
    }
  }

  async saveReport(report: TestReport): Promise<string> {
    try {
      await this.ensureDirectories();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `report-${timestamp}.json`;
      const filePath = path.join(this.reportPath, fileName);
      
      await fs.writeFile(filePath, JSON.stringify(report, null, 2), 'utf-8');
      
      await this.cleanupOldReports();
      
      return filePath;
    } catch (error) {
      throw new Error(`Failed to save report: ${error}`);
    }
  }

  async deleteReport(filePath: string): Promise<void> {
    try {
      const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(this.reportPath, filePath);
      
      await fs.unlink(resolvedPath);
    } catch (error) {
      throw new Error(`Failed to delete report: ${error}`);
    }
  }

  private async createBackup(filePath: string): Promise<string | null> {
    try {
      const exists = await this.fileExists(filePath);
      if (!exists) return null;
      
      const backupDir = path.join(path.dirname(filePath), '.backup');
      await fs.mkdir(backupDir, { recursive: true });
      
      const fileName = path.basename(filePath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `${fileName}.${timestamp}.backup`;
      const backupPath = path.join(backupDir, backupName);
      
      const content = await fs.readFile(filePath, 'utf-8');
      await fs.writeFile(backupPath, content, 'utf-8');
      
      return backupPath;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return null;
    }
  }

  private async cleanupOldBackups(fileName: string): Promise<void> {
    try {
      const backupDir = path.join(this.specPath, '.backup');
      const exists = await this.fileExists(backupDir);
      if (!exists) return;
      
      const files = await fs.readdir(backupDir);
      const backups = files
        .filter(f => f.startsWith(fileName))
        .sort()
        .reverse();
      
      const maxBackups = 5;
      if (backups.length > maxBackups) {
        for (const backup of backups.slice(maxBackups)) {
          await fs.unlink(path.join(backupDir, backup));
        }
      }
    } catch (error) {
      console.error('Failed to cleanup backups:', error);
    }
  }

  private async cleanupOldReports(maxReports: number = 50): Promise<void> {
    try {
      const reports = await this.listReports();
      
      if (reports.length > maxReports) {
        const toDelete = reports.slice(maxReports);
        for (const report of toDelete) {
          await this.deleteReport(report.filePath);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old reports:', error);
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private generateIdFromPath(filePath: string): string {
    const fileName = path.basename(filePath);
    return fileName.replace(/[^a-zA-Z0-9]/g, '-');
  }

  private calculateSummary(report: TestReport): TestSummary {
    const result = report.testResult;
    const total = result.totalTests;
    const passed = result.passedTests;
    const failed = result.failedTests;
    const skipped = result.skippedTests;
    
    return {
      totalTests: total,
      passedTests: passed,
      failedTests: failed,
      skippedTests: skipped,
      successRate: total > 0 ? (passed / total) * 100 : 0,
    };
  }

  private getDefaultSpecificationContent(name: string): string {
    const featureName = name.replace('.feature', '').replace(/[-_]/g, ' ');
    return `Feature: ${featureName}
  As a user
  I want to describe the feature
  So that the business value is clear

  Background:
    Given the system is initialized

  Scenario: Default scenario
    Given the initial state
    When an action is performed
    Then the expected result occurs

  Scenario Outline: Parameterized scenario
    Given I have <input>
    When I process it
    Then I should get <output>

    Examples:
      | input | output |
      | A     | X      |
      | B     | Y      |
`;
  }
}