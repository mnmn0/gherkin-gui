import React, { useState, useMemo } from 'react';
import { ReportFile, TestReport } from '../../../main/types';
import { apiService } from '../../services/ApiService';
import './ReportAnalytics.css';

interface ReportAnalyticsProps {
  reports: ReportFile[];
  onBack: () => void;
}

interface TrendData {
  date: string;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  executionTime: number;
  successRate: number;
}

interface FailurePattern {
  testName: string;
  count: number;
  lastSeen: Date;
  errorMessage: string;
}

export const ReportAnalytics: React.FC<ReportAnalyticsProps> = ({
  reports,
  onBack,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    '7d' | '30d' | '90d' | 'all'
  >('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [fullReports, setFullReports] = useState<TestReport[]>([]);

  React.useEffect(() => {
    loadFullReports();
  }, [reports]);

  const loadFullReports = async () => {
    setIsLoading(true);
    try {
      const reportPromises = reports
        .slice(0, 50)
        .map((report) => apiService.loadReport(report.filePath));
      const loadedReports = await Promise.all(reportPromises);
      setFullReports(loadedReports);
    } catch {
      // Failed to load reports for analytics
    }
    setIsLoading(false);
  };

  const filteredReports = useMemo(() => {
    if (selectedTimeRange === 'all') return fullReports;

    const now = new Date();
    const days =
      selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return fullReports.filter((report) => new Date(report.startTime) >= cutoff);
  }, [fullReports, selectedTimeRange]);

  const trendData = useMemo((): TrendData[] => {
    const grouped = new Map<string, TestReport[]>();

    filteredReports.forEach((report) => {
      const dateKey = new Date(report.startTime).toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(report);
    });

    const trends: TrendData[] = [];

    grouped.forEach((reportsForDate, dateKey) => {
      const totalPassed = reportsForDate.reduce(
        (sum, r) => sum + r.summary.passedTests,
        0,
      );
      const totalFailed = reportsForDate.reduce(
        (sum, r) => sum + r.summary.failedTests,
        0,
      );
      const totalSkipped = reportsForDate.reduce(
        (sum, r) => sum + r.summary.skippedTests,
        0,
      );
      const totalTime = reportsForDate.reduce(
        (sum, r) => sum + r.summary.executionTime,
        0,
      );
      const avgSuccessRate =
        reportsForDate.reduce((sum, r) => sum + r.summary.successRate, 0) /
        reportsForDate.length;

      trends.push({
        date: dateKey,
        passedTests: totalPassed,
        failedTests: totalFailed,
        skippedTests: totalSkipped,
        executionTime: totalTime,
        successRate: avgSuccessRate,
      });
    });

    return trends.sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredReports]);

  const failurePatterns = useMemo((): FailurePattern[] => {
    const failures = new Map<string, FailurePattern>();

    filteredReports.forEach((report) => {
      report.testSuites.forEach((suite) => {
        suite.testResults.forEach((test) => {
          if (test.status === 'FAILED') {
            const key = `${suite.name}::${test.testName}`;
            if (!failures.has(key)) {
              failures.set(key, {
                testName: `${suite.name}::${test.testName}`,
                count: 0,
                lastSeen: new Date(report.endTime),
                errorMessage: test.errorMessage || 'Unknown error',
              });
            }
            const pattern = failures.get(key)!;
            pattern.count += 1;
            const reportDate = new Date(report.endTime);
            if (reportDate > pattern.lastSeen) {
              pattern.lastSeen = reportDate;
              pattern.errorMessage = test.errorMessage || 'Unknown error';
            }
          }
        });
      });
    });

    return Array.from(failures.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredReports]);

  const summaryStats = useMemo(() => {
    if (filteredReports.length === 0) {
      return {
        totalTests: 0,
        averageSuccessRate: 0,
        totalExecutionTime: 0,
        mostFailingTest: null,
        improvementTrend: 0,
      };
    }

    const totalTests = filteredReports.reduce(
      (sum, r) =>
        sum +
        r.summary.passedTests +
        r.summary.failedTests +
        r.summary.skippedTests,
      0,
    );

    const averageSuccessRate =
      filteredReports.reduce((sum, r) => sum + r.summary.successRate, 0) /
      filteredReports.length;

    const totalExecutionTime = filteredReports.reduce(
      (sum, r) => sum + r.summary.executionTime,
      0,
    );

    const mostFailingTest =
      failurePatterns.length > 0 ? failurePatterns[0] : null;

    const recentTrend = trendData.slice(-7);
    const olderTrend = trendData.slice(-14, -7);
    const recentAvg =
      recentTrend.length > 0
        ? recentTrend.reduce((sum, t) => sum + t.successRate, 0) /
          recentTrend.length
        : 0;
    const olderAvg =
      olderTrend.length > 0
        ? olderTrend.reduce((sum, t) => sum + t.successRate, 0) /
          olderTrend.length
        : 0;
    const improvementTrend = recentAvg - olderAvg;

    return {
      totalTests,
      averageSuccessRate,
      totalExecutionTime,
      mostFailingTest,
      improvementTrend,
    };
  }, [filteredReports, failurePatterns, trendData]);

  const renderTrendChart = () => {
    if (trendData.length === 0) return null;

    return (
      <div className="trend-chart">
        <div className="chart-header">
          <h3>Success Rate Trend</h3>
          <div className="time-range-selector">
            {(['7d', '30d', '90d', 'all'] as const).map((timeRange) => (
              <button
                key={timeRange}
                className={`range-btn ${selectedTimeRange === timeRange ? 'active' : ''}`}
                onClick={() => setSelectedTimeRange(timeRange)}
              >
                {timeRange === 'all' ? 'All Time' : timeRange.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-area">
            <svg viewBox="0 0 800 200" className="trend-svg">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={200 - y * 2}
                  x2="800"
                  y2={200 - y * 2}
                  stroke="#e0e0e0"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Trend line */}
              {trendData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#3498db"
                  strokeWidth="2"
                  points={trendData
                    .map(
                      (d, i) =>
                        `${(i * 800) / (trendData.length - 1)},${200 - d.successRate * 2}`,
                    )
                    .join(' ')}
                />
              )}

              {/* Data points */}
              {trendData.map((d, i) => (
                <circle
                  key={i}
                  cx={(i * 800) / (trendData.length - 1 || 1)}
                  cy={200 - d.successRate * 2}
                  r="4"
                  fill="#3498db"
                  className="data-point"
                />
              ))}
            </svg>
          </div>

          <div className="chart-labels">
            {trendData.map((d, i) => (
              <div key={i} className="chart-label">
                {new Date(d.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner" />
        <span>Loading analytics data...</span>
      </div>
    );
  }

  return (
    <div className="report-analytics">
      <div className="analytics-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Reports
        </button>
        <div className="analytics-info">
          <h1>Test Analytics</h1>
          <p>Insights from {filteredReports.length} test reports</p>
        </div>
      </div>

      <div className="analytics-content">
        <div className="summary-section">
          <div className="summary-cards">
            <div className="analytics-card">
              <div className="card-header">
                <span className="card-icon">🎯</span>
                <span className="card-title">Total Tests</span>
              </div>
              <div className="card-value">
                {summaryStats.totalTests.toLocaleString()}
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <span className="card-icon">📊</span>
                <span className="card-title">Average Success Rate</span>
              </div>
              <div className="card-value">
                {summaryStats.averageSuccessRate.toFixed(1)}%
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <span className="card-icon">⏱️</span>
                <span className="card-title">Total Execution Time</span>
              </div>
              <div className="card-value">
                {(summaryStats.totalExecutionTime / (1000 * 60)).toFixed(1)}m
              </div>
            </div>

            <div className="analytics-card">
              <div className="card-header">
                <span className="card-icon">📈</span>
                <span className="card-title">Trend</span>
              </div>
              <div
                className={`card-value ${summaryStats.improvementTrend >= 0 ? 'positive' : 'negative'}`}
              >
                {summaryStats.improvementTrend >= 0 ? '↗️' : '↘️'}
                {Math.abs(summaryStats.improvementTrend).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="charts-section">{renderTrendChart()}</div>

        <div className="insights-section">
          <div className="failure-patterns">
            <h3>Most Frequent Failures</h3>
            {failurePatterns.length === 0 ? (
              <div className="no-failures">
                <span className="no-failures-icon">🎉</span>
                <p>No recurring failures found!</p>
              </div>
            ) : (
              <div className="pattern-list">
                {failurePatterns.map((pattern, index) => (
                  <div key={index} className="pattern-item">
                    <div className="pattern-header">
                      <div className="pattern-rank">#{index + 1}</div>
                      <div className="pattern-info">
                        <div className="pattern-name">{pattern.testName}</div>
                        <div className="pattern-meta">
                          {pattern.count} failures • Last seen{' '}
                          {pattern.lastSeen.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="pattern-count">{pattern.count}×</div>
                    </div>
                    <div className="pattern-error">
                      {pattern.errorMessage.substring(0, 100)}
                      {pattern.errorMessage.length > 100 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="performance-insights">
            <h3>Performance Insights</h3>
            <div className="insights-grid">
              <div className="insight-item">
                <div className="insight-icon">⚡</div>
                <div className="insight-content">
                  <div className="insight-title">Fastest Execution</div>
                  <div className="insight-value">
                    {Math.min(
                      ...filteredReports.map(
                        (r) => r.summary.executionTime / 1000,
                      ),
                    ).toFixed(2)}
                    s
                  </div>
                </div>
              </div>

              <div className="insight-item">
                <div className="insight-icon">🐌</div>
                <div className="insight-content">
                  <div className="insight-title">Slowest Execution</div>
                  <div className="insight-value">
                    {Math.max(
                      ...filteredReports.map(
                        (r) => r.summary.executionTime / 1000,
                      ),
                    ).toFixed(2)}
                    s
                  </div>
                </div>
              </div>

              <div className="insight-item">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <div className="insight-title">Best Success Rate</div>
                  <div className="insight-value">
                    {Math.max(
                      ...filteredReports.map((r) => r.summary.successRate),
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>

              <div className="insight-item">
                <div className="insight-icon">📉</div>
                <div className="insight-content">
                  <div className="insight-title">Worst Success Rate</div>
                  <div className="insight-value">
                    {Math.min(
                      ...filteredReports.map((r) => r.summary.successRate),
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
