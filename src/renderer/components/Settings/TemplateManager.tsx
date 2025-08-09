import React, { useState } from 'react';
import { GenerationTemplate } from '../../../main/types';
import './TemplateManager.css';

interface TemplateManagerProps {
  templates: GenerationTemplate[];
  onChange: (templates: GenerationTemplate[]) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  onChange,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<GenerationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<GenerationTemplate>>({});

  const handleCreateNew = () => {
    const newTemplate: GenerationTemplate = {
      id: `template_${Date.now()}`,
      name: 'New Template',
      description: '',
      type: 'junit5',
      content: '// New template content\npackage ${packageName};\n\n// Your template here...',
      variables: [],
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setEditForm(newTemplate);
    setSelectedTemplate(newTemplate);
    setIsEditing(true);
  };

  const handleEdit = (template: GenerationTemplate) => {
    setEditForm({ ...template });
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editForm.id) return;

    const updatedTemplate: GenerationTemplate = {
      ...editForm as GenerationTemplate,
      updatedAt: new Date(),
    };

    const existingIndex = templates.findIndex(t => t.id === editForm.id);
    let newTemplates: GenerationTemplate[];

    if (existingIndex >= 0) {
      newTemplates = [...templates];
      newTemplates[existingIndex] = updatedTemplate;
    } else {
      newTemplates = [...templates, updatedTemplate];
    }

    onChange(newTemplates);
    setSelectedTemplate(updatedTemplate);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
    if (selectedTemplate && templates.find(t => t.id === selectedTemplate.id)) {
      setSelectedTemplate(selectedTemplate);
    } else {
      setSelectedTemplate(null);
    }
  };

  const handleDelete = (template: GenerationTemplate) => {
    const newTemplates = templates.filter(t => t.id !== template.id);
    onChange(newTemplates);
    
    if (selectedTemplate?.id === template.id) {
      setSelectedTemplate(null);
      setIsEditing(false);
    }
  };

  const handleDuplicate = (template: GenerationTemplate) => {
    const duplicated: GenerationTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onChange([...templates, duplicated]);
    setSelectedTemplate(duplicated);
  };

  const handleSetDefault = (template: GenerationTemplate) => {
    const newTemplates = templates.map(t => ({
      ...t,
      isDefault: t.id === template.id,
    }));
    onChange(newTemplates);
  };

