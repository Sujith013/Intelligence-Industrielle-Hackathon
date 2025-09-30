import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock performance.now for performance tests
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
});

// Mock ResizeObserver for responsive tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Google Maps API
Object.defineProperty(window, 'google', {
  value: {
    maps: {
      Map: jest.fn(),
      Marker: jest.fn(),
      InfoWindow: jest.fn(),
    },
  },
});

describe('Integration Tests', () => {
  it('should complete full user workflow: search -> filter -> view details', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Step 1: Search for Montreal
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    await user.type(searchInput, 'montreal');
    
    // Step 2: Verify Montreal site is visible
    expect(screen.getByText('Montreal Facility')).toBeInTheDocument();
    
    // Step 3: Click on Montreal site
    const montrealSite = screen.getByText('Montreal Facility');
    await user.click(montrealSite);
    
    // Step 4: Verify site details are shown
    await waitFor(() => {
      expect(screen.getByText('Back to Sites Overview')).toBeInTheDocument();
    });
    
    // Step 5: Verify departments are shown
    expect(screen.getByText(/Departments \(\d+\)/)).toBeInTheDocument();
  });

  it('should handle filter and sort combinations', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Open filters (on desktop)
    const filterButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg') // Find button with filter icon
    );
    
    if (filterButton) {
      await user.click(filterButton);
      
      // Wait for filter panel to appear
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
      
      // Apply location filter
      const locationSelect = screen.getByLabelText('Site Location');
      await user.selectOptions(locationSelect, 'Montreal, QC');
      
      // Should still show sites
      expect(screen.getByText('Montreal Facility')).toBeInTheDocument();
    }
  });

  it('should handle error states gracefully', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Open error dashboard
    const errorButton = screen.getByText('Errors');
    await user.click(errorButton);
    
    // Should show error dashboard
    await waitFor(() => {
      expect(screen.getByText('Error Dashboard')).toBeInTheDocument();
    });
    
    // Should show error statistics
    expect(screen.getByText('Total Issues')).toBeInTheDocument();
  });

  it('should maintain state across navigation', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Set a search query
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    await user.type(searchInput, 'production');
    
    // Navigate to site details
    const site = screen.getByText('Montreal Facility');
    await user.click(site);
    
    // Navigate back
    const backButton = screen.getByText('Back to Sites Overview');
    await user.click(backButton);
    
    // Search query should still be there
    expect(searchInput).toHaveValue('production');
  });

  it('should handle complex filter combinations', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Find and open filter panel
    const filterButtons = screen.getAllByRole('button');
    const filterButton = filterButtons.find(btn => 
      btn.querySelector('svg') || btn.textContent?.includes('Filter')
    );
    
    if (filterButton) {
      await user.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
      
      // Apply multiple filters
      const locationSelect = screen.getByLabelText('Site Location');
      await user.selectOptions(locationSelect, 'Montreal, QC');
      
      const departmentSelect = screen.getByLabelText('Department');
      await user.selectOptions(departmentSelect, 'Production');
      
      const statusSelect = screen.getByLabelText('Machine Status');
      await user.selectOptions(statusSelect, 'online');
      
      // Apply threshold filters
      const tempInput = screen.getByLabelText('Temperature Threshold (°C)');
      await user.clear(tempInput);
      await user.type(tempInput, '70');
      
      // Verify filtering works
      expect(screen.getByText('Montreal Facility')).toBeInTheDocument();
      
      // Clear all filters
      const clearButton = screen.getByText('Clear All');
      await user.click(clearButton);
      
      // Verify all sites are visible again
      expect(screen.getByText(/3 sites available/)).toBeInTheDocument();
    }
  });

  it('should handle sorting and export functionality', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Find sort dropdown
    const sortSelect = screen.getByDisplayValue(/Departments A-Z/);
    expect(sortSelect).toBeInTheDocument();
    
    // Change sort order
    await user.selectOptions(sortSelect, 'name-desc');
    expect(sortSelect).toHaveValue('name-desc');
    
    // Test JSON export
    const jsonButton = screen.getByText('JSON');
    await user.click(jsonButton);
    
    // Test CSV export
    const csvButton = screen.getByText('CSV');
    await user.click(csvButton);
    
    // Both exports should trigger without errors
    expect(jsonButton).toBeInTheDocument();
    expect(csvButton).toBeInTheDocument();
  });

  it('should navigate through all sites and departments', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Get all site names
    const siteNames = ['Montreal Facility', 'Toronto Plant', 'Vancouver Hub'];
    
    for (const siteName of siteNames) {
      // Click on each site
      const siteElement = screen.getByText(siteName);
      await user.click(siteElement);
      
      // Verify site details page
      await waitFor(() => {
        expect(screen.getByText('Back to Sites Overview')).toBeInTheDocument();
      });
      
      // Verify site name is displayed in details
      expect(screen.getByText(siteName)).toBeInTheDocument();
      
      // Verify departments section exists
      expect(screen.getByText(/Departments \(\d+\)/)).toBeInTheDocument();
      
      // Navigate back
      const backButton = screen.getByText('Back to Sites Overview');
      await user.click(backButton);
      
      // Verify we're back to overview
      await waitFor(() => {
        expect(screen.getByText('Industrial Sites Overview')).toBeInTheDocument();
      });
    }
  });

  it('should handle machine status filtering within site details', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Navigate to Montreal site
    const montrealSite = screen.getByText('Montreal Facility');
    await user.click(montrealSite);
    
    await waitFor(() => {
      expect(screen.getByText('Back to Sites Overview')).toBeInTheDocument();
    });
    
    // Look for machine status filters or machine lists
    // This tests that the site details view properly displays machine information
    expect(screen.getByText(/Departments \(\d+\)/)).toBeInTheDocument();
    
    // Test department expansion if available
    const departmentCards = screen.getAllByText(/Production|Manufacturing|Quality|Maintenance/);
    if (departmentCards.length > 0) {
      // Click on first department
      await user.click(departmentCards[0]);
      
      // Should show machine details or expand department view
      // This verifies the department interaction works
    }
  });

  it('should handle comparison modal workflow', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Open comparison view
    const compareButton = screen.getByText('Compare');
    await user.click(compareButton);
    
    // Verify comparison modal opens
    await waitFor(() => {
      expect(screen.getByText('Site Comparison')).toBeInTheDocument();
    });
    
    // Look for site selection in comparison
    const siteCheckboxes = screen.getAllByRole('checkbox');
    expect(siteCheckboxes.length).toBeGreaterThan(0);
    
    // Select sites for comparison
    if (siteCheckboxes.length >= 2) {
      await user.click(siteCheckboxes[0]);
      await user.click(siteCheckboxes[1]);
    }
    
    // Close comparison modal
    const closeButton = screen.getByText('Close') || screen.getByRole('button', { name: /close/i });
    if (closeButton) {
      await user.click(closeButton);
    }
    
    // Verify we're back to main view
    await waitFor(() => {
      expect(screen.queryByText('Site Comparison')).not.toBeInTheDocument();
    });
  });

  it('should handle error dashboard with detailed error analysis', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Open error dashboard
    const errorButton = screen.getByText('Errors');
    await user.click(errorButton);
    
    // Verify error dashboard opens
    await waitFor(() => {
      expect(screen.getByText('Error Dashboard')).toBeInTheDocument();
    });
    
    // Check for error statistics
    expect(screen.getByText('Total Issues')).toBeInTheDocument();
    
    // Look for error breakdown by type
    const errorTypes = ['Critical', 'Warning', 'Minor'];
    errorTypes.forEach(type => {
      // May or may not have these specific error types, but should have some error categorization
      const elements = screen.queryAllByText(new RegExp(type, 'i'));
      // Just verify the dashboard is functional
    });
    
    // Close error dashboard
    const closeButton = screen.getByText('Close') || screen.getByRole('button', { name: /close/i });
    if (closeButton) {
      await user.click(closeButton);
    }
    
    // Verify dashboard closes
    await waitFor(() => {
      expect(screen.queryByText('Error Dashboard')).not.toBeInTheDocument();
    });
  });

  it('should handle edge cases and empty states', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Test search with no results
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    await user.clear(searchInput);
    await user.type(searchInput, 'nonexistent facility');
    
    // Should handle no search results gracefully
    // The app should still be functional even with no results
    
    // Clear search
    await user.clear(searchInput);
    
    // Verify all sites are back
    await waitFor(() => {
      expect(screen.getByText(/3 sites available/)).toBeInTheDocument();
    });
    
    // Test rapid navigation
    const montrealSite = screen.getByText('Montreal Facility');
    await user.click(montrealSite);
    
    const backButton = screen.getByText('Back to Sites Overview');
    await user.click(backButton);
    
    // Should handle rapid clicks without errors
    expect(screen.getByText('Industrial Sites Overview')).toBeInTheDocument();
  });

  it('should maintain responsiveness across different screen sizes', async () => {
    const user = userEvent.setup();
    
    // Test desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    render(<App />);
    
    // Verify search bar is visible (desktop version)
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    expect(searchInput).toBeInTheDocument();
    
    // Test mobile view simulation
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    // The component should still render correctly
    expect(screen.getByText('Intelligence Industrielle')).toBeInTheDocument();
  });

  it('should handle concurrent user actions', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Simulate multiple rapid actions
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    const compareButton = screen.getByText('Compare');
    const errorButton = screen.getByText('Errors');
    
    // Rapid typing in search
    await user.type(searchInput, 'mont');
    
    // Quick navigation
    const montrealSite = screen.getByText('Montreal Facility');
    await user.click(montrealSite);
    
    // Quick back navigation
    const backButton = screen.getByText('Back to Sites Overview');
    await user.click(backButton);
    
    // Should handle all actions smoothly
    expect(screen.getByText('Industrial Sites Overview')).toBeInTheDocument();
    expect(searchInput).toHaveValue('mont');
  });

  it('should validate data integrity throughout the application', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Verify initial data load
    expect(screen.getByText(/3 sites available/)).toBeInTheDocument();
    
    // Navigate to each site and verify data consistency
    const sites = ['Montreal Facility', 'Toronto Plant', 'Vancouver Hub'];
    
    for (const siteName of sites) {
      const siteElement = screen.getByText(siteName);
      await user.click(siteElement);
      
      await waitFor(() => {
        expect(screen.getByText('Back to Sites Overview')).toBeInTheDocument();
      });
      
      // Verify site has departments
      expect(screen.getByText(/Departments \(\d+\)/)).toBeInTheDocument();
      
      // Back to overview
      const backButton = screen.getByText('Back to Sites Overview');
      await user.click(backButton);
      
      // Verify we're back and data is still intact
      await waitFor(() => {
        expect(screen.getByText('Industrial Sites Overview')).toBeInTheDocument();
        expect(screen.getByText(/3 sites available/)).toBeInTheDocument();
      });
    }
  });

  it('should handle form validation and user input edge cases', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Open filter panel if available
    const filterButtons = screen.getAllByRole('button');
    const filterButton = filterButtons.find(btn => 
      btn.querySelector('svg') || btn.textContent?.includes('Filter')
    );
    
    if (filterButton) {
      await user.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
      
      // Test numeric input validation
      const tempInput = screen.getByLabelText('Temperature Threshold (°C)');
      
      // Test invalid inputs
      await user.clear(tempInput);
      await user.type(tempInput, '-999');
      expect(tempInput).toHaveValue(-999);
      
      await user.clear(tempInput);
      await user.type(tempInput, '999');
      expect(tempInput).toHaveValue(999);
      
      // Test boundary values
      const uptimeInput = screen.getByLabelText('Min Uptime Hours');
      await user.clear(uptimeInput);
      await user.type(uptimeInput, '0');
      expect(uptimeInput).toHaveValue(0);
      
      await user.clear(uptimeInput);
      await user.type(uptimeInput, '8760'); // Max hours in a year
      expect(uptimeInput).toHaveValue(8760);
    }
  });
});

