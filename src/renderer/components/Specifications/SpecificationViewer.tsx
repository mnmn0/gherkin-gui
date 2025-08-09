import React from 'react';
import { SpecificationFile } from '../../../main/types';
import './SpecificationViewer.css';

interface SpecificationViewerProps {
  specification: SpecificationFile;
  content: string;
  onEdit: () => void;
  onBack: () => void;
}

export const SpecificationViewer: React.FC<SpecificationViewerProps> = ({
  specification,
  content,
  onEdit,
  onBack,
}) => {
  const renderGherkinContent = (content: string) => {
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      let className = 'gherkin-line';
      
      if (line.trim().startsWith('Feature:')) {
        className += ' feature';
      } else if (line.trim().startsWith('Scenario:') || line.trim().startsWith('Scenario Outline:')) {
        className += ' scenario';
      } else if (line.trim().startsWith('Background:')) {
        className += ' background';
      } else if (/^\s*(Given|When|Then|And|But)\s/.test(line)) {
        className += ' step';
      } else if (line.trim().startsWith('Examples:')) {
        className += ' examples';
      } else if (line.trim().startsWith('@')) {
        className += ' tag';
      } else if (line.trim().startsWith('#')) {
        className += ' comment';
      } else if (line.trim().startsWith('|')) {
        className += ' table';
      }
      
      return (
        <div key={index} className={className}>
          <span className="line-number">{index + 1}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });
  };

  return (
    <div className="specification-viewer">
      <div className="viewer-header">
        <div className="header-left">
          <button className="btn btn-secondary" onClick={onBack}>
            ← Back
          </button>
          <div className="spec-info">
            <h2>{specification.name}</h2>
            <div className="spec-metadata">
              <span>Size: {(specification.size / 1024).toFixed(1)} KB</span>
              <span>Modified: {new Date(specification.lastModified).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={onEdit}>
            ✏️ Edit
          </button>
        </div>
      </div>

      <div className="viewer-content">
        <div className="gherkin-preview">
          {renderGherkinContent(content)}
        </div>
      </div>
    </div>
  );
};