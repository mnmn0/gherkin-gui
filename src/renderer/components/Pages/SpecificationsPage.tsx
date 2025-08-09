import React, { useState, useEffect } from 'react';
import { SpecificationList } from '../Specifications/SpecificationList';
import { SpecificationEditor } from '../Specifications/SpecificationEditor';
import { SpecificationViewer } from '../Specifications/SpecificationViewer';
import { apiService } from '../../services/ApiService';
import { SpecificationFile } from '../../../main/types';
import './SpecificationsPage.css';

interface SpecificationsPageState {
  specifications: SpecificationFile[];
  selectedSpec: SpecificationFile | null;
  isLoading: boolean;
  error: string | null;
  viewMode: 'list' | 'edit' | 'preview';
  specContent: string;
}

export const SpecificationsPage: React.FC = () => {
  const [state, setState] = useState<SpecificationsPageState>({
    specifications: [],
    selectedSpec: null,
    isLoading: false,
    error: null,
    viewMode: 'list',
    specContent: '',
  });

  useEffect(() => {
    loadSpecifications();
  }, []);

  const loadSpecifications = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const specs = await apiService.listSpecifications();
      setState((prev) => ({
        ...prev,
        specifications: specs,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to load specifications: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleSpecSelect = async (spec: SpecificationFile) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const content = await apiService.loadSpecification(spec.filePath);
      setState((prev) => ({
        ...prev,
        selectedSpec: spec,
        specContent: content,
        viewMode: 'preview',
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to load specification: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleEdit = () => {
    setState((prev) => ({ ...prev, viewMode: 'edit' }));
  };

  const handleSave = async (content: string) => {
    if (!state.selectedSpec) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await apiService.saveSpecification(state.selectedSpec.name, content);
      setState((prev) => ({
        ...prev,
        specContent: content,
        viewMode: 'preview',
        isLoading: false,
      }));
      await loadSpecifications();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to save specification: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleCreate = async (name: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await apiService.createSpecification(name);
      await loadSpecifications();
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to create specification: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleDelete = async (spec: SpecificationFile) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await apiService.deleteSpecification(spec.filePath);
      await loadSpecifications();
      if (state.selectedSpec?.id === spec.id) {
        setState((prev) => ({
          ...prev,
          selectedSpec: null,
          specContent: '',
          viewMode: 'list',
        }));
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to delete specification: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleCancel = () => {
    setState((prev) => ({ ...prev, viewMode: 'preview' }));
  };

  const handleBack = () => {
    setState((prev) => ({
      ...prev,
      selectedSpec: null,
      specContent: '',
      viewMode: 'list',
    }));
  };

  return (
    <div className="specifications-page">
      <div className="page-header">
        <h1>Test Specifications</h1>
        <p>Manage your Gherkin test specifications</p>
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

      <div className="page-content">
        {state.viewMode === 'list' && (
          <SpecificationList
            specifications={state.specifications}
            isLoading={state.isLoading}
            onSelect={handleSpecSelect}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onRefresh={loadSpecifications}
          />
        )}

        {state.viewMode === 'preview' && state.selectedSpec && (
          <SpecificationViewer
            specification={state.selectedSpec}
            content={state.specContent}
            onEdit={handleEdit}
            onBack={handleBack}
          />
        )}

        {state.viewMode === 'edit' && state.selectedSpec && (
          <SpecificationEditor
            specification={state.selectedSpec}
            content={state.specContent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
};
