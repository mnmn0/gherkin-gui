import React, { useState } from 'react';
import { SpecificationFile } from '../../../main/types';
import './SpecificationList.css';

interface SpecificationListProps {
  specifications: SpecificationFile[];
  isLoading: boolean;
  onSelect: (spec: SpecificationFile) => void;
  onCreate: (name: string) => void;
  onDelete: (spec: SpecificationFile) => void;
  onRefresh: () => void;
}

export const SpecificationList: React.FC<SpecificationListProps> = ({
  specifications,
  isLoading,
  onSelect,
  onCreate,
  onDelete,
  onRefresh,
}) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);

  const handleCreate = async () => {
    if (newSpecName.trim()) {
      await onCreate(newSpecName.trim());
      setNewSpecName('');
      setShowCreateDialog(false);
    }
  };

  const handleDelete = async (spec: SpecificationFile) => {
    if (window.confirm(`Are you sure you want to delete "${spec.name}"?`)) {
      await onDelete(spec);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="specification-list">
      <div className="list-header">
        <div className="list-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateDialog(true)}
            disabled={isLoading}
          >
            📝 New Specification
          </button>
          <button
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={isLoading}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {showCreateDialog && (
        <div className="create-dialog">
          <div className="dialog-content">
            <h3>Create New Specification</h3>
            <input
              type="text"
              placeholder="Enter specification name (e.g., user-login)"
              value={newSpecName}
              onChange={(e) => setNewSpecName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <div className="dialog-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={!newSpecName.trim()}
              >
                Create
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewSpecName('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="list-content">
        {isLoading && (
          <div className="loading">
            <div className="loading-spinner" />
            <span>Loading specifications...</span>
          </div>
        )}

        {!isLoading && specifications.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No specifications found</h3>
            <p>Create your first Gherkin specification to get started</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateDialog(true)}
            >
              Create Specification
            </button>
          </div>
        )}

        {!isLoading && specifications.length > 0 && (
          <div className="spec-grid">
            {specifications.map((spec) => (
              <div
                key={spec.id}
                className={`spec-card ${selectedSpec === spec.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedSpec(spec.id);
                  onSelect(spec);
                }}
              >
                <div className="spec-header">
                  <div className="spec-icon">📋</div>
                  <div className="spec-actions">
                    <button
                      className="action-btn delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(spec);
                      }}
                      title="Delete specification"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="spec-content">
                  <h3 className="spec-name">{spec.name}</h3>
                  <div className="spec-meta">
                    <div className="meta-item">
                      <span className="meta-label">Size:</span>
                      <span className="meta-value">
                        {formatFileSize(spec.size)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Modified:</span>
                      <span className="meta-value">
                        {formatDate(spec.lastModified)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
