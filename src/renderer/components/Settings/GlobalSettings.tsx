import React from 'react';
import { GlobalConfig } from '../../../main/types';
import './GlobalSettings.css';

interface GlobalSettingsProps {
  config: GlobalConfig;
  onChange: (config: GlobalConfig) => void;
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  config,
  onChange,
}) => {
  const handleChange = (field: keyof GlobalConfig, value: any) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const handleEditorChange = (field: string, value: any) => {
    onChange({
      ...config,
      editor: {
        ...config.editor,
        [field]: value,
      },
    });
  };

  const handleUIChange = (field: string, value: any) => {
    onChange({
      ...config,
      ui: {
        ...config.ui,
        [field]: value,
      },
    });
  };

  return (
    <div className="global-settings">
      <div className="settings-section">
        <h3>Application Preferences</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={config.language || 'en'}
              onChange={(e) => handleChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
            <div className="form-help">
              Display language for the application
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={config.theme || 'light'}
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
            <div className="form-help">Application color theme</div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.autoSave || false}
                onChange={(e) => handleChange('autoSave', e.target.checked)}
              />
              <div className="checkbox-text">
                <strong>Auto-save Changes</strong>
                <small>
                  Automatically save changes to specifications and settings
                </small>
              </div>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.showWelcomeScreen || false}
                onChange={(e) =>
                  handleChange('showWelcomeScreen', e.target.checked)
                }
              />
              <div className="checkbox-text">
                <strong>Show Welcome Screen</strong>
                <small>Display welcome screen on application startup</small>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Editor Settings</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="font-family">Font Family</label>
            <select
              id="font-family"
              value={config.editor?.fontFamily || 'Monaco'}
              onChange={(e) => handleEditorChange('fontFamily', e.target.value)}
            >
              <option value="Monaco">Monaco</option>
              <option value="Menlo">Menlo</option>
              <option value="Ubuntu Mono">Ubuntu Mono</option>
              <option value="Consolas">Consolas</option>
              <option value="Courier New">Courier New</option>
              <option value="Source Code Pro">Source Code Pro</option>
            </select>
            <div className="form-help">Font family for the code editor</div>
          </div>

          <div className="form-group">
            <label htmlFor="font-size">Font Size</label>
            <select
              id="font-size"
              value={config.editor?.fontSize?.toString() || '14'}
              onChange={(e) =>
                handleEditorChange('fontSize', parseInt(e.target.value))
              }
            >
              <option value="10">10px</option>
              <option value="11">11px</option>
              <option value="12">12px</option>
              <option value="13">13px</option>
              <option value="14">14px</option>
              <option value="16">16px</option>
              <option value="18">18px</option>
              <option value="20">20px</option>
            </select>
            <div className="form-help">Font size for the code editor</div>
          </div>

          <div className="form-group">
            <label htmlFor="tab-size">Tab Size</label>
            <select
              id="tab-size"
              value={config.editor?.tabSize?.toString() || '2'}
              onChange={(e) =>
                handleEditorChange('tabSize', parseInt(e.target.value))
              }
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="8">8 spaces</option>
            </select>
            <div className="form-help">Number of spaces for indentation</div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.editor?.wordWrap || false}
                onChange={(e) =>
                  handleEditorChange('wordWrap', e.target.checked)
                }
              />
              <div className="checkbox-text">
                <strong>Word Wrap</strong>
                <small>Wrap long lines in the editor</small>
              </div>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.editor?.showLineNumbers || true}
                onChange={(e) =>
                  handleEditorChange('showLineNumbers', e.target.checked)
                }
              />
              <div className="checkbox-text">
                <strong>Show Line Numbers</strong>
                <small>Display line numbers in the editor</small>
              </div>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.editor?.highlightActiveLine || true}
                onChange={(e) =>
                  handleEditorChange('highlightActiveLine', e.target.checked)
                }
              />
              <div className="checkbox-text">
                <strong>Highlight Active Line</strong>
                <small>Highlight the current line in the editor</small>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>User Interface</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="sidebar-width">Sidebar Width</label>
            <input
              id="sidebar-width"
              type="range"
              min="200"
              max="400"
              step="20"
              value={config.ui?.sidebarWidth || 280}
              onChange={(e) =>
                handleUIChange('sidebarWidth', parseInt(e.target.value))
              }
            />
            <div className="form-help">
              Width of the navigation sidebar ({config.ui?.sidebarWidth || 280}
              px)
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="zoom-level">Zoom Level</label>
            <select
              id="zoom-level"
              value={config.ui?.zoomLevel?.toString() || '1'}
              onChange={(e) =>
                handleUIChange('zoomLevel', parseFloat(e.target.value))
              }
            >
              <option value="0.8">80%</option>
              <option value="0.9">90%</option>
              <option value="1">100%</option>
              <option value="1.1">110%</option>
              <option value="1.2">120%</option>
              <option value="1.5">150%</option>
            </select>
            <div className="form-help">
              Overall zoom level for the application
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.ui?.compactMode || false}
                onChange={(e) =>
                  handleUIChange('compactMode', e.target.checked)
                }
              />
              <div className="checkbox-text">
                <strong>Compact Mode</strong>
                <small>Use smaller spacing and more compact layout</small>
              </div>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.ui?.showStatusBar || true}
                onChange={(e) =>
                  handleUIChange('showStatusBar', e.target.checked)
                }
              />
              <div className="checkbox-text">
                <strong>Show Status Bar</strong>
                <small>
                  Display status information at the bottom of the window
                </small>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Advanced Settings</h3>
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="max-recent-files">Max Recent Files</label>
            <input
              id="max-recent-files"
              type="number"
              min="5"
              max="50"
              value={config.maxRecentFiles || 10}
              onChange={(e) =>
                handleChange('maxRecentFiles', parseInt(e.target.value))
              }
            />
            <div className="form-help">
              Maximum number of recent files to remember
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="backup-interval">Backup Interval (minutes)</label>
            <input
              id="backup-interval"
              type="number"
              min="1"
              max="60"
              value={config.backupInterval || 5}
              onChange={(e) =>
                handleChange('backupInterval', parseInt(e.target.value))
              }
            />
            <div className="form-help">
              How often to create automatic backups
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.enableTelemetry || false}
                onChange={(e) =>
                  handleChange('enableTelemetry', e.target.checked)
                }
              />
              <div className="checkbox-text">
                <strong>Enable Telemetry</strong>
                <small>
                  Send anonymous usage data to help improve the application
                </small>
              </div>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.enableDebugLogging || false}
                onChange={(e) =>
                  handleChange('enableDebugLogging', e.target.checked)
                }
              />
              <div className="checkbox-text">
                <strong>Enable Debug Logging</strong>
                <small>
                  Enable detailed logging for troubleshooting (may impact
                  performance)
                </small>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
