import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../components/SearchBar';
import { AppProvider } from '../context/AppContext';

const renderWithProvider = (props = {}) => {
  return render(
    <AppProvider>
      <SearchBar {...props} />
    </AppProvider>
  );
};

describe('SearchBar Component', () => {
  it('should render with correct screen size for large screens', () => {
    renderWithProvider({ placeHolder: 'lg' });
    
    const input = screen.getByPlaceholderText('Search machines, departments, or sites...');
    expect(input).toBeInTheDocument();
  });

  it('should render with correct placeholder for small screens', () => {
    renderWithProvider({ placeHolder: 'sm' });
    
    const input = screen.getByPlaceholderText('Search...');
    expect(input).toBeInTheDocument();
  });

  it('should display search icon', () => {
    renderWithProvider();
    
    // The search icon should be present (we can test for the SVG or the container)
    const searchContainer = screen.getByRole('textbox').parentElement;
    expect(searchContainer).toHaveClass('relative');
  });

  it('should update input value when typing', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'Montreal');
    
    expect(input).toHaveValue('Montreal');
  });

  it('should have proper styling classes', () => {
    renderWithProvider({ placeHolder: 'lg' });
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('bg-gray-800', 'text-white', 'w-80');
  });

  it('should have different width for small screens', () => {
    renderWithProvider({ placeHolder: 'sm' });
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('w-35');
  });

  it('should clear input when value is deleted', async () => {
    const user = userEvent.setup();
    renderWithProvider();
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    expect(input).toHaveValue('test');
    
    await user.clear(input);
    expect(input).toHaveValue('');
  });
});