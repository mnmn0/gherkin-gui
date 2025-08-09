import React, { useState, useEffect } from 'react';
import { ProjectSettings } from '../Settings/ProjectSettings';
import { GlobalSettings } from '../Settings/GlobalSettings';
import { TemplateManager } from '../Settings/TemplateManager';
import { PresetManager } from '../Settings/PresetManager';
import { apiService } from '../../services/ApiService';
import {
  ProjectConfig,
  GlobalConfig,
  GenerationTemplate,
  ConfigurationPreset,
} from '../../../main/types';
import './Page.css';
import './SettingsPage.css';

interface SettingsPageState {
  projectConfig: ProjectConfig | null;
  globalConfig: GlobalConfig | null;
  templates: GenerationTemplate[];
  presets: ConfigurationPreset[];
  isLoading: boolean;
  error: string | null;
  activeTab: 'project' | 'global' | 'templates' | 'presets';
  hasUnsavedChanges: boolean;
}

export const SettingsPage: React.FC = () => {
  const [state, setState] = useState<SettingsPageState>({
    projectConfig: null,
    globalConfig: null,
    templates: [],
    presets: [],
    isLoading: false,
    error: null,
    activeTab: 'project',
    hasUnsavedChanges: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const [projectConfig, globalConfig, templates, presets] =
        await Promise.all([
          apiService.getProjectConfig(),
          apiService.getGlobalConfig(),
          apiService.getGenerationTemplates(),
          apiService.getConfigurationPresets(),
        ]);

      setState((prev) => ({
        ...prev,
        projectConfig,
        globalConfig,
        templates,
        presets,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `設定の読み込みに失敗しました: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleProjectConfigChange = (config: ProjectConfig) => {
    setState((prev) => ({
      ...prev,
      projectConfig: config,
      hasUnsavedChanges: true,
    }));
  };

  const handleGlobalConfigChange = (config: GlobalConfig) => {
    setState((prev) => ({
      ...prev,
      globalConfig: config,
      hasUnsavedChanges: true,
    }));
  };

  const handleTemplatesChange = (templates: GenerationTemplate[]) => {
    setState((prev) => ({
      ...prev,
      templates,
      hasUnsavedChanges: true,
    }));
  };

  const handleApplyPreset = (preset: ConfigurationPreset) => {
    const updates: any = { hasUnsavedChanges: true };

    if (preset.config.projectName !== undefined) {
      updates.projectConfig = { ...state.projectConfig, ...preset.config };
    }

    if (
      preset.config.language !== undefined ||
      preset.config.theme !== undefined
    ) {
      updates.globalConfig = { ...state.globalConfig, ...preset.config };
    }

    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleCreatePreset = async (
    presetData: Omit<ConfigurationPreset, 'id' | 'createdAt' | 'updatedAt'>,
  ) => {
    try {
      const newPreset = await apiService.createConfigurationPreset(presetData);
      setState((prev) => ({
        ...prev,
        presets: [...prev.presets, newPreset],
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `プリセットの作成に失敗しました: ${error}`,
      }));
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    try {
      await apiService.deleteConfigurationPreset(presetId);
      setState((prev) => ({
        ...prev,
        presets: prev.presets.filter((p) => p.id !== presetId),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `プリセットの削除に失敗しました: ${error}`,
      }));
    }
  };

  const handleSave = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const savePromises: Promise<any>[] = [];

      if (state.projectConfig) {
        savePromises.push(apiService.saveProjectConfig(state.projectConfig));
      }

      if (state.globalConfig) {
        savePromises.push(apiService.saveGlobalConfig(state.globalConfig));
      }

      if (state.templates) {
        savePromises.push(apiService.saveGenerationTemplates(state.templates));
      }

      await Promise.all(savePromises);

      setState((prev) => ({
        ...prev,
        hasUnsavedChanges: false,
        isLoading: false,
      }));

      // Settings saved successfully
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `設定の保存に失敗しました: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleReset = async () => {
    await loadSettings();
    setState((prev) => ({ ...prev, hasUnsavedChanges: false }));
  };

  const handleExportSettings = async () => {
    try {
      const settings = {
        project: state.projectConfig,
        global: state.globalConfig,
        templates: state.templates,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(settings, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gherkin-gui-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `設定のエクスポートに失敗しました: ${error}`,
      }));
    }
  };

  const handleImportSettings = async (file: File) => {
    try {
      const text = await file.text();
      const settings = JSON.parse(text);

      if (settings.project) {
        setState((prev) => ({
          ...prev,
          projectConfig: settings.project,
          hasUnsavedChanges: true,
        }));
      }

      if (settings.global) {
        setState((prev) => ({
          ...prev,
          globalConfig: settings.global,
          hasUnsavedChanges: true,
        }));
      }

      if (settings.templates) {
        setState((prev) => ({
          ...prev,
          templates: settings.templates,
          hasUnsavedChanges: true,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `設定のインポートに失敗しました: ${error}`,
      }));
    }
  };

  const renderTabContent = () => {
    if (state.isLoading && !state.projectConfig) {
      return (
        <div className="loading">
          <div className="loading-spinner" />
          <span>設定を読み込み中...</span>
        </div>
      );
    }

    switch (state.activeTab) {
      case 'project':
        return state.projectConfig ? (
          <ProjectSettings
            config={state.projectConfig}
            onChange={handleProjectConfigChange}
          />
        ) : null;

      case 'global':
        return state.globalConfig ? (
          <GlobalSettings
            config={state.globalConfig}
            onChange={handleGlobalConfigChange}
          />
        ) : null;

      case 'templates':
        return (
          <TemplateManager
            templates={state.templates}
            onChange={handleTemplatesChange}
          />
        );

      case 'presets':
        return state.projectConfig && state.globalConfig ? (
          <PresetManager
            presets={state.presets}
            currentProjectConfig={state.projectConfig}
            currentGlobalConfig={state.globalConfig}
            onApplyPreset={handleApplyPreset}
            onCreatePreset={handleCreatePreset}
            onDeletePreset={handleDeletePreset}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h1>設定</h1>
            <p>プロジェクトとグローバル設定の構成</p>
          </div>
          <div className="header-actions">
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              id="import-settings"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportSettings(file);
                  e.target.value = '';
                }
              }}
            />
            <button
              className="btn btn-secondary"
              onClick={() =>
                document.getElementById('import-settings')?.click()
              }
            >
              📥 インポート
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleExportSettings}
            >
              📤 エクスポート
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={!state.hasUnsavedChanges}
            >
              🔄 リセット
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!state.hasUnsavedChanges || state.isLoading}
            >
              {state.isLoading ? (
                <>
                  <div className="loading-spinner small" />
                  保存中...
                </>
              ) : (
                <>💾 変更を保存</>
              )}
            </button>
          </div>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab-btn ${state.activeTab === 'project' ? 'active' : ''}`}
            onClick={() =>
              setState((prev) => ({ ...prev, activeTab: 'project' }))
            }
          >
            🏗️ プロジェクト設定
          </button>
          <button
            className={`tab-btn ${state.activeTab === 'global' ? 'active' : ''}`}
            onClick={() =>
              setState((prev) => ({ ...prev, activeTab: 'global' }))
            }
          >
            🌐 グローバル設定
          </button>
          <button
            className={`tab-btn ${state.activeTab === 'templates' ? 'active' : ''}`}
            onClick={() =>
              setState((prev) => ({ ...prev, activeTab: 'templates' }))
            }
          >
            📄 テンプレート ({state.templates.length})
          </button>
          <button
            className={`tab-btn ${state.activeTab === 'presets' ? 'active' : ''}`}
            onClick={() =>
              setState((prev) => ({ ...prev, activeTab: 'presets' }))
            }
          >
            📦 プリセット ({state.presets.length})
          </button>
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

      {state.hasUnsavedChanges && (
        <div className="changes-banner">
          <span className="changes-icon">⚠️</span>
          <span>未保存の変更があります</span>
          <div className="changes-actions">
            <button className="btn-link" onClick={handleReset}>
              破棄
            </button>
            <button className="btn btn-primary btn-small" onClick={handleSave}>
              今すぐ保存
            </button>
          </div>
        </div>
      )}

      <div className="settings-content">{renderTabContent()}</div>
    </div>
  );
};
