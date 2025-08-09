import React from 'react';
import { ProjectConfig } from '../../../main/types';
import './ProjectSettings.css';

interface ProjectSettingsProps {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  config,
  onChange,
}) => {
  const handleChange = (field: keyof ProjectConfig, value: any) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const handleTestConfigChange = (field: string, value: any) => {
    onChange({
      ...config,
      testConfiguration: {
        ...config.testConfiguration,
        [field]: value,
      },
    });
  };

  return (
    <div className="project-settings">
      <div className="settings-section">
        <h3>Project Information</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={config.projectName}
              onChange={(e) => handleChange('projectName', e.target.value)}
              placeholder="Enter project name"
            />
            <div className="form-help">
              The display name for this project
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              value={config.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Project description (optional)"
              rows={3}
            />
            <div className="form-help">
              Brief description of the project
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="spec-directory">Specifications Directory</label>
            <input
              id="spec-directory"
              type="text"
              value={config.specificationDirectory}
              onChange={(e) => handleChange('specificationDirectory', e.target.value)}
              placeholder=".gherkin/spec"
            />
            <div className="form-help">
              Directory where Gherkin specifications are stored
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="report-directory">Reports Directory</label>
            <input
              id="report-directory"
              type="text"
              value={config.reportDirectory}
              onChange={(e) => handleChange('reportDirectory', e.target.value)}
              placeholder=".gherkin/report"
            />
            <div className="form-help">
              Directory where test reports are stored
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Test Configuration</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="build-tool">Build Tool</label>
            <select
              id="build-tool"
              value={config.testConfiguration.buildTool}
              onChange={(e) => handleTestConfigChange('buildTool', e.target.value as 'maven' | 'gradle')}
            >
              <option value="maven">Maven</option>
              <option value="gradle">Gradle</option>
            </select>
            <div className="form-help">
              Build tool used for running tests
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="java-version">Java Version</label>
            <select
              id="java-version"
              value={config.testConfiguration.javaVersion}
              onChange={(e) => handleTestConfigChange('javaVersion', e.target.value)}
            >
              <option value="8">Java 8</option>
              <option value="11">Java 11</option>
              <option value="17">Java 17</option>
              <option value="21">Java 21</option>
            </select>
            <div className="form-help">
              Target Java version for generated tests
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="test-framework">Testing Framework</label>
            <select
              id="test-framework"
              value={config.testConfiguration.testFramework}
              onChange={(e) => handleTestConfigChange('testFramework', e.target.value)}
            >
              <option value="junit5">JUnit 5</option>
              <option value="junit4">JUnit 4</option>
              <option value="testng">TestNG</option>
            </select>
            <div className="form-help">
              Testing framework for generated test classes
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="spring-boot-version">Spring Boot Version</label>
            <input
              id="spring-boot-version"
              type="text"
              value={config.testConfiguration.springBootVersion}
              onChange={(e) => handleTestConfigChange('springBootVersion', e.target.value)}
              placeholder="3.2.0"
            />
            <div className="form-help">
              Spring Boot version for test annotations
            </div>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Code Generation</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="default-package">Default Package</label>
            <input
              id="default-package"
              type="text"
              value={config.codeGeneration?.defaultPackage || ''}
              onChange={(e) => handleChange('codeGeneration', {
                ...config.codeGeneration,
                defaultPackage: e.target.value,
              })}
              placeholder="com.example.tests"
            />
            <div className="form-help">
              Default package name for generated test classes
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="base-test-class">Base Test Class</label>
            <input
              id="base-test-class"
              type="text"
              value={config.codeGeneration?.baseTestClass || ''}
              onChange={(e) => handleChange('codeGeneration', {
                ...config.codeGeneration,
                baseTestClass: e.target.value,
              })}
              placeholder="BaseIntegrationTest"
            />
            <div className="form-help">
              Base class that all generated tests extend (optional)
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.codeGeneration?.generateStepDefinitions || false}
                onChange={(e) => handleChange('codeGeneration', {
                  ...config.codeGeneration,
                  generateStepDefinitions: e.target.checked,
                })}
              />
              <div className="checkbox-text">
                <strong>Generate Step Definitions</strong>
                <small>Create separate step definition classes for reusable steps</small>
              </div>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.codeGeneration?.includePageObjects || false}
                onChange={(e) => handleChange('codeGeneration', {
                  ...config.codeGeneration,
                  includePageObjects: e.target.checked,
                })}
              />
              <div className="checkbox-text">
                <strong>Include Page Objects</strong>
                <small>Generate page object pattern classes for UI tests</small>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>File Watching</h3>
        <div className="settings-grid">
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.fileWatching?.enabled || false}
                onChange={(e) => handleChange('fileWatching', {
                  ...config.fileWatching,
                  enabled: e.target.checked,
                })}
              />
              <div className="checkbox-text">
                <strong>Enable File Watching</strong>
                <small>Automatically detect changes to specification files</small>
              </div>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.fileWatching?.autoRegenerate || false}
                onChange={(e) => handleChange('fileWatching', {
                  ...config.fileWatching,
                  autoRegenerate: e.target.checked,
                })}
                disabled={!config.fileWatching?.enabled}
              />
              <div className="checkbox-text">
                <strong>Auto-regenerate Tests</strong>
                <small>Automatically regenerate test code when specifications change</small>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};