  const handleFormChange = (field: keyof GenerationTemplate, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddVariable = () => {
    const newVariable = {
      name: 'newVariable',
      type: 'string' as const,
      defaultValue: '',
      description: '',
    };

    setEditForm(prev => ({
      ...prev,
      variables: [...(prev.variables || []), newVariable],
    }));
  };

  const handleRemoveVariable = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      variables: (prev.variables || []).filter((_, i) => i !== index),
    }));
  };

  const handleVariableChange = (index: number, field: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      variables: (prev.variables || []).map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const defaultTemplates = templates.filter(t => t.isDefault);
  const customTemplates = templates.filter(t => !t.isDefault);

  return (
    <div className="template-manager">
      <div className="template-sidebar">
        <div className="template-actions">
          <button className="btn btn-primary" onClick={handleCreateNew}>
            ➕ New Template
          </button>
        </div>

        <div className="template-sections">
          {defaultTemplates.length > 0 && (
            <div className="template-section">
              <h4>Default Templates</h4>
              <div className="template-list">
                {defaultTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="template-info">
                      <div className="template-name">{template.name}</div>
                      <div className="template-type">{template.type}</div>
                    </div>
                    <div className="template-item-actions">
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(template);
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(template);
                        }}
                        title="Duplicate"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="template-section">
            <h4>Custom Templates ({customTemplates.length})</h4>
            {customTemplates.length === 0 ? (
              <div className="empty-state">
                <p>No custom templates yet</p>
                <small>Create your first template to get started</small>
              </div>
            ) : (
              <div className="template-list">
                {customTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="template-info">
                      <div className="template-name">{template.name}</div>
                      <div className="template-type">{template.type}</div>
                    </div>
                    <div className="template-item-actions">
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(template);
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(template);
                        }}
                        title="Duplicate"
                      >
                        📋
                      </button>
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(template);
                        }}
                        title="Set as default"
                      >
                        ⭐
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(template);
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="template-editor">
        {isEditing ? (
          <div className="edit-form">
            <div className="form-header">
              <h3>{editForm.id && templates.find(t => t.id === editForm.id) ? 'Edit Template' : 'New Template'}</h3>
              <div className="form-actions">
                <button className="btn btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Save
                </button>
              </div>
            </div>

            <div className="form-content">
              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="template-name">Name</label>
                  <input
                    id="template-name"
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Template name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="template-description">Description</label>
                  <textarea
                    id="template-description"
                    value={editForm.description || ''}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Template description"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="template-type">Type</label>
                  <select
                    id="template-type"
                    value={editForm.type || 'junit5'}
                    onChange={(e) => handleFormChange('type', e.target.value)}
                  >
                    <option value="junit5">JUnit 5</option>
                    <option value="junit4">JUnit 4</option>
                    <option value="testng">TestNG</option>
                    <option value="cucumber">Cucumber</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <label htmlFor="template-content">Template Content</label>
                <textarea
                  id="template-content"
                  value={editForm.content || ''}
                  onChange={(e) => handleFormChange('content', e.target.value)}
                  placeholder="Template content with variables like ${packageName}, ${className}, etc."
                  rows={15}
                  className="code-editor"
                />
                <div className="form-help">
                  Use ${'{variableName}'} for template variables. Common variables: packageName, className, specificationName, testMethods
                </div>
              </div>

              <div className="form-section">
                <div className="variables-header">
                  <label>Template Variables</label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-small"
                    onClick={handleAddVariable}
                  >
                    ➕ Add Variable
                  </button>
                </div>

                <div className="variables-list">
                  {(editForm.variables || []).map((variable, index) => (
                    <div key={index} className="variable-item">
                      <div className="variable-fields">
                        <input
                          type="text"
                          value={variable.name}
                          onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                          placeholder="Variable name"
                          className="variable-name"
                        />
                        <select
                          value={variable.type}
                          onChange={(e) => handleVariableChange(index, 'type', e.target.value)}
                          className="variable-type"
                        >
                          <option value="string">String</option>
                          <option value="boolean">Boolean</option>
                          <option value="number">Number</option>
                          <option value="array">Array</option>
                        </select>
                        <input
                          type="text"
                          value={variable.defaultValue || ''}
                          onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                          placeholder="Default value"
                          className="variable-default"
                        />
                      </div>
                      <input
                        type="text"
                        value={variable.description || ''}
                        onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                        placeholder="Variable description"
                        className="variable-description"
                      />
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => handleRemoveVariable(index)}
                        title="Remove variable"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : selectedTemplate ? (
          <div className="template-preview">
            <div className="preview-header">
              <div className="template-title">
                <h3>{selectedTemplate.name}</h3>
                <span className={`template-badge ${selectedTemplate.isDefault ? 'default' : 'custom'}`}>
                  {selectedTemplate.isDefault ? 'Default' : 'Custom'}
                </span>
              </div>
              <div className="preview-actions">
                <button className="btn btn-secondary" onClick={() => handleEdit(selectedTemplate)}>
                  ✏️ Edit
                </button>
                <button className="btn btn-secondary" onClick={() => handleDuplicate(selectedTemplate)}>
                  📋 Duplicate
                </button>
                {!selectedTemplate.isDefault && (
                  <button className="btn btn-secondary" onClick={() => handleSetDefault(selectedTemplate)}>
                    ⭐ Set Default
                  </button>
                )}
              </div>
            </div>

            <div className="template-details">
              <div className="detail-section">
                <h4>Description</h4>
                <p>{selectedTemplate.description || 'No description provided'}</p>
              </div>

              <div className="detail-section">
                <h4>Template Type</h4>
                <p className="template-type-badge">{selectedTemplate.type}</p>
              </div>

              <div className="detail-section">
                <h4>Variables ({selectedTemplate.variables?.length || 0})</h4>
                {selectedTemplate.variables && selectedTemplate.variables.length > 0 ? (
                  <div className="variables-preview">
                    {selectedTemplate.variables.map((variable, index) => (
                      <div key={index} className="variable-preview">
                        <div className="variable-preview-header">
                          <span className="variable-preview-name">${'{' + variable.name + '}'}</span>
                          <span className="variable-preview-type">{variable.type}</span>
                        </div>
                        {variable.description && (
                          <div className="variable-preview-description">{variable.description}</div>
                        )}
                        {variable.defaultValue && (
                          <div className="variable-preview-default">Default: {variable.defaultValue}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-variables">No custom variables defined</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Template Content</h4>
                <pre className="template-content-preview">
                  <code>{selectedTemplate.content}</code>
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-selection">
            <div className="no-selection-content">
              <div className="no-selection-icon">📄</div>
              <h3>Select a Template</h3>
              <p>Choose a template from the sidebar to view or edit it</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};