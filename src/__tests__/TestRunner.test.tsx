import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestRunner } from '../renderer/components/TestExecution/TestRunner';
import { SpecificationFile } from '../main/types';

// Mock the CSS import
jest.mock('../renderer/components/TestExecution/TestRunner.css', () => ({}));

describe.skip('TestRunner', () => {
  const mockSpecifications: SpecificationFile[] = [
    {
      id: '1',
      name: 'login.feature',
      filePath: '/specs/login.feature',
      lastModified: new Date('2024-01-01'),
      size: 1024,
    },
    {
      id: '2',
      name: 'registration.feature',
      filePath: '/specs/registration.feature',
      lastModified: new Date('2024-01-02'),
      size: 2048,
    },
  ];

  const defaultProps = {
    specifications: mockSpecifications,
    isLoading: false,
    onExecute: jest.fn(),
    onRefresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders specifications for selection', () => {
    render(<TestRunner {...defaultProps} />);

    expect(screen.getByText('login.feature')).toBeInTheDocument();
    expect(screen.getByText('registration.feature')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<TestRunner {...defaultProps} isLoading />);

    expect(screen.getByText('Loading specifications...')).toBeInTheDocument();
  });

  it('shows empty state when no specifications', () => {
    render(<TestRunner {...defaultProps} specifications={[]} />);

    expect(screen.getByText('No specifications found')).toBeInTheDocument();
    expect(
      screen.getByText('Create some Gherkin specifications to run tests'),
    ).toBeInTheDocument();
  });

  it('handles specification selection', () => {
    render(<TestRunner {...defaultProps} />);

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(
      screen.getByText('1 of 2 specifications selected'),
    ).toBeInTheDocument();
  });

  it('handles select all functionality', () => {
    render(<TestRunner {...defaultProps} />);

    fireEvent.click(screen.getByText('Select All'));

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });

    expect(
      screen.getByText('2 of 2 specifications selected'),
    ).toBeInTheDocument();

    // Test deselect all
    fireEvent.click(screen.getByText('Deselect All'));

    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });

    expect(
      screen.getByText('0 of 2 specifications selected'),
    ).toBeInTheDocument();
  });

  it('handles refresh action', () => {
    const onRefresh = jest.fn();
    render(<TestRunner {...defaultProps} onRefresh={onRefresh} />);

    fireEvent.click(screen.getByText('🔄 Refresh'));

    expect(onRefresh).toHaveBeenCalled();
  });

  it('manages configuration settings', () => {
    render(<TestRunner {...defaultProps} />);

    // Test adding classpath entry
    const classpathInput = screen.getByPlaceholderText('Add classpath entry');
    fireEvent.change(classpathInput, { target: { value: 'new/classpath' } });
    fireEvent.keyPress(classpathInput, { key: 'Enter', code: 13 });

    expect(screen.getByText('new/classpath')).toBeInTheDocument();

    // Test adding Spring profile
    const profileInput = screen.getByPlaceholderText('Add Spring profile');
    fireEvent.change(profileInput, { target: { value: 'dev' } });
    fireEvent.keyPress(profileInput, { key: 'Enter', code: 13 });

    expect(screen.getByText('dev')).toBeInTheDocument();

    // Test adding JVM argument
    const jvmInput = screen.getByPlaceholderText(
      'Add JVM argument (e.g., -Xmx1g)',
    );
    fireEvent.change(jvmInput, { target: { value: '-Xmx1g' } });
    fireEvent.keyPress(jvmInput, { key: 'Enter', code: 13 });

    expect(screen.getByText('-Xmx1g')).toBeInTheDocument();
  });

  it('manages environment variables', () => {
    render(<TestRunner {...defaultProps} />);

    const keyInput = screen.getByPlaceholderText('Variable name');
    const valueInput = screen.getByPlaceholderText('Variable value');

    fireEvent.change(keyInput, { target: { value: 'TEST_ENV' } });
    fireEvent.change(valueInput, { target: { value: 'test_value' } });
    fireEvent.keyPress(keyInput, { key: 'Enter', code: 13 });

    expect(screen.getByText('TEST_ENV')).toBeInTheDocument();
    expect(screen.getByText('test_value')).toBeInTheDocument();
  });

  it('removes configuration items', () => {
    render(<TestRunner {...defaultProps} />);

    // First add an item
    const classpathInput = screen.getByPlaceholderText('Add classpath entry');
    fireEvent.change(classpathInput, { target: { value: 'test/classpath' } });
    fireEvent.keyPress(classpathInput, { key: 'Enter', code: 13 });

    expect(screen.getByText('test/classpath')).toBeInTheDocument();

    // Then remove it
    const removeButton = screen.getAllByText('×')[2]; // Skip the first two which are for default entries
    fireEvent.click(removeButton);

    expect(screen.queryByText('test/classpath')).not.toBeInTheDocument();
  });

  it('executes tests with selected specifications', () => {
    const onExecute = jest.fn();
    render(<TestRunner {...defaultProps} onExecute={onExecute} />);

    // Select a specification
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    // Click execute
    fireEvent.click(screen.getByText(/Execute Tests \(1 specs\)/));

    expect(onExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        specificationPath: '/specs/login.feature',
      }),
    );
  });

  it('prevents execution without selected specifications', () => {
    window.alert = jest.fn();
    const onExecute = jest.fn();
    render(<TestRunner {...defaultProps} onExecute={onExecute} />);

    // Try to execute without selecting any specs
    fireEvent.click(screen.getByText(/Execute Tests \(0 specs\)/));

    expect(window.alert).toHaveBeenCalledWith(
      'Please select at least one specification to execute.',
    );
    expect(onExecute).not.toHaveBeenCalled();
  });

  it('disables execute button when loading', () => {
    render(<TestRunner {...defaultProps} isLoading />);

    const executeButton = screen.getByRole('button', { name: /Starting.../ });
    expect(executeButton).toBeDisabled();
  });

  it('displays specification metadata correctly', () => {
    render(<TestRunner {...defaultProps} />);

    expect(screen.getByText('/specs/login.feature')).toBeInTheDocument();
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
  });

  it('updates selection count dynamically', () => {
    render(<TestRunner {...defaultProps} />);

    expect(
      screen.getByText('0 of 2 specifications selected'),
    ).toBeInTheDocument();

    // Select first spec
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    expect(
      screen.getByText('1 of 2 specifications selected'),
    ).toBeInTheDocument();

    // Select second spec
    fireEvent.click(screen.getAllByRole('checkbox')[1]);
    expect(
      screen.getByText('2 of 2 specifications selected'),
    ).toBeInTheDocument();
  });

  it('handles multiple specification execution', () => {
    const onExecute = jest.fn();
    render(<TestRunner {...defaultProps} onExecute={onExecute} />);

    // Select both specifications
    fireEvent.click(screen.getByText('Select All'));

    // Execute tests
    fireEvent.click(screen.getByText(/Execute Tests \(2 specs\)/));

    expect(onExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        specificationPath: '/specs/login.feature,/specs/registration.feature',
      }),
    );
  });
});
