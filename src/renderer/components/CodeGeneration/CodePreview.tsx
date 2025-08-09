import React, { useState } from 'react';
import { SpecificationFile, GenerationConfig } from '../../../main/types';
import { apiService } from '../../services/ApiService';
import './CodePreview.css';

interface CodePreviewProps {
  specification: SpecificationFile;
  generatedCode: string;
  config: GenerationConfig;
  onBack: () => void;
  onRegenerate: () => void;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  specification,
  generatedCode,
  config,
  onBack,
  onRegenerate,
}) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      // TODO: Show toast notification
      console.log('Code copied to clipboard');
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/java' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.className}.java`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await apiService.validateCode(generatedCode);
      setValidationResult(result);
    } catch (error) {
      console.error('Failed to validate code:', error);
      setValidationResult({
        valid: false,
        errors: [
          { message: `Validation failed: ${error}`, code: 'VALIDATION_ERROR' },
        ],
        warnings: [],
      });
    }
    setIsValidating(false);
  };

  const renderValidationResults = () => {
    if (!validationResult) return null;

    return (
      <div className="validation-results">
        <div
          className={`validation-status ${validationResult.valid ? 'valid' : 'invalid'}`}
        >
          <span className="status-icon">
            {validationResult.valid ? '✅' : '❌'}
          </span>
          <span className="status-text">
            {validationResult.valid ? 'Code is valid' : 'Code has issues'}
          </span>
        </div>

        {validationResult.errors && validationResult.errors.length > 0 && (
          <div className="validation-errors">
            <h4>Errors:</h4>
            <ul>
              {validationResult.errors.map((error: any, index: number) => (
                <li key={index} className="error-item">
                  <strong>{error.code}:</strong> {error.message}
                  {error.line && (
                    <span className="line-info"> (line {error.line})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validationResult.warnings && validationResult.warnings.length > 0 && (
          <div className="validation-warnings">
            <h4>Warnings:</h4>
            <ul>
              {validationResult.warnings.map((warning: any, index: number) => (
                <li key={index} className="warning-item">
                  <strong>{warning.code}:</strong> {warning.message}
                  {warning.line && (
                    <span className="line-info"> (line {warning.line})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderJavaCode = (code: string) => {
    const lines = code.split('\n');

    return lines.map((line, index) => {
      let className = 'code-line';

      if (line.trim().startsWith('package ')) {
        className += ' package';
      } else if (line.trim().startsWith('import ')) {
        className += ' import';
      } else if (line.trim().startsWith('@')) {
        className += ' annotation';
      } else if (
        line.trim().startsWith('public class ') ||
        line.trim().startsWith('class ')
      ) {
        className += ' class-declaration';
      } else if (
        line.trim().startsWith('public ') ||
        line.trim().startsWith('private ') ||
        line.trim().startsWith('protected ')
      ) {
        className += ' method';
      } else if (line.trim().startsWith('//')) {
        className += ' comment';
      }

      return (
        <div key={index} className={className}>
          <span className="line-number">{index + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });
  };

  const getCodeStats = () => {
    const lines = generatedCode.split('\n').length;
    const methods = (generatedCode.match(/@Test|@Given|@When|@Then/g) || [])
      .length;
    const characters = generatedCode.length;

    return { lines, methods, characters };
  };

  const stats = getCodeStats();

  return (
    <div className="code-preview">
      <div className="preview-header">
        <div className="header-left">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back
          </button>
          <div className="preview-info">
            <h2>Generated Code</h2>
            <div className="preview-metadata">
              <span>From: {specification.name}</span>
              <span>Class: {config.className}.java</span>
              <span>Package: {config.packageName}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleValidate}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <div className="loading-spinner small" />
                Validating...
              </>
            ) : (
              <>✓ Validate</>
            )}
          </button>
          <button className="btn btn-secondary" onClick={handleCopyToClipboard}>
            📋 Copy
          </button>
          <button className="btn btn-secondary" onClick={handleDownload}>
            💾 Download
          </button>
          <button className="btn btn-primary" onClick={onRegenerate}>
            ⚙️ Regenerate
          </button>
        </div>
      </div>

      <div className="preview-content">
        <div className="code-info">
          <div className="code-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.lines}</span>
              <span className="stat-label">Lines</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.methods}</span>
              <span className="stat-label">Test Methods</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {(stats.characters / 1024).toFixed(1)}
              </span>
              <span className="stat-label">KB</span>
            </div>
          </div>

          {renderValidationResults()}
        </div>

        <div className="code-container">
          <div className="code-header">
            <div className="file-info">
              <span className="file-icon">☕</span>
              <span className="file-name">{config.className}.java</span>
            </div>
            <div className="code-actions">
              <button
                className="action-btn"
                onClick={handleCopyToClipboard}
                title="Copy to clipboard"
              >
                📋
              </button>
            </div>
          </div>

          <div className="java-code">{renderJavaCode(generatedCode)}</div>
        </div>
      </div>
    </div>
  );
};
