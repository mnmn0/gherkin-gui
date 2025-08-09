import React, { useState } from 'react';
import { SpecificationFile, TestConfig } from '../../../main/types';
import './TestRunner.css';

interface TestRunnerProps {
  specifications: SpecificationFile[];
  isLoading: boolean;
  onExecute: (config: TestConfig) => void;
  onRefresh: () => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  specifications,
  isLoading,
  onExecute,
  onRefresh,
}) => {
  const [selectedSpecs, setSelectedSpecs] = useState<Set<string>>(new Set());
  const [config, setConfig] = useState<TestConfig>({
    specificationPath: '',
    javaClasspath: [
      'target/classes',
      'target/test-classes'
    ],
    springProfiles: ['test'],
    jvmArgs: ['-Xmx512m'],
    environmentVars: {
      'SPRING_PROFILES_ACTIVE': 'test'
    }
  });

  const handleSpecSelect = (specId: string) => {
    const newSelected = new Set(selectedSpecs);
    if (newSelected.has(specId)) {
      newSelected.delete(specId);
    } else {
      newSelected.add(specId);
    }
    setSelectedSpecs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSpecs.size === specifications.length) {
      setSelectedSpecs(new Set());
    } else {
      setSelectedSpecs(new Set(specifications.map(s => s.id)));
    }
  };

  const handleConfigChange = (field: keyof TestConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field: 'javaClasspath' | 'springProfiles' | 'jvmArgs', value: string) => {
    if (!value.trim()) return;
    setConfig(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
  };

  const handleArrayRemove = (field: 'javaClasspath' | 'springProfiles' | 'jvmArgs', index: number) => {
    setConfig(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleEnvVarAdd = (key: string, value: string) => {
    if (!key.trim()) return;
    setConfig(prev => ({
      ...prev,
      environmentVars: {
        ...prev.environmentVars,
        [key.trim()]: value
      }
    }));
  };

  const handleEnvVarRemove = (key: string) => {
    setConfig(prev => {
      const newEnvVars = { ...prev.environmentVars };
      delete newEnvVars[key];
      return { ...prev, environmentVars: newEnvVars };
    });
  };

  const handleExecute = () => {
    const selectedSpecPaths = specifications
      .filter(spec => selectedSpecs.has(spec.id))
      .map(spec => spec.filePath);
    
    if (selectedSpecPaths.length === 0) {
      alert('Please select at least one specification to execute.');
      return;
    }

    const testConfig: TestConfig = {
      ...config,
      specificationPath: selectedSpecPaths.join(',')
    };

    onExecute(testConfig);
  };

  const isExecuteDisabled = selectedSpecs.size === 0 || isLoading;

  return (
    <div className="test-runner">
      <div className="runner-sections">
        <div className="spec-selection-section">
          <div className="section-header">
            <h3>Select Specifications</h3>
            <div className="section-actions">
              <button className="btn btn-secondary btn-small" onClick={onRefresh}>
                🔄 Refresh
              </button>
              <button className="btn btn-secondary btn-small" onClick={handleSelectAll}>
                {selectedSpecs.size === specifications.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>Loading specifications...</span>
            </div>
          ) : specifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div>
              <h4>No specifications found</h4>
              <p>Create some Gherkin specifications to run tests</p>
            </div>
          ) : (
            <div className="spec-list">
              {specifications.map(spec => (
                <div
                  key={spec.id}
                  className={`spec-item ${selectedSpecs.has(spec.id) ? 'selected' : ''}`}
                  onClick={() => handleSpecSelect(spec.id)}
                >
                  <div className="spec-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedSpecs.has(spec.id)}
                      onChange={() => handleSpecSelect(spec.id)}
                    />
                  </div>
                  <div className="spec-details">
                    <div className="spec-name">{spec.name}</div>
                    <div className="spec-meta">
                      <span>{spec.filePath}</span>
                      <span>{(spec.size / 1024).toFixed(1)} KB</span>
                      <span>{new Date(spec.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="selection-summary">
            <span>{selectedSpecs.size} of {specifications.length} specifications selected</span>
          </div>
        </div>

        <div className="config-section">
          <div className="section-header">
            <h3>Execution Configuration</h3>
          </div>

          <div className="config-form">
            <div className="config-group">
              <h4>Java Classpath</h4>
              <div className="array-input">
                <div className="array-list">
                  {config.javaClasspath.map((item, index) => (
                    <div key={index} className="array-item">
                      <span className="array-value">{item}</span>
                      <button 
                        className="btn-remove"
                        onClick={() => handleArrayRemove('javaClasspath', index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="array-add">
                  <input
                    type="text"
                    placeholder="Add classpath entry"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleArrayAdd('javaClasspath', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="config-group">
              <h4>Spring Profiles</h4>
              <div className="array-input">
                <div className="array-list">
                  {config.springProfiles.map((item, index) => (
                    <div key={index} className="array-item">
                      <span className="array-value">{item}</span>
                      <button 
                        className="btn-remove"
                        onClick={() => handleArrayRemove('springProfiles', index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="array-add">
                  <input
                    type="text"
                    placeholder="Add Spring profile"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleArrayAdd('springProfiles', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="config-group">
              <h4>JVM Arguments</h4>
              <div className="array-input">
                <div className="array-list">
                  {config.jvmArgs.map((item, index) => (
                    <div key={index} className="array-item">
                      <span className="array-value">{item}</span>
                      <button 
                        className="btn-remove"
                        onClick={() => handleArrayRemove('jvmArgs', index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="array-add">
                  <input
                    type="text"
                    placeholder="Add JVM argument (e.g., -Xmx1g)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleArrayAdd('jvmArgs', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="config-group">
              <h4>Environment Variables</h4>
              <div className="env-vars">
                <div className="env-var-list">
                  {Object.entries(config.environmentVars).map(([key, value]) => (
                    <div key={key} className="env-var-item">
                      <div className="env-var-key">{key}</div>
                      <div className="env-var-value">{value}</div>
                      <button 
                        className="btn-remove"
                        onClick={() => handleEnvVarRemove(key)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="env-var-add">
                  <input
                    type="text"
                    placeholder="Variable name"
                    className="env-key-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const valueInput = e.currentTarget.nextElementSibling as HTMLInputElement;
                        handleEnvVarAdd(e.currentTarget.value, valueInput.value);
                        e.currentTarget.value = '';
                        valueInput.value = '';
                      }
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Variable value"
                    className="env-value-input"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const keyInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                        handleEnvVarAdd(keyInput.value, e.currentTarget.value);
                        keyInput.value = '';
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="execute-section">
            <button
              className="btn btn-primary btn-large"
              onClick={handleExecute}
              disabled={isExecuteDisabled}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner small"></div>
                  Starting...
                </>
              ) : (
                <>
                  🚀 Execute Tests ({selectedSpecs.size} specs)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};