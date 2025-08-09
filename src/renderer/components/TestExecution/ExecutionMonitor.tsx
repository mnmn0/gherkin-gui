import React from 'react';
import './ExecutionMonitor.css';

interface ExecutionData {
  id: string;
  config: any;
  startTime: Date;
  status: 'running' | 'completed' | 'cancelled' | 'failed';
  progress?: {
    progress: number;
    currentTest: string;
    testsCompleted: number;
    totalTests: number;
  };
  result?: any;
}

interface ExecutionMonitorProps {
  executions: ExecutionData[];
  onCancel: (executionId: string) => void;
  onViewRunner: () => void;
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  executions,
  onCancel,
  onViewRunner,
}) => {
  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return '🔄';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '🚫';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'running';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'unknown';
    }
  };

  const renderProgressBar = (execution: ExecutionData) => {
    if (!execution.progress || execution.status !== 'running') {
      return null;
    }

    const { progress, testsCompleted, totalTests } = execution.progress;

    return (
      <div className="progress-section">
        <div className="progress-info">
          <span className="progress-text">
            {testsCompleted} / {totalTests} tests
          </span>
          <span className="progress-percent">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  };

  const renderExecutionResult = (execution: ExecutionData) => {
    if (execution.status !== 'completed' || !execution.result) {
      return null;
    }

    const { result } = execution;

    return (
      <div className="result-summary">
        <div className="result-stats">
          <div className="result-stat passed">
            <span className="stat-number">{result.passedTests || 0}</span>
            <span className="stat-label">Passed</span>
          </div>
          <div className="result-stat failed">
            <span className="stat-number">{result.failedTests || 0}</span>
            <span className="stat-label">Failed</span>
          </div>
          <div className="result-stat skipped">
            <span className="stat-number">{result.skippedTests || 0}</span>
            <span className="stat-label">Skipped</span>
          </div>
        </div>
        <div className="success-rate">
          Success Rate: {result.successRate?.toFixed(1) || 0}%
        </div>
      </div>
    );
  };

  if (executions.length === 0) {
    return (
      <div className="execution-monitor empty">
        <div className="empty-state">
          <div className="empty-icon">🚀</div>
          <h3>No active executions</h3>
          <p>Start a test execution to see progress here</p>
          <button className="btn btn-primary" onClick={onViewRunner}>
            Go to Test Runner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="execution-monitor">
      <div className="monitor-header">
        <div className="header-info">
          <h3>Active Executions ({executions.length})</h3>
          <p>Monitor test execution progress and results</p>
        </div>
        <button className="btn btn-secondary" onClick={onViewRunner}>
          🚀 New Execution
        </button>
      </div>

      <div className="execution-list">
        {executions.map((execution) => (
          <div
            key={execution.id}
            className={`execution-card ${getStatusColor(execution.status)}`}
          >
            <div className="execution-header">
              <div className="execution-title">
                <span className="status-icon">
                  {getStatusIcon(execution.status)}
                </span>
                <div className="execution-info">
                  <div className="execution-id">
                    Execution #{execution.id.substring(0, 8)}
                  </div>
                  <div className="execution-time">
                    Started {formatDuration(execution.startTime)} ago
                  </div>
                </div>
              </div>
              <div className="execution-actions">
                {execution.status === 'running' && (
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => onCancel(execution.id)}
                  >
                    Cancel
                  </button>
                )}
                <div
                  className={`status-badge ${getStatusColor(execution.status)}`}
                >
                  {execution.status.toUpperCase()}
                </div>
              </div>
            </div>

            {execution.progress && execution.status === 'running' && (
              <div className="current-test">
                <span className="current-test-label">Currently running:</span>
                <span className="current-test-name">
                  {execution.progress.currentTest}
                </span>
              </div>
            )}

            {renderProgressBar(execution)}
            {renderExecutionResult(execution)}

            <div className="execution-config">
              <h4>Configuration</h4>
              <div className="config-details">
                <div className="config-item">
                  <span className="config-label">Specifications:</span>
                  <span className="config-value">
                    {execution.config?.specificationPath?.split(',').length ||
                      0}{' '}
                    files
                  </span>
                </div>
                <div className="config-item">
                  <span className="config-label">Spring Profiles:</span>
                  <span className="config-value">
                    {execution.config?.springProfiles?.join(', ') || 'None'}
                  </span>
                </div>
                <div className="config-item">
                  <span className="config-label">JVM Args:</span>
                  <span className="config-value">
                    {execution.config?.jvmArgs?.length || 0} arguments
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
