import React, { useState, useEffect } from 'react';
import { TestRunner } from '../TestExecution/TestRunner';
import { ExecutionMonitor } from '../TestExecution/ExecutionMonitor';
import { apiService } from '../../services/ApiService';
import { SpecificationFile, TestConfig } from '../../../main/types';
import './Page.css';
import './TestExecutionPage.css';

interface TestExecutionPageState {
  specifications: SpecificationFile[];
  activeExecutions: Map<string, any>;
  isLoading: boolean;
  error: string | null;
  viewMode: 'runner' | 'monitor';
}

export const TestExecutionPage: React.FC = () => {
  const [state, setState] = useState<TestExecutionPageState>({
    specifications: [],
    activeExecutions: new Map(),
    isLoading: false,
    error: null,
    viewMode: 'runner',
  });

  useEffect(() => {
    loadSpecifications();
    setupEventListeners();

    return () => {
      cleanup();
    };
  }, []);

  const loadSpecifications = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const specs = await apiService.listSpecifications();
      setState((prev) => ({
        ...prev,
        specifications: specs,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to load specifications: ${error}`,
        isLoading: false,
      }));
    }
  };

  const setupEventListeners = () => {
    const progressUnsubscribe = apiService.onExecutionProgress((data) => {
      setState((prev) => ({
        ...prev,
        activeExecutions: new Map(
          prev.activeExecutions.set(data.executionId, {
            ...prev.activeExecutions.get(data.executionId),
            progress: data,
          }),
        ),
      }));
    });

    const completeUnsubscribe = apiService.onExecutionComplete((data) => {
      setState((prev) => {
        const newExecutions = new Map(prev.activeExecutions);
        const execution = newExecutions.get(data.executionId);
        if (execution) {
          execution.status = 'completed';
          execution.result = data.result;
        }
        return {
          ...prev,
          activeExecutions: newExecutions,
        };
      });
    });

    const errorUnsubscribe = apiService.onError((data) => {
      setState((prev) => ({ ...prev, error: data.message }));
    });

    return () => {
      progressUnsubscribe();
      completeUnsubscribe();
      errorUnsubscribe();
    };
  };

  const cleanup = () => {
    apiService.removeAllListeners('execution:progress');
    apiService.removeAllListeners('execution:complete');
    apiService.removeAllListeners('error:occurred');
  };

  const handleExecuteTest = async (config: TestConfig) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const executionId = await apiService.executeTests(config);

      setState((prev) => ({
        ...prev,
        activeExecutions: new Map(
          prev.activeExecutions.set(executionId, {
            id: executionId,
            config,
            startTime: new Date(),
            status: 'running',
            progress: {
              progress: 0,
              currentTest: '',
              testsCompleted: 0,
              totalTests: 0,
            },
          }),
        ),
        viewMode: 'monitor',
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to start test execution: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleCancelExecution = async (executionId: string) => {
    try {
      await apiService.cancelTest(executionId);
      setState((prev) => {
        const newExecutions = new Map(prev.activeExecutions);
        const execution = newExecutions.get(executionId);
        if (execution) {
          execution.status = 'cancelled';
        }
        return {
          ...prev,
          activeExecutions: newExecutions,
        };
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to cancel execution: ${error}`,
      }));
    }
  };

  const handleViewRunner = () => {
    setState((prev) => ({ ...prev, viewMode: 'runner' }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Test Execution</h1>
            <p>Run and monitor test executions</p>
          </div>
          <div className="header-tabs">
            <button
              className={`tab-btn ${state.viewMode === 'runner' ? 'active' : ''}`}
              onClick={handleViewRunner}
            >
              🚀 Test Runner
            </button>
            <button
              className={`tab-btn ${state.viewMode === 'monitor' ? 'active' : ''}`}
              onClick={() =>
                setState((prev) => ({ ...prev, viewMode: 'monitor' }))
              }
            >
              📊 Monitor ({state.activeExecutions.size})
            </button>
          </div>
        </div>
      </div>

      {state.error && (
        <div className="error-banner">
          {state.error}
          <button
            onClick={() => setState((prev) => ({ ...prev, error: null }))}
          >
            ×
          </button>
        </div>
      )}

      <div className="test-execution-content">
        {state.viewMode === 'runner' && (
          <TestRunner
            specifications={state.specifications}
            isLoading={state.isLoading}
            onExecute={handleExecuteTest}
            onRefresh={loadSpecifications}
          />
        )}

        {state.viewMode === 'monitor' && (
          <ExecutionMonitor
            executions={Array.from(state.activeExecutions.values())}
            onCancel={handleCancelExecution}
            onViewRunner={handleViewRunner}
          />
        )}
      </div>
    </div>
  );
};