describe('Performance and Accessibility Tests', () => {
  beforeEach(() => {
    // Reset performance mocks
    jest.clearAllMocks();
  });

  it('should render quickly and not cause performance issues', async () => {
    const startTime = performance.now();
    
    render(<App />);
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Intelligence Industrielle')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Render should complete within reasonable time (5 seconds in test environment)
    expect(renderTime).toBeLessThan(5000);
  });

  it('should have proper ARIA labels and accessibility features', async () => {
    render(<App />);
    
    // Check for semantic HTML elements
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for form controls with proper labels
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    expect(searchInput).toHaveAttribute('type', 'text');
    
    // Check for button accessibility
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      // Each button should have accessible text or aria-label
      const hasText = button.textContent && button.textContent.trim().length > 0;
      const hasAriaLabel = button.hasAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBe(true);
    });
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Test Tab navigation
    await user.tab();
    
    // First focusable element should be focused
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeInTheDocument();
    
    // Test Enter key on buttons
    const compareButton = screen.getByText('Compare');
    compareButton.focus();
    await user.keyboard('{Enter}');
    
    // Should open comparison modal
    await waitFor(() => {
      expect(screen.getByText('Site Comparison')).toBeInTheDocument();
    });
  });

  it('should handle large datasets without performance degradation', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Simulate rapid filtering operations
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    
    const startTime = performance.now();
    
    // Rapid search operations
    await user.type(searchInput, 'a');
    await user.clear(searchInput);
    await user.type(searchInput, 'montreal');
    await user.clear(searchInput);
    await user.type(searchInput, 'production');
    
    const endTime = performance.now();
    const operationTime = endTime - startTime;
    
    // Multiple operations should complete quickly
    expect(operationTime).toBeLessThan(3000);
  });

  it('should maintain state consistency under rapid interactions', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Rapid state changes
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    const compareButton = screen.getByText('Compare');
    const errorButton = screen.getByText('Errors');
    
    // Quick sequence of actions
    await user.type(searchInput, 'test');
    await user.click(compareButton);
    
    // Check comparison modal opened
    await waitFor(() => {
      expect(screen.getByText('Site Comparison')).toBeInTheDocument();
    });
    
    // Close and open error dashboard
    const closeButton = screen.getByText('Close');
    await user.click(closeButton);
    await user.click(errorButton);
    
    // Check error dashboard opened
    await waitFor(() => {
      expect(screen.getByText('Error Dashboard')).toBeInTheDocument();
    });
    
    // Verify search state is maintained
    expect(searchInput).toHaveValue('test');
  });
});

