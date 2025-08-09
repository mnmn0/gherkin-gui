import React, { useState, useEffect } from 'react';
import { SpecificationFile } from '../../../main/types';
import './SpecificationEditor.css';

interface SpecificationEditorProps {
  specification: SpecificationFile;
  content: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export const SpecificationEditor: React.FC<SpecificationEditorProps> = ({
  specification,
  content,
  onSave,
  onCancel,
}) => {
  const [editorContent, setEditorContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(editorContent !== content);
  }, [editorContent, content]);

  const handleSave = () => {
    onSave(editorContent);
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
  };

  const insertTemplate = (template: string) => {
    const textarea = document.getElementById('spec-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = editorContent.substring(0, start) + template + editorContent.substring(end);
      setEditorContent(newContent);
      
      // Set cursor position after inserted template
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + template.length, start + template.length);
      }, 0);
    }
  };

  const templates = {
    scenario: `
Scenario: Scenario name
  Given initial condition
  When action is performed
  Then expected result occurs`,
    
    scenarioOutline: `
Scenario Outline: Scenario with examples
  Given I have <input>
  When I process it
  Then I should get <output>
  
  Examples:
    | input | output |
    | A     | X      |
    | B     | Y      |`,
    
    background: `
Background:
  Given the system is initialized
  And test data is prepared`,
    
    dataTable: `
    | column1 | column2 | column3 |
    | value1  | value2  | value3  |`,
  };

  return (
    <div className="specification-editor">
      <div className="editor-header">
        <div className="header-left">
          <div className="spec-info">
            <h2>Editing: {specification.name}</h2>
            {hasChanges && <span className="changes-indicator">● Unsaved changes</span>}
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!hasChanges}
          >
            💾 Save
          </button>
        </div>
      </div>

      <div className="editor-toolbar">
        <div className="toolbar-section">
          <span className="toolbar-label">Templates:</span>
          <button
            className="toolbar-btn"
            onClick={() => insertTemplate(templates.scenario)}
            title="Insert Scenario template"
          >
            📝 Scenario
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertTemplate(templates.scenarioOutline)}
            title="Insert Scenario Outline template"
          >
            📋 Outline
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertTemplate(templates.background)}
            title="Insert Background template"
          >
            🎬 Background
          </button>
          <button
            className="toolbar-btn"
            onClick={() => insertTemplate(templates.dataTable)}
            title="Insert Data Table template"
          >
            📊 Table
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-container">
          <textarea
            id="spec-editor"
            className="gherkin-editor"
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your Gherkin specification here...

Example:
Feature: User Login
  As a user
  I want to login to the system
  So that I can access my account

  Scenario: Successful login
    Given I am on the login page
    When I enter valid credentials
    Then I should be redirected to dashboard"
            spellCheck={false}
          />
          <div className="editor-status">
            <div className="status-info">
              Lines: {editorContent.split('\n').length} | 
              Characters: {editorContent.length}
            </div>
            <div className="keyboard-hint">
              Ctrl+S to save
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};