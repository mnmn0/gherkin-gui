import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SpecificationList } from '../renderer/components/Specifications/SpecificationList';
import { SpecificationFile } from '../main/types';

// Mock the CSS import
jest.mock(
  '../renderer/components/Specifications/SpecificationList.css',
  () => ({}),
);

describe('SpecificationList', () => {
  const mockSpecifications: SpecificationFile[] = [
    {
      id: '1',
      name: 'user-login.feature',
      filePath: '/path/to/user-login.feature',
      lastModified: new Date('2024-01-01'),
      size: 1024,
    },
    {
      id: '2',
      name: 'user-registration.feature',
      filePath: '/path/to/user-registration.feature',
      lastModified: new Date('2024-01-02'),
      size: 2048,
    },
  ];

  const defaultProps = {
    specifications: mockSpecifications,
    isLoading: false,
    searchTerm: '',
    selectedSpec: null,
    onSelect: jest.fn(),
    onDelete: jest.fn(),
    onCreate: jest.fn(),
    onRefresh: jest.fn(),
    onSearchChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders specifications list', () => {
    render(<SpecificationList {...defaultProps} />);

    expect(screen.getByText('user-login.feature')).toBeInTheDocument();
    expect(screen.getByText('user-registration.feature')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<SpecificationList {...defaultProps} isLoading />);

    expect(screen.getByText('Loading specifications...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows empty state when no specifications', () => {
    render(<SpecificationList {...defaultProps} specifications={[]} />);

    expect(screen.getByText('No specifications found')).toBeInTheDocument();
    expect(
      screen.getByText('Create your first Gherkin specification'),
    ).toBeInTheDocument();
  });

  it('handles specification selection', () => {
    const onSelect = jest.fn();
    render(<SpecificationList {...defaultProps} onSelect={onSelect} />);

    fireEvent.click(screen.getByText('user-login.feature'));

    expect(onSelect).toHaveBeenCalledWith(mockSpecifications[0]);
  });

  it('handles specification deletion', async () => {
    const onDelete = jest.fn();
    render(<SpecificationList {...defaultProps} onDelete={onDelete} />);

    // Find and click delete button for first specification
    const deleteButtons = screen.getAllByTitle('Delete specification');
    fireEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockSpecifications[0]);
  });

  it('handles create new specification', () => {
    const onCreate = jest.fn();
    render(<SpecificationList {...defaultProps} onCreate={onCreate} />);

    fireEvent.click(screen.getByText('New Specification'));

    expect(onCreate).toHaveBeenCalled();
  });

  it('handles refresh', () => {
    const onRefresh = jest.fn();
    render(<SpecificationList {...defaultProps} onRefresh={onRefresh} />);

    fireEvent.click(screen.getByTitle('Refresh list'));

    expect(onRefresh).toHaveBeenCalled();
  });

  it('handles search input', () => {
    const onSearchChange = jest.fn();
    render(
      <SpecificationList {...defaultProps} onSearchChange={onSearchChange} />,
    );

    const searchInput = screen.getByPlaceholderText('Search specifications...');
    fireEvent.change(searchInput, { target: { value: 'login' } });

    expect(onSearchChange).toHaveBeenCalledWith('login');
  });

  it('filters specifications based on search term', () => {
    render(<SpecificationList {...defaultProps} searchTerm="login" />);

    expect(screen.getByText('user-login.feature')).toBeInTheDocument();
    expect(
      screen.queryByText('user-registration.feature'),
    ).not.toBeInTheDocument();
  });

  it('highlights selected specification', () => {
    render(
      <SpecificationList
        {...defaultProps}
        selectedSpec={mockSpecifications[0]}
      />,
    );

    const selectedItem = screen
      .getByText('user-login.feature')
      .closest('.spec-item');
    expect(selectedItem).toHaveClass('selected');
  });

  it('displays specification metadata', () => {
    render(<SpecificationList {...defaultProps} />);

    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    expect(screen.getByText('2.0 KB')).toBeInTheDocument();
    expect(screen.getByText('1/1/2024')).toBeInTheDocument();
    expect(screen.getByText('1/2/2024')).toBeInTheDocument();
  });

  it('shows correct specification count', () => {
    render(<SpecificationList {...defaultProps} />);

    expect(screen.getByText('2 specifications')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    const onSelect = jest.fn();
    render(<SpecificationList {...defaultProps} onSelect={onSelect} />);

    const firstSpec = screen
      .getByText('user-login.feature')
      .closest('.spec-item');

    // Simulate pressing Enter
    fireEvent.keyDown(firstSpec!, { key: 'Enter', code: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(mockSpecifications[0]);
  });

  it('sorts specifications by name', () => {
    const unsortedSpecs = [...mockSpecifications].reverse();
    render(
      <SpecificationList {...defaultProps} specifications={unsortedSpecs} />,
    );

    const specElements = screen.getAllByText(/\.feature$/);
    expect(specElements[0]).toHaveTextContent('user-login.feature');
    expect(specElements[1]).toHaveTextContent('user-registration.feature');
  });
});