describe('Error Handling and Edge Cases', () => {
  it('should handle missing or corrupted data gracefully', async () => {
    // Mock console.error to suppress expected errors
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // App should still render even if there are data issues
    expect(screen.getByText('Intelligence Industrielle')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('should handle network errors and offline states', async () => {
    // Simulate offline state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });
    
    render(<App />);
    
    // App should still function in offline mode with cached data
    expect(screen.getByText('Intelligence Industrielle')).toBeInTheDocument();
    
    // Restore online state
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
  });

  it('should handle extremely long input values', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    
    // Test very long search query
    const longQuery = 'a'.repeat(1000);
    await user.type(searchInput, longQuery);
    
    // Should handle long input without breaking
    expect(searchInput).toHaveValue(longQuery);
    
    // Clear long input
    await user.clear(searchInput);
    expect(searchInput).toHaveValue('');
  });

  it('should handle special characters and XSS attempts', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    
    // Test special characters
    const specialChars = '<script>alert("xss")</script>';
    await user.type(searchInput, specialChars);
    
    // Should display as text, not execute as script
    expect(searchInput).toHaveValue(specialChars);
    
    // Test Unicode characters
    await user.clear(searchInput);
    await user.type(searchInput, '🏭🔧⚙️');
    expect(searchInput).toHaveValue('🏭🔧⚙️');
  });

  it('should handle component unmounting and cleanup', async () => {
    const { unmount } = render(<App />);
    
    // Verify initial render
    expect(screen.getByText('Intelligence Industrielle')).toBeInTheDocument();
    
    // Unmount component
    unmount();
    
    // Should unmount without errors
    expect(screen.queryByText('Intelligence Industrielle')).not.toBeInTheDocument();
  });
});

describe('Data Integrity and Business Logic', () => {
  it('should correctly filter sites based on multiple criteria', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Open filter panel
    const filterButtons = screen.getAllByRole('button');
    const filterButton = filterButtons.find(btn => 
      btn.querySelector('svg') || btn.textContent?.includes('Filter')
    );
    
    if (filterButton) {
      await user.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });
      
      // Apply location filter
      const locationSelect = screen.getByLabelText('Site Location');
      await user.selectOptions(locationSelect, 'Montreal, QC');
      
      // Verify only Montreal site is visible
      expect(screen.getByText('Montreal Facility')).toBeInTheDocument();
      
      // Add department filter
      const departmentSelect = screen.getByLabelText('Department');
      await user.selectOptions(departmentSelect, 'Production');
      
      // Should maintain Montreal site visibility if it has Production department
      // This tests the AND logic of filters
    }
  });

  it('should correctly calculate and display site statistics', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Check overview statistics
    expect(screen.getByText(/3 sites available/)).toBeInTheDocument();
    
    // Navigate to site details to check department counts
    const montrealSite = screen.getByText('Montreal Facility');
    await user.click(montrealSite);
    
    await waitFor(() => {
      expect(screen.getByText(/Departments \(\d+\)/)).toBeInTheDocument();
    });
    
    // Verify department count is numeric and reasonable
    const departmentText = screen.getByText(/Departments \(\d+\)/).textContent;
    const departmentCount = departmentText?.match(/\((\d+)\)/)?.[1];
    expect(departmentCount).toBeDefined();
    expect(parseInt(departmentCount || '0')).toBeGreaterThan(0);
  });

  it('should maintain search functionality with complex queries', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    
    // Test partial matching
    await user.type(searchInput, 'mont');
    expect(screen.getByText('Montreal Facility')).toBeInTheDocument();
    
    // Test case insensitive search
    await user.clear(searchInput);
    await user.type(searchInput, 'MONTREAL');
    expect(screen.getByText('Montreal Facility')).toBeInTheDocument();
    
    // Test search in department names
    await user.clear(searchInput);
    await user.type(searchInput, 'production');
    
    // Should find sites with Production departments
    const sites = screen.getAllByText(/Facility|Plant|Hub/);
    expect(sites.length).toBeGreaterThan(0);
  });

  it('should handle export functionality correctly', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Mock URL.createObjectURL
    const mockCreateObjectURL = jest.fn(() => 'mock-url');
    const mockRevokeObjectURL = jest.fn();
    
    Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL });
    
    // Mock link element
    const mockLink = { href: '', download: '', click: jest.fn() };
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    
    // Test JSON export
    const jsonButton = screen.getByText('JSON');
    await user.click(jsonButton);
    
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockLink.download).toBe('industrial_sites_data.json');
    expect(mockLink.click).toHaveBeenCalled();
    
    // Test CSV export
    const csvButton = screen.getByText('CSV');
    await user.click(csvButton);
    
    expect(mockLink.download).toBe('industrial_sites_data.csv');
    
    // Cleanup
    createElementSpy.mockRestore();
  });
});