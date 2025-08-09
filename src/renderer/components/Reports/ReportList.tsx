import React from 'react';
import { ReportFile } from '../../../main/types';
import './ReportList.css';

interface ReportListProps {
  reports: ReportFile[];
  isLoading: boolean;
  onSelect: (report: ReportFile) => void;
  onDelete: (report: ReportFile) => void;
  onRefresh: () => void;
  onViewAnalytics: () => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  isLoading,
  onSelect,
  onDelete,
  onRefresh,
  onViewAnalytics,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (successRate: number) => {
    if (successRate === 100) return 'success';
    if (successRate >= 80) return 'warning';
    return 'error';
  };

  const getStatusIcon = (successRate: number) => {
    if (successRate === 100) return '✅';
    if (successRate >= 80) return '⚠️';
    return '❌';
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Loading reports...</span>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📊</div>
        <h3>No test reports found</h3>
        <p>Test reports will appear here after running tests</p>
        <button className="btn btn-secondary" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="report-list">
      <div className="list-header">
        <div className="list-actions">
          <button className="btn btn-secondary" onClick={onRefresh}>
            🔄 Refresh
          </button>
          <button className="btn btn-primary" onClick={onViewAnalytics}>
            📈 Analytics
          </button>
        </div>
      </div>

      <div className="report-grid">
        {reports.map((report) => (
          <div
            key={report.id}
            className="report-card"
            onClick={() => onSelect(report)}
          >
            <div className="report-header">
              <div className="report-title">
                <span className="report-icon">📊</span>
                <span className="report-name">{report.name}</span>
              </div>
              <div className="report-actions">
                <button
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(report);
                  }}
                  title="Delete report"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="report-meta">
              <span className="meta-item">
                📅 {formatDate(report.createdAt)}
              </span>
              <span className="meta-item">
                📏 {report.size} bytes
              </span>
            </div>

            <div className="report-summary">
              <div className={`status-badge ${getStatusColor(report.summary.successRate)}`}>
                <span className="status-icon">
                  {getStatusIcon(report.summary.successRate)}
                </span>
                <span className="status-text">
                  {report.summary.successRate}% Success
                </span>
              </div>

              <div className="test-stats">
                <div className="stat-group">
                  <div className="stat-item passed">
                    <span className="stat-number">{report.summary.passedTests}</span>
                    <span className="stat-label">Passed</span>
                  </div>
                  <div className="stat-item failed">
                    <span className="stat-number">{report.summary.failedTests}</span>
                    <span className="stat-label">Failed</span>
                  </div>
                  <div className="stat-item skipped">
                    <span className="stat-number">{report.summary.skippedTests}</span>
                    <span className="stat-label">Skipped</span>
                  </div>
                </div>
              </div>

              <div className="duration-info">
                <span className="duration-label">Duration:</span>
                <span className="duration-value">
                  {(report.summary.executionTime / 1000).toFixed(2)}s
                </span>
              </div>
            </div>

            <div className="report-preview">
              {report.summary.failedTests > 0 && (
                <div className="failure-preview">
                  <span className="failure-label">Recent failures:</span>
                  <div className="failure-list">
                    {report.summary.recentFailures?.slice(0, 2).map((failure, index) => (
                      <div key={index} className="failure-item">
                        {failure}
                      </div>
                    ))}
                    {(report.summary.recentFailures?.length || 0) > 2 && (
                      <div className="failure-more">
                        +{(report.summary.recentFailures?.length || 0) - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};