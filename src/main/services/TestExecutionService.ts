import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import {
  TestConfig,
  TestExecution,
  ExecutionStatus,
  TestResult,
  TestCase,
  ExecutionProgress,
} from '../types';

export interface ProcessExecutionOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

export class TestExecutionService extends EventEmitter {
  private runningExecutions = new Map<string, ChildProcess>();
  private executionStatus = new Map<string, TestExecution>();

  async executeTests(config: TestConfig): Promise<string> {
    const executionId = uuidv4();
    
    try {
      const execution: TestExecution = {
        id: executionId,
        specificationPath: config.specificationPath,
        startTime: new Date(),
        status: 'running',
        progress: 0,
      };

      this.executionStatus.set(executionId, execution);
      
      const command = this.buildTestCommand(config);
      const options = this.buildProcessOptions(config);
      
      const process = spawn(command.cmd, command.args, options);
      this.runningExecutions.set(executionId, process);

      this.setupProcessHandlers(process, executionId, config);
      
      this.emit('execution:started', { executionId, config });
      
      return executionId;
    } catch (error) {
      this.updateExecutionStatus(executionId, 'failed');
      throw new Error(`Failed to start test execution: ${error}`);
    }
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionStatus> {
    const execution = this.executionStatus.get(executionId);
    
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    return {
      executionId: execution.id,
      status: execution.status,
      progress: execution.progress,
      message: this.getStatusMessage(execution),
    };
  }

  async cancelExecution(executionId: string): Promise<void> {
    const process = this.runningExecutions.get(executionId);
    
    if (process && !process.killed) {
      process.kill('SIGTERM');
      
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      }, 5000);

      this.updateExecutionStatus(executionId, 'cancelled');
      this.runningExecutions.delete(executionId);
      
      this.emit('execution:cancelled', { executionId });
    }
  }

  private buildTestCommand(config: TestConfig): { cmd: string; args: string[] } {
    switch (config.buildTool) {
      case 'maven':
        return this.buildMavenCommand(config);
      case 'gradle':
        return this.buildGradleCommand(config);
      default:
        throw new Error(`Unsupported build tool: ${config.buildTool}`);
    }
  }

  private buildMavenCommand(config: TestConfig): { cmd: string; args: string[] } {
    const args = ['test'];
    
    if (config.springProfiles.length > 0) {
      const profiles = config.springProfiles.join(',');
      args.push(`-Dspring.profiles.active=${profiles}`);
    }
    
    if (config.jvmArgs.length > 0) {
      args.push(`-Darguments=${config.jvmArgs.join(' ')}`);
    }
    
    args.push('-Dmaven.test.failure.ignore=true');
    args.push('-Dsurefire.reports.directory=target/surefire-reports');
    
    return { cmd: 'mvn', args };
  }

  private buildGradleCommand(config: TestConfig): { cmd: string; args: string[] } {
    const args = ['test'];
    
    if (config.springProfiles.length > 0) {
      const profiles = config.springProfiles.join(',');
      args.push(`-Dspring.profiles.active=${profiles}`);
    }
    
    if (config.jvmArgs.length > 0) {
      config.jvmArgs.forEach(arg => {
        args.push(`-Dorg.gradle.jvmargs=${arg}`);
      });
    }
    
    args.push('--continue');
    args.push('--info');
    
    return { cmd: './gradlew', args };
  }

  private buildProcessOptions(config: TestConfig): ProcessExecutionOptions {
    const projectDir = path.dirname(config.buildFilePath);
    
    const env = {
      ...process.env,
      ...config.environmentVars,
    };

    if (config.javaClasspath.length > 0) {
      const classpath = config.javaClasspath.join(path.delimiter);
      env.CLASSPATH = classpath;
    }

    return {
      cwd: projectDir,
      env,
      timeout: 300000, // 5 minutes default timeout
    };
  }

  private setupProcessHandlers(
    process: ChildProcess,
    executionId: string,
    config: TestConfig
  ): void {
    let stdoutData = '';
    let stderrData = '';

    process.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      stdoutData += output;
      
      this.parseProgressFromOutput(output, executionId);
      this.emit('execution:output', { executionId, output, type: 'stdout' });
    });

    process.stderr?.on('data', (data: Buffer) => {
      const output = data.toString();
      stderrData += output;
      
      this.emit('execution:output', { executionId, output, type: 'stderr' });
    });

    process.on('close', async (code: number | null) => {
      this.runningExecutions.delete(executionId);
      
      try {
        const testResult = await this.parseTestResults(config, stdoutData, stderrData, code);
        
        if (code === 0 || (code !== null && code < 2)) {
          this.updateExecutionStatus(executionId, 'completed');
          this.emit('execution:completed', { executionId, result: testResult });
        } else {
          this.updateExecutionStatus(executionId, 'failed');
          this.emit('execution:failed', { 
            executionId, 
            error: `Process exited with code ${code}`,
            result: testResult,
          });
        }
      } catch (error) {
        this.updateExecutionStatus(executionId, 'failed');
        this.emit('execution:failed', { 
          executionId, 
          error: `Failed to parse test results: ${error}`,
        });
      }
    });

    process.on('error', (error: Error) => {
      this.runningExecutions.delete(executionId);
      this.updateExecutionStatus(executionId, 'failed');
      
      this.emit('execution:failed', { executionId, error: error.message });
    });
  }

  private parseProgressFromOutput(output: string, executionId: string): void {
    const lines = output.split('\n');
    
    for (const line of lines) {
      let progress = 0;
      let currentTest = '';
      
      if (line.includes('Running ')) {
        const match = line.match(/Running\s+([^\s]+)/);
        if (match) {
          currentTest = match[1];
          progress = this.calculateProgress(executionId, line);
        }
      } else if (line.includes('Tests run:')) {
        const match = line.match(/Tests run:\s*(\d+),.*Failures:\s*(\d+),.*Errors:\s*(\d+),.*Skipped:\s*(\d+)/);
        if (match) {
          const total = parseInt(match[1]);
          progress = Math.min(100, (total / (total + 5)) * 100); // Estimate
        }
      }

      if (progress > 0) {
        this.updateExecutionProgress(executionId, progress, currentTest);
      }
    }
  }

  private calculateProgress(executionId: string, output: string): number {
    const execution = this.executionStatus.get(executionId);
    if (!execution) return 0;

    const elapsedTime = Date.now() - execution.startTime.getTime();
    const estimatedDuration = 60000; // 1 minute estimate
    
    return Math.min(90, (elapsedTime / estimatedDuration) * 100);
  }

  private updateExecutionProgress(executionId: string, progress: number, currentTest?: string): void {
    const execution = this.executionStatus.get(executionId);
    if (execution) {
      execution.progress = progress;
      
      const progressEvent: ExecutionProgress = {
        executionId,
        progress,
        currentTest: currentTest || '',
        testsCompleted: Math.floor(progress / 10), // Estimate
        totalTests: 10, // Estimate
      };
      
      this.emit('execution:progress', progressEvent);
    }
  }

  private updateExecutionStatus(
    executionId: string,
    status: TestExecution['status'],
    message?: string
  ): void {
    const execution = this.executionStatus.get(executionId);
    if (execution) {
      execution.status = status;
      if (status === 'completed') {
        execution.progress = 100;
      }
    }
  }

  private async parseTestResults(
    config: TestConfig,
    stdout: string,
    stderr: string,
    exitCode: number | null
  ): Promise<TestResult> {
    try {
      if (config.buildTool === 'maven') {
        return await this.parseMavenResults(config, stdout, stderr);
      } else if (config.buildTool === 'gradle') {
        return await this.parseGradleResults(config, stdout, stderr);
      }
    } catch (error) {
      console.warn('Failed to parse detailed results, using fallback:', error);
    }

    return this.createFallbackResult(config.specificationPath, stdout, stderr, exitCode);
  }

  private async parseMavenResults(
    config: TestConfig,
    stdout: string,
    stderr: string
  ): Promise<TestResult> {
    const projectDir = path.dirname(config.buildFilePath);
    const reportsDir = path.join(projectDir, 'target', 'surefire-reports');
    
    try {
      const files = await fs.readdir(reportsDir);
      const xmlFiles = files.filter(f => f.startsWith('TEST-') && f.endsWith('.xml'));
      
      const testCases: TestCase[] = [];
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;
      let skippedTests = 0;
      let totalTime = 0;

      for (const xmlFile of xmlFiles) {
        const xmlPath = path.join(reportsDir, xmlFile);
        const xmlContent = await fs.readFile(xmlPath, 'utf-8');
        const parsed = this.parseJUnitXml(xmlContent);
        
        testCases.push(...parsed.testCases);
        totalTests += parsed.totalTests;
        passedTests += parsed.passedTests;
        failedTests += parsed.failedTests;
        skippedTests += parsed.skippedTests;
        totalTime += parsed.executionTime;
      }

      return {
        executionId: uuidv4(),
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        executionTime: totalTime,
        testCases,
      };
    } catch (error) {
      return this.createFallbackResult(config.specificationPath, stdout, stderr, 0);
    }
  }

  private async parseGradleResults(
    config: TestConfig,
    stdout: string,
    stderr: string
  ): Promise<TestResult> {
    const projectDir = path.dirname(config.buildFilePath);
    const reportsDir = path.join(projectDir, 'build', 'test-results', 'test');
    
    try {
      const files = await fs.readdir(reportsDir);
      const xmlFiles = files.filter(f => f.startsWith('TEST-') && f.endsWith('.xml'));
      
      const testCases: TestCase[] = [];
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;
      let skippedTests = 0;
      let totalTime = 0;

      for (const xmlFile of xmlFiles) {
        const xmlPath = path.join(reportsDir, xmlFile);
        const xmlContent = await fs.readFile(xmlPath, 'utf-8');
        const parsed = this.parseJUnitXml(xmlContent);
        
        testCases.push(...parsed.testCases);
        totalTests += parsed.totalTests;
        passedTests += parsed.passedTests;
        failedTests += parsed.failedTests;
        skippedTests += parsed.skippedTests;
        totalTime += parsed.executionTime;
      }

      return {
        executionId: uuidv4(),
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        executionTime: totalTime,
        testCases,
      };
    } catch (error) {
      return this.createFallbackResult(config.specificationPath, stdout, stderr, 0);
    }
  }

  private parseJUnitXml(xmlContent: string): {
    testCases: TestCase[];
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    executionTime: number;
  } {
    const testCases: TestCase[] = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    let executionTime = 0;

    const testSuiteMatch = xmlContent.match(/<testsuite[^>]*tests="(\d+)"[^>]*failures="(\d+)"[^>]*errors="(\d+)"[^>]*skipped="(\d+)"[^>]*time="([^"]*)"[^>]*name="([^"]*)"[^>]*>/);
    
    if (testSuiteMatch) {
      totalTests = parseInt(testSuiteMatch[1]);
      const failures = parseInt(testSuiteMatch[2]);
      const errors = parseInt(testSuiteMatch[3]);
      skippedTests = parseInt(testSuiteMatch[4]);
      executionTime = parseFloat(testSuiteMatch[5]) * 1000; // Convert to milliseconds
      const className = testSuiteMatch[6];
      
      failedTests = failures + errors;
      passedTests = totalTests - failedTests - skippedTests;

      const testCaseMatches = xmlContent.matchAll(/<testcase[^>]*name="([^"]*)"[^>]*classname="([^"]*)"[^>]*time="([^"]*)"[^>]*(?:\/?>|>(.*?)<\/testcase>)/gs);
      
      for (const match of testCaseMatches) {
        const testName = match[1];
        const testClassName = match[2];
        const testTime = parseFloat(match[3]) * 1000;
        const testContent = match[4] || '';
        
        let status: TestCase['status'] = 'passed';
        let errorMessage: string | undefined;
        let stackTrace: string | undefined;

        if (testContent.includes('<failure') || testContent.includes('<error')) {
          status = 'failed';
          const failureMatch = testContent.match(/<(?:failure|error)[^>]*message="([^"]*)"[^>]*>(.*?)<\/(?:failure|error)>/s);
          if (failureMatch) {
            errorMessage = failureMatch[1];
            stackTrace = failureMatch[2].trim();
          }
        } else if (testContent.includes('<skipped')) {
          status = 'skipped';
        }

        testCases.push({
          name: testName,
          className: testClassName,
          status,
          executionTime: testTime,
          errorMessage,
          stackTrace,
        });
      }
    }

    return {
      testCases,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      executionTime,
    };
  }

  private createFallbackResult(
    specPath: string,
    stdout: string,
    stderr: string,
    exitCode: number | null
  ): TestResult {
    const hasFailure = stderr.length > 0 || (exitCode !== null && exitCode > 0);
    
    return {
      executionId: uuidv4(),
      totalTests: 1,
      passedTests: hasFailure ? 0 : 1,
      failedTests: hasFailure ? 1 : 0,
      skippedTests: 0,
      executionTime: 0,
      testCases: [{
        name: path.basename(specPath, '.feature'),
        className: 'UnknownTestClass',
        status: hasFailure ? 'failed' : 'passed',
        executionTime: 0,
        errorMessage: hasFailure ? 'Test execution failed' : undefined,
        stackTrace: hasFailure ? stderr || 'Unknown error' : undefined,
      }],
    };
  }

  private getStatusMessage(execution: TestExecution): string {
    switch (execution.status) {
      case 'running':
        return `Running tests... ${execution.progress}% complete`;
      case 'completed':
        return 'Test execution completed successfully';
      case 'failed':
        return 'Test execution failed';
      case 'cancelled':
        return 'Test execution was cancelled';
      default:
        return 'Unknown status';
    }
  }

  getRunningExecutions(): string[] {
    return Array.from(this.runningExecutions.keys());
  }

  cleanup(): void {
    for (const [executionId, process] of this.runningExecutions) {
      if (!process.killed) {
        process.kill('SIGTERM');
      }
    }
    
    this.runningExecutions.clear();
    this.executionStatus.clear();
    this.removeAllListeners();
  }
}