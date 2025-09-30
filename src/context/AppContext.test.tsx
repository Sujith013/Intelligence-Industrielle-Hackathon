import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider, useAppContext } from './AppContext';

// Test component to access context
const TestComponent: React.FC = () => {
  const {
    data,
    selectedSite,
    setSelectedSite,
    filters,
    setFilters,
    filteredSites,
    resetSelection,
  } = useAppContext();

  return (
    <div>
      <span data-testid="sites-count">{data.sites.length}</span>
      <span data-testid="filtered-sites-count">{filteredSites.length}</span>
      <span data-testid="selected-site">
        {selectedSite ? selectedSite.site_name : 'No site selected'}
      </span>
      <span data-testid="search-query">{filters.searchQuery}</span>
      
      <button
        data-testid="select-first-site"
        onClick={() => setSelectedSite(data.sites[0])}
      >
        Select First Site
      </button>
      
      <button
        data-testid="search-montreal"
        onClick={() => setFilters({ ...filters, searchQuery: 'montreal' })}
      >
        Search Montreal
      </button>
      
      <button
        data-testid="reset"
        onClick={resetSelection}
      >
        Reset
      </button>
    </div>
  );
};

describe('AppContext', () => {
  const renderWithProvider = () => {
    return render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
  };

  it('should provide industrial sites data', () => {
    renderWithProvider();
    
    const sitesCount = screen.getByTestId('sites-count');
    expect(sitesCount).toHaveTextContent('3');
  });

  it('should initially have no selected site', () => {
    renderWithProvider();
    
    const selectedSite = screen.getByTestId('selected-site');
    expect(selectedSite).toHaveTextContent('No site selected');
  });

  it('should allow selecting a site', () => {
    renderWithProvider();
    
    const selectButton = screen.getByTestId('select-first-site');
    fireEvent.click(selectButton);
    
    const selectedSite = screen.getByTestId('selected-site');
    expect(selectedSite).toHaveTextContent('Montreal Facility');
  });

  it('should filter sites based on search query', () => {
    renderWithProvider();
    
    const filteredCount = screen.getByTestId('filtered-sites-count');
    expect(filteredCount).toHaveTextContent('3');
    
    const searchButton = screen.getByTestId('search-montreal');
    fireEvent.click(searchButton);
    
    const searchQuery = screen.getByTestId('search-query');
    expect(searchQuery).toHaveTextContent('montreal');
    
    expect(filteredCount).toHaveTextContent('1');
  });

  it('should reset selection', () => {
    renderWithProvider();
    
    // Select a site first
    const selectButton = screen.getByTestId('select-first-site');
    fireEvent.click(selectButton);
    
    // Reset the selection
    const resetButton = screen.getByTestId('reset');
    fireEvent.click(resetButton);
    
    const selectedSite = screen.getByTestId('selected-site');
    expect(selectedSite).toHaveTextContent('No site selected');
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAppContext must be used within an AppProvider');
    
    consoleSpy.mockRestore();
  });
});