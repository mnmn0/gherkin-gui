import React, { useState, useEffect } from 'react';
import { ReportList } from '../Reports/ReportList';
import { ReportViewer } from '../Reports/ReportViewer';
import { ReportAnalytics } from '../Reports/ReportAnalytics';
import { apiService } from '../../services/ApiService';
import { ReportFile, TestReport } from '../../../main/types';
import './Page.css';
import './ReportsPage.css';

interface ReportsPageState {
  reports: ReportFile[];
  selectedReport: TestReport | null;
  isLoading: boolean;
  error: string | null;
  viewMode: 'list' | 'viewer' | 'analytics';
}

export const ReportsPage: React.FC = () => {
  const [state, setState] = useState<ReportsPageState>({
    reports: [],
    selectedReport: null,
    isLoading: false,
    error: null,
    viewMode: 'list',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const reports = await apiService.listReports();
      setState((prev) => ({ ...prev, reports, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to load reports: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleReportSelect = async (reportFile: ReportFile) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const report = await apiService.loadReport(reportFile.filePath);
      setState((prev) => ({
        ...prev,
        selectedReport: report,
        viewMode: 'viewer',
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to load report: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleDeleteReport = async (reportFile: ReportFile) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await apiService.deleteReport(reportFile.filePath);
      await loadReports();
      if (state.selectedReport?.id === reportFile.id) {
        setState((prev) => ({
          ...prev,
          selectedReport: null,
          viewMode: 'list',
        }));
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to delete report: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleBack = () => {
    setState((prev) => ({
      ...prev,
      selectedReport: null,
      viewMode: 'list',
    }));
  };

  const handleViewAnalytics = () => {
    setState((prev) => ({ ...prev, viewMode: 'analytics' }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Test Reports</h1>
            <p>View test reports and analytics</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{state.reports.length}</span>
              <span className="stat-label">Total Reports</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {
                  state.reports.filter((r) => r.summary.successRate === 100)
                    .length
                }
              </span>
              <span className="stat-label">Passed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {state.reports.filter((r) => r.summary.failedTests > 0).length}
              </span>
              <span className="stat-label">Failed</span>
            </div>
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

      <div className="reports-content">
        {state.viewMode === 'list' && (
          <ReportList
            reports={state.reports}
            isLoading={state.isLoading}
            onSelect={handleReportSelect}
            onDelete={handleDeleteReport}
            onRefresh={loadReports}
            onViewAnalytics={handleViewAnalytics}
          />
        )}

        {state.viewMode === 'viewer' && state.selectedReport && (
          <ReportViewer report={state.selectedReport} onBack={handleBack} />
        )}

        {state.viewMode === 'analytics' && (
          <ReportAnalytics reports={state.reports} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};
