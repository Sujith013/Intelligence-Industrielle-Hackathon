import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterPanel from '../components/FilterPanel';
import { AppProvider } from '../context/AppContext';

const renderWithProvider = () => {
  return render(
    <AppProvider>
      <FilterPanel />
    </AppProvider>
  );
};

describe('FilterPanel Component', () => {
  it('should render filter title and clear button', () => {
    renderWithProvider();
    
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('should render all filter dropdowns', () => {
    renderWithProvider();
    
    expect(screen.getByLabelText('Site Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Department')).toBeInTheDocument();
    expect(screen.getByLabelText('Machine Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Machine Type')).toBeInTheDocument();
  });

  it('should render temperature and uptime threshold inputs', () => {
    renderWithProvider();
    
    expect(screen.getByLabelText('Temperature Threshold (°C)')).toBeInTheDocument();
    expect(screen.getByLabelText('Min Uptime Hours')).toBeInTheDocument();
  });

  it('should have correct default values', () => {
    renderWithProvider();
    
    const locationSelect = screen.getByLabelText('Site Location');
    const departmentSelect = screen.getByLabelText('Department');
    
    expect(locationSelect).toHaveValue('');
    expect(departmentSelect).toHaveValue('');
  });

  it('should populate site location options from data', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const locationSelect = screen.getByLabelText('Site Location');
    expect(locationSelect).toHaveTextContent("All Locations");
    
    // Check if Montreal, QC is an option (from our test data)
    await user.selectOptions(locationSelect, 'Montreal, QC');
    expect(locationSelect).toHaveTextContent("Montreal, QC");
  });

  it('should allow selecting machine status', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const statusSelect = screen.getByLabelText('Machine Status');
    await user.selectOptions(statusSelect, 'online');
    
    expect(statusSelect).toHaveValue('online');
  });

  it('should allow inputting temperature threshold', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const tempInput = screen.getByLabelText('Temperature Threshold (°C)');
    await user.type(tempInput, '80');
    
    expect(tempInput).toHaveValue(80);
  });

  it('should allow inputting uptime threshold', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const uptimeInput = screen.getByLabelText('Min Uptime Hours');
    await user.type(uptimeInput, '1000');
    
    expect(uptimeInput).toHaveValue(1000);
  });

  it('should clear all filters when Clear All is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    // Set some filter values first
    const locationSelect = screen.getByLabelText('Site Location');
    await user.selectOptions(locationSelect, 'Montreal, QC');
    
    const tempInput = screen.getByLabelText('Temperature Threshold (°C)');
    await user.type(tempInput, '80');
    
    // Click clear all
    const clearButton = screen.getByText('Clear All');
    await user.click(clearButton);
    
    // Check values are reset
    expect(locationSelect).toHaveValue('');
    expect(tempInput).toHaveValue(null);
  });
});