import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SortingControls from './SortingControls';
import { AppProvider } from '../context/AppContext';

// Mock URL.createObjectURL and related methods for file download tests
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();

Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
});

// Mock createElement for the download link
const originalCreateElement = document.createElement;
const mockLink = {
  href: '',
  download: '',
  click: mockClick,
};

beforeEach(() => {
  mockCreateObjectURL.mockReturnValue('mock-url');
  document.createElement = jest.fn((tagName) => {
    if (tagName === 'a') {
      return mockLink as any;
    }
    return originalCreateElement.call(document, tagName);
  });
});

afterEach(() => {
  jest.clearAllMocks();
  document.createElement = originalCreateElement;
});

const renderWithProvider = (props = {}) => {
  return render(
    <AppProvider>
      <SortingControls {...props} />
    </AppProvider>
  );
};

describe('SortingControls Component', () => {
  it('should render sorting dropdown and export buttons', () => {
    renderWithProvider();
    
    expect(screen.getByDisplayValue('Departments A-Z')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
  });

  it('should have correct layout for large screens', () => {
    renderWithProvider({ screenSize: 'lg' });
    
    const container = screen.getByText('JSON').closest('div')?.parentElement;
    expect(container).toHaveClass('flex', 'flex-row');
  });

  it('should have correct layout for small screens', () => {
    renderWithProvider({ screenSize: 'sm' });
    
    const container = screen.getByText('JSON').closest('div')?.parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'space-y-4');
  });

  it('should allow changing sort options', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const sortSelect = screen.getByDisplayValue('Departments A-Z');
    await user.selectOptions(sortSelect, 'name-desc');
    
    expect(sortSelect).toHaveValue('name-desc');
  });

  it('should export JSON when JSON button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const jsonButton = screen.getByText('JSON');
    await user.click(jsonButton);
    
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockLink.download).toBe('industrial_sites_data.json');
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should export CSV when CSV button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const csvButton = screen.getByText('CSV');
    await user.click(csvButton);
    
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(mockLink.download).toBe('industrial_sites_data.csv');
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it('should display arrow up icon', () => {
    renderWithProvider();
    
    // Check if the icon container is present
    const iconContainer = screen.getByDisplayValue('Departments A-Z').previousElementSibling;
    expect(iconContainer).toHaveClass('flex', 'items-center', 'space-x-2');
  });
});