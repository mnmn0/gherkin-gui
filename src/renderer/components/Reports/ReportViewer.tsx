import React, { useState } from 'react';
import { TestReport, TestResult, TestSuite } from '../../../main/types';
import './ReportViewer.css';

interface ReportViewerProps {
  report: TestReport;
  onBack: () => void;
}

type ViewMode = 'overview' | 'details' | 'failures';

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  onBack,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASSED': return '✅';
      case 'FAILED': return '❌';
      case 'SKIPPED': return '⏭️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED': return 'success';
      case 'FAILED': return 'error';
      case 'SKIPPED': return 'warning';
      default: return 'neutral';
    }
  };

  const getAllFailedTests = (): TestResult[] => {
    const failedTests: TestResult[] = [];
    report.testSuites.forEach(suite => {
      suite.testResults.forEach(test => {
        if (test.status === 'FAILED') {
          failedTests.push(test);
        }
      });
    });
    return failedTests;
  };

  const renderOverview = () => (
    <div className="overview-content">
      <div className="summary-cards">
        <div className="summary-card success">
          <div className="card-icon">✅</div>
          <div className="card-content">
            <div className="card-number">{report.summary.passedTests}</div>
            <div className="card-label">Tests Passed</div>
          </div>
        </div>

        <div className="summary-card error">
          <div className="card-icon">❌</div>
          <div className="card-content">
            <div className="card-number">{report.summary.failedTests}</div>
            <div className="card-label">Tests Failed</div>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="card-icon">⏭️</div>
          <div className="card-content">
            <div className="card-number">{report.summary.skippedTests}</div>
            <div className="card-label">Tests Skipped</div>
          </div>
        </div>

        <div className="summary-card neutral">
          <div className="card-icon">⏱️</div>
          <div className="card-content">
            <div className="card-number">{formatDuration(report.summary.executionTime)}</div>
            <div className="card-label">Total Time</div>
          </div>
        </div>
      </div>

      <div className="execution-info">
        <div className="info-section">
          <h3>Execution Details</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Started:</span>
              <span className="info-value">
                {new Date(report.startTime).toLocaleString()}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Finished:</span>
              <span className="info-value">
                {new Date(report.endTime).toLocaleString()}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Environment:</span>
              <span className="info-value">{report.environment}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Success Rate:</span>
              <span className={`info-value ${getStatusColor(
                report.summary.successRate === 100 ? 'PASSED' : 'FAILED'
              )}`}>
                {report.summary.successRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>Test Suites ({report.testSuites.length})</h3>
          <div className="suite-list">
            {report.testSuites.map((suite, index) => (
              <div key={index} className="suite-item" onClick={() => {
                setSelectedSuite(suite);
                setViewMode('details');
              }}>
                <div className="suite-header">
                  <span className="suite-name">{suite.name}</span>
                  <span className={`suite-status ${getStatusColor(suite.status)}`}>
                    {getStatusIcon(suite.status)} {suite.status}
                  </span>
                </div>
                <div className="suite-stats">
                  <span className="suite-stat">
                    {suite.testResults.length} tests
                  </span>
                  <span className="suite-stat">
                    {formatDuration(suite.executionTime)}
                  </span>
                  <span className="suite-stat">
                    {suite.testResults.filter(t => t.status === 'FAILED').length} failures
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetails = () => {
    if (!selectedSuite) return null;

    return (
      <div className="details-content">
        <div className="details-header">
          <button className="btn btn-secondary" onClick={() => {
            setSelectedSuite(null);
            setViewMode('overview');
          }}>
            ← Back to Overview
          </button>
          <h2>{selectedSuite.name}</h2>
          <div className="suite-info">
            <span className={`status-badge ${getStatusColor(selectedSuite.status)}`}>
              {getStatusIcon(selectedSuite.status)} {selectedSuite.status}
            </span>
            <span className="execution-time">
              {formatDuration(selectedSuite.executionTime)}
            </span>
          </div>
        </div>

        <div className="test-list">
          {selectedSuite.testResults.map((test, index) => (
            <div 
              key={index} 
              className={`test-item ${getStatusColor(test.status)}`}
              onClick={() => setSelectedTest(test)}
            >
              <div className="test-header">
                <div className="test-title">
                  <span className="test-icon">{getStatusIcon(test.status)}</span>
                  <span className="test-name">{test.testName}</span>
                </div>
                <div className="test-info">
                  <span className="test-duration">
                    {formatDuration(test.executionTime)}
                  </span>
                  {test.status === 'FAILED' && (
                    <span className="failure-indicator">View Details</span>
                  )}
                </div>
              </div>

              {selectedTest?.testName === test.testName && (
                <div className="test-details">
                  {test.errorMessage && (
                    <div className="error-section">
                      <h4>Error Message:</h4>
                      <pre className="error-message">{test.errorMessage}</pre>
                    </div>
                  )}
                  
                  {test.stackTrace && (
                    <div className="stack-section">
                      <h4>Stack Trace:</h4>
                      <pre className="stack-trace">{test.stackTrace}</pre>
                    </div>
                  )}

                  {test.assertions && test.assertions.length > 0 && (
                    <div className="assertions-section">
                      <h4>Assertions:</h4>
                      <div className="assertions-list">
                        {test.assertions.map((assertion, i) => (
                          <div key={i} className={`assertion-item ${assertion.passed ? 'passed' : 'failed'}`}>
                            <span className="assertion-icon">
                              {assertion.passed ? '✅' : '❌'}
                            </span>
                            <span className="assertion-text">{assertion.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFailures = () => {
    const failedTests = getAllFailedTests();

    return (
      <div className="failures-content">
        <div className="failures-header">
          <h2>Failed Tests ({failedTests.length})</h2>
          <p>All failed tests across all suites</p>
        </div>

        <div className="failure-list">
          {failedTests.map((test, index) => (
            <div key={index} className="failure-item">
              <div className="failure-header">
                <div className="failure-title">
                  <span className="failure-icon">❌</span>
                  <span className="failure-name">{test.testName}</span>
                </div>
                <span className="failure-duration">
                  {formatDuration(test.executionTime)}
                </span>
              </div>

              {test.errorMessage && (
                <div className="failure-error">
                  <h4>Error:</h4>
                  <pre className="error-content">{test.errorMessage}</pre>
                </div>
              )}

              {test.stackTrace && (
                <div className="failure-stack">
                  <h4>Stack Trace:</h4>
                  <pre className="stack-content">{test.stackTrace}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="report-viewer">
      <div className="viewer-header">
        <div className="header-left">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back to Reports
          </button>
          <div className="report-info">
            <h1>{report.reportName || 'Test Report'}</h1>
            <div className="report-metadata">
              <span>Generated: {new Date(report.startTime).toLocaleString()}</span>
              <span>Duration: {formatDuration(report.summary.executionTime)}</span>
              <span>Environment: {report.environment}</span>
            </div>
          </div>
        </div>

        <div className="header-tabs">
          <button
            className={`tab-btn ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab-btn ${viewMode === 'details' ? 'active' : ''}`}
            onClick={() => setViewMode('details')}
          >
            📋 Test Details
          </button>
          <button
            className={`tab-btn ${viewMode === 'failures' ? 'active' : ''}`}
            onClick={() => setViewMode('failures')}
          >
            ❌ Failures ({getAllFailedTests().length})
          </button>
        </div>
      </div>

      <div className="viewer-content">
        {viewMode === 'overview' && renderOverview()}
        {viewMode === 'details' && renderDetails()}
        {viewMode === 'failures' && renderFailures()}
      </div>
    </div>
  );
};