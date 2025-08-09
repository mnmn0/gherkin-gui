import React, { useState, useEffect } from 'react';
import { CodeGenerator } from '../CodeGeneration/CodeGenerator';
import { CodePreview } from '../CodeGeneration/CodePreview';
import { apiService } from '../../services/ApiService';
import { SpecificationFile, GenerationConfig } from '../../../main/types';
import './Page.css';
import './CodeGenerationPage.css';

interface CodeGenerationPageState {
  specifications: SpecificationFile[];
  selectedSpec: SpecificationFile | null;
  specContent: string;
  generatedCode: string;
  config: GenerationConfig;
  isLoading: boolean;
  error: string | null;
  viewMode: 'generator' | 'preview';
}

export const CodeGenerationPage: React.FC = () => {
  const [state, setState] = useState<CodeGenerationPageState>({
    specifications: [],
    selectedSpec: null,
    specContent: '',
    generatedCode: '',
    config: {
      packageName: 'com.example.test',
      className: '',
      springBootAnnotations: ['@SpringBootTest'],
    },
    isLoading: false,
    error: null,
    viewMode: 'generator',
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
      const className = `${spec.name
        .replace('.feature', '')
        .split(/[-_\s]+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join('')}Test`;

      setState((prev) => ({
        ...prev,
        selectedSpec: spec,
        specContent: content,
        config: { ...prev.config, className },
        generatedCode: '',
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

  const handleGenerate = async (config: GenerationConfig) => {
    if (!state.selectedSpec || !state.specContent) return;

    setState((prev) => ({ ...prev, isLoading: true, config }));
    try {
      const code = await apiService.generateCode(state.specContent, config);
      setState((prev) => ({
        ...prev,
        generatedCode: code,
        viewMode: 'preview',
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to generate code: ${error}`,
        isLoading: false,
      }));
    }
  };

  const handleBack = () => {
    setState((prev) => ({ ...prev, viewMode: 'generator' }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Code Generation</h1>
        <p>Generate JUnit test code from Gherkin specifications</p>
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

      <div className="code-generation-content">
        {state.viewMode === 'generator' && (
          <CodeGenerator
            specifications={state.specifications}
            selectedSpec={state.selectedSpec}
            specContent={state.specContent}
            config={state.config}
            isLoading={state.isLoading}
            onSpecSelect={handleSpecSelect}
            onGenerate={handleGenerate}
            onRefresh={loadSpecifications}
          />
        )}

        {state.viewMode === 'preview' && state.selectedSpec && (
          <CodePreview
            specification={state.selectedSpec}
            generatedCode={state.generatedCode}
            config={state.config}
            onBack={handleBack}
            onRegenerate={() =>
              setState((prev) => ({ ...prev, viewMode: 'generator' }))
            }
          />
        )}
      </div>
    </div>
  );
};
