import React, { useState } from 'react';
import { ConfigurationPreset, ProjectConfig, GlobalConfig } from '../../../main/types';
import './PresetManager.css';

interface PresetManagerProps {
  presets: ConfigurationPreset[];
  currentProjectConfig: ProjectConfig;
  currentGlobalConfig: GlobalConfig;
  onApplyPreset: (preset: ConfigurationPreset) => void;
  onCreatePreset: (preset: Omit<ConfigurationPreset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeletePreset: (presetId: string) => void;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  presets,
  currentProjectConfig,
  currentGlobalConfig,
  onApplyPreset,
  onCreatePreset,
  onDeletePreset,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ConfigurationPreset | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: 'project' as const,
    includeProjectConfig: true,
    includeGlobalConfig: false,
  });

  const handleCreateNew = () => {
    setIsCreating(true);
    setCreateForm({
      name: '',
      description: '',
      category: 'project',
      includeProjectConfig: true,
      includeGlobalConfig: false,
    });
  };

  const handleSavePreset = () => {
    const config: any = {};

    if (createForm.includeProjectConfig) {
      Object.assign(config, currentProjectConfig);
    }

    if (createForm.includeGlobalConfig) {
      Object.assign(config, currentGlobalConfig);
    }

    const newPreset: Omit<ConfigurationPreset, 'id' | 'createdAt' | 'updatedAt'> = {
      name: createForm.name,
      description: createForm.description,
      category: createForm.category,
      config,
      isBuiltIn: false,
    };

    onCreatePreset(newPreset);
    setIsCreating(false);
    setCreateForm({
      name: '',
      description: '',
      category: 'project',
      includeProjectConfig: true,
      includeGlobalConfig: false,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setCreateForm({
      name: '',
      description: '',
      category: 'project',
      includeProjectConfig: true,
      includeGlobalConfig: false,
    });
  };

  const builtInPresets = presets.filter(p => p.isBuiltIn);
  const customPresets = presets.filter(p => !p.isBuiltIn);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project': return '🏗️';
      case 'testing': return '🧪';
      case 'generation': return '⚙️';
      case 'editor': return '✏️';
      default: return '📄';
    }
  };

  const renderPresetCard = (preset: ConfigurationPreset) => (
    <div
      key={preset.id}
      className={`preset-card ${selectedPreset?.id === preset.id ? 'selected' : ''}`}
      onClick={() => setSelectedPreset(preset)}
    >
      <div className="preset-header">
        <div className="preset-title">
          <span className="preset-icon">{getCategoryIcon(preset.category)}</span>
          <span className="preset-name">{preset.name}</span>
        </div>
        <div className="preset-actions">
          <button
            className="btn btn-primary btn-small"
            onClick={(e) => {
              e.stopPropagation();
              onApplyPreset(preset);
            }}
          >
            Apply
          </button>
          {!preset.isBuiltIn && (
            <button
              className="btn btn-secondary btn-small"
              onClick={(e) => {
                e.stopPropagation();
                onDeletePreset(preset.id);
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="preset-description">
        {preset.description}
      </div>

      <div className="preset-meta">
        <span className="preset-category">{preset.category}</span>
        {preset.isBuiltIn && <span className="preset-built-in">Built-in</span>}
      </div>
    </div>
  );

  return (
    <div className="preset-manager">
      <div className="preset-actions">
        <button className="btn btn-primary" onClick={handleCreateNew}>
          ➕ Create Preset
        </button>
      </div>

      {isCreating && (
        <div className="create-preset-form">
          <div className="form-header">
            <h3>Create Configuration Preset</h3>
            <div className="form-header-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSavePreset}
                disabled={!createForm.name.trim()}
              >
                Save Preset
              </button>
            </div>
          </div>

          <div className="form-content">
            <div className="form-group">
              <label htmlFor="preset-name">Preset Name</label>
              <input
                id="preset-name"
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter preset name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="preset-description">Description</label>
              <textarea
                id="preset-description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this preset configures"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="preset-category">Category</label>
              <select
                id="preset-category"
                value={createForm.category}
                onChange={(e) => setCreateForm(prev => ({ ...prev, category: e.target.value as any }))}
              >
                <option value="project">Project Settings</option>
                <option value="testing">Testing Configuration</option>
                <option value="generation">Code Generation</option>
                <option value="editor">Editor Preferences</option>
              </select>
            </div>

            <div className="form-group">
              <label>Include Settings</label>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={createForm.includeProjectConfig}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      includeProjectConfig: e.target.checked 
                    }))}
                  />
                  <div className="checkbox-text">
                    <strong>Project Configuration</strong>
                    <small>Include project-specific settings</small>
                  </div>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={createForm.includeGlobalConfig}
                    onChange={(e) => setCreateForm(prev => ({ 
                      ...prev, 
                      includeGlobalConfig: e.target.checked 
                    }))}
                  />
                  <div className="checkbox-text">
                    <strong>Global Configuration</strong>
                    <small>Include application-wide settings</small>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="presets-section">
        {builtInPresets.length > 0 && (
          <div className="preset-category-section">
            <h3>Built-in Presets</h3>
            <p>Pre-configured settings for common scenarios</p>
            <div className="preset-grid">
              {builtInPresets.map(renderPresetCard)}
            </div>
          </div>
        )}

        <div className="preset-category-section">
          <h3>Custom Presets ({customPresets.length})</h3>
          <p>Your saved configuration presets</p>
          {customPresets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h4>No custom presets</h4>
              <p>Create your first preset to save and reuse configurations</p>
            </div>
          ) : (
            <div className="preset-grid">
              {customPresets.map(renderPresetCard)}
            </div>
          )}
        </div>
      </div>

      {selectedPreset && (
        <div className="preset-detail">
          <div className="detail-header">
            <div className="detail-title">
              <span className="detail-icon">{getCategoryIcon(selectedPreset.category)}</span>
              <div>
                <h4>{selectedPreset.name}</h4>
                <p>{selectedPreset.description}</p>
              </div>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => onApplyPreset(selectedPreset)}
            >
              Apply Preset
            </button>
          </div>

          <div className="config-preview">
            <h5>Configuration Preview</h5>
            <pre className="config-json">
              {JSON.stringify(selectedPreset.config, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};