import React, { useState } from 'react';
import { SpecificationFile, GenerationConfig } from '../../../main/types';
import './CodeGenerator.css';

interface CodeGeneratorProps {
  specifications: SpecificationFile[];
  selectedSpec: SpecificationFile | null;
  specContent: string;
  config: GenerationConfig;
  isLoading: boolean;
  onSpecSelect: (spec: SpecificationFile) => void;
  onGenerate: (config: GenerationConfig) => void;
  onRefresh: () => void;
}

const TEMPLATE_OPTIONS = [
  { value: 'integration', label: 'Spring Boot Integration Test', description: 'Full integration test with Spring Boot context' },
  { value: 'web', label: 'Spring Boot Web MVC Test', description: 'Web layer test using @WebMvcTest' },
  { value: 'data', label: 'Spring Boot Data JPA Test', description: 'Data layer test using @DataJpaTest' },
  { value: 'cucumber', label: 'Cucumber Step Definitions', description: 'Cucumber step definitions with Spring Boot' },
  { value: 'testcontainers', label: 'TestContainers Integration', description: 'Integration test with TestContainers for database' },
];

const ANNOTATION_OPTIONS = [
  { value: '@SpringBootTest', label: '@SpringBootTest', description: 'Full Spring Boot application context' },
  { value: '@WebMvcTest', label: '@WebMvcTest', description: 'Web layer test with MockMvc' },
  { value: '@DataJpaTest', label: '@DataJpaTest', description: 'Data layer test with TestEntityManager' },
  { value: '@JsonTest', label: '@JsonTest', description: 'JSON serialization test' },
  { value: '@TestMethodOrder', label: '@TestMethodOrder', description: 'Control test execution order' },
];

export const CodeGenerator: React.FC<CodeGeneratorProps> = ({
  specifications,
  selectedSpec,
  specContent,
  config,
  isLoading,
  onSpecSelect,
  onGenerate,
  onRefresh,
}) => {
  const [localConfig, setLocalConfig] = useState<GenerationConfig>(config);

  const handleConfigChange = (field: keyof GenerationConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleAnnotationToggle = (annotation: string) => {
    const current = localConfig.springBootAnnotations || [];
    const newAnnotations = current.includes(annotation)
      ? current.filter(a => a !== annotation)
      : [...current, annotation];
    
    setLocalConfig(prev => ({ 
      ...prev, 
      springBootAnnotations: newAnnotations 
    }));
  };

  const handleGenerate = () => {
    onGenerate(localConfig);
  };

  const isFormValid = localConfig.packageName && localConfig.className && selectedSpec;

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="code-generator">
      <div className="generator-layout">
        <div className="spec-selector">
          <div className="section-header">
            <h3>Select Specification</h3>
            <button 
              className="btn btn-secondary"
              onClick={onRefresh}
              disabled={isLoading}
            >
              🔄 Refresh
            </button>
          </div>

          {isLoading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span>Loading specifications...</span>
            </div>
          )}

          {!isLoading && specifications.length === 0 && (
            <div className="empty-state">
              <p>No specifications found. Create a specification first.</p>
            </div>
          )}

          {!isLoading && specifications.length > 0 && (
            <div className="spec-list">
              {specifications.map((spec) => (
                <div
                  key={spec.id}
                  className={`spec-item ${selectedSpec?.id === spec.id ? 'selected' : ''}`}
                  onClick={() => onSpecSelect(spec)}
                >
                  <div className="spec-icon">📝</div>
                  <div className="spec-details">
                    <div className="spec-name">{spec.name}</div>
                    <div className="spec-meta">
                      {formatDate(spec.lastModified)} • {(spec.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="config-panel">
          <div className="section-header">
            <h3>Generation Configuration</h3>
          </div>

          {selectedSpec && (
            <div className="selected-spec-info">
              <div className="info-header">
                <span className="info-icon">📋</span>
                <span className="info-text">Selected: {selectedSpec.name}</span>
              </div>
              <div className="spec-preview">
                <textarea
                  value={specContent}
                  readOnly
                  className="spec-content"
                  placeholder="Specification content will appear here..."
                />
              </div>
            </div>
          )}

          <div className="config-form">
            <div className="form-group">
              <label htmlFor="package-name">Package Name</label>
              <input
                id="package-name"
                type="text"
                value={localConfig.packageName}
                onChange={(e) => handleConfigChange('packageName', e.target.value)}
                placeholder="com.example.test"
                pattern="^[a-z][a-z0-9.]*$"
              />
              <div className="form-help">
                Java package name (lowercase, dot-separated)
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="class-name">Test Class Name</label>
              <input
                id="class-name"
                type="text"
                value={localConfig.className}
                onChange={(e) => handleConfigChange('className', e.target.value)}
                placeholder="UserLoginTest"
                pattern="^[A-Z][a-zA-Z0-9]*$"
              />
              <div className="form-help">
                Test class name (PascalCase, ends with Test)
              </div>
            </div>

            <div className="form-group">
              <label>Template Type</label>
              <select
                value={localConfig.template || 'integration'}
                onChange={(e) => handleConfigChange('template', e.target.value)}
              >
                {TEMPLATE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="form-help">
                {TEMPLATE_OPTIONS.find(opt => opt.value === (localConfig.template || 'integration'))?.description}
              </div>
            </div>

            <div className="form-group">
              <label>Spring Boot Annotations</label>
              <div className="annotation-checkboxes">
                {ANNOTATION_OPTIONS.map(option => (
                  <label key={option.value} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(localConfig.springBootAnnotations || []).includes(option.value)}
                      onChange={() => handleAnnotationToggle(option.value)}
                    />
                    <span className="checkbox-text">
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="custom-imports">Custom Imports (optional)</label>
              <textarea
                id="custom-imports"
                value={(localConfig.customImports || []).join('\n')}
                onChange={(e) => handleConfigChange('customImports', e.target.value.split('\n').filter(line => line.trim()))}
                placeholder="import com.example.CustomService;&#10;import static com.example.TestUtils.*;"
                rows={3}
              />
              <div className="form-help">
                Additional import statements (one per line)
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary btn-large"
                onClick={handleGenerate}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    ⚙️ Generate JUnit Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};