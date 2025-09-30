import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the Google Maps iframe
beforeAll(() => {
  const originalCreateElement = document.createElement;
  document.createElement = jest.fn((tagName) => {
    if (tagName === 'iframe') {
      return {
        ...originalCreateElement.call(document, tagName),
        src: '',
        loading: '',
        className: '',
      };
    }
    return originalCreateElement.call(document, tagName);
  });
});

describe('App Component', () => {
  it('should render the application title', () => {
    render(<App />);
    
    expect(screen.getByText('Intelligence Industrielle')).toBeInTheDocument();
  });

  it('should render the TopBar component', () => {
    render(<App />);
    
    // Check for search input which is part of TopBar
    expect(screen.getByPlaceholderText(/Search machines, departments, or sites/)).toBeInTheDocument();
  });

  it('should render SitePieChart initially', () => {
    render(<App />);
    
    // Check for pie chart title
    expect(screen.getByText('Industrial Sites Overview')).toBeInTheDocument();
  });

  it('should display the correct number of sites', () => {
    render(<App />);
    
    // Should show 3 sites available
    expect(screen.getByText(/3 sites available/)).toBeInTheDocument();
  });

  it('should show site details when a site is selected', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Find and click on a site card (Montreal Facility)
    const montrealSite = screen.getByText('Montreal Facility');
    await user.click(montrealSite);
    
    // Should now show site details
    expect(screen.getByText('Back to Sites Overview')).toBeInTheDocument();
    expect(screen.getByText('Montreal Facility')).toBeInTheDocument();
  });

  it('should return to overview when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Select a site first
    const montrealSite = screen.getByText('Montreal Facility');
    await user.click(montrealSite);
    
    // Click back button
    const backButton = screen.getByText('Back to Sites Overview');
    await user.click(backButton);
    
    // Should be back to overview
    expect(screen.getByText('Industrial Sites Overview')).toBeInTheDocument();
  });

  it('should open comparison view when Compare button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Find and click compare button
    const compareButton = screen.getByText('Compare');
    await user.click(compareButton);
    
    // Should show comparison modal
    expect(screen.getByText('Site Comparison')).toBeInTheDocument();
  });

  it('should open error dashboard when Errors button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Find and click errors button
    const errorsButton = screen.getByText('Errors');
    await user.click(errorsButton);
    
    // Should show error dashboard
    expect(screen.getByText('Error Dashboard')).toBeInTheDocument();
  });

  it('should filter sites based on search query', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Type in search box
    const searchInput = screen.getByPlaceholderText(/Search machines, departments, or sites/);
    await user.type(searchInput, 'montreal');
    
    // Should still show sites (filtered)
    expect(screen.getByText('Montreal Facility')).toBeInTheDocument();
    expect(screen.queryByText('Toronto Operations')).not.toBeInTheDocument();
    expect(screen.queryByText('Vancouver City Plant')).not.toBeInTheDocument();
  });

  it('should reset selection when logo is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Select a site first
    const montrealSite = screen.getByText('Montreal Facility');
    await user.click(montrealSite);
    
    // Click on logo/title to reset
    const logo = screen.getByAltText('Logo');
    await user.click(logo);
    
    // Should be back to overview
    expect(screen.getByText('Industrial Sites Overview')).toBeInTheDocument();
  });
});