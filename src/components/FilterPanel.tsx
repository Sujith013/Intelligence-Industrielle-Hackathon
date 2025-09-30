import React from 'react';
import { useAppContext } from '../context/AppContext';

const FilterPanel: React.FC = () => {
  const { filters, setFilters, data } = useAppContext();

  const locations = Array.from(new Set(data.sites.map(site => site.location)));
  const departmentTypes = Array.from(new Set(data.sites.flatMap(site => site.departments.map(dept => dept.department_name))));
  const machineStatuses = ['online', 'offline', 'maintenance', 'error'];
  const machineTypes = Array.from(new Set(data.sites.flatMap(site => 
    site.departments.flatMap(dept => dept.machines.map(machine => machine.type))
  )));

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    setFilters({
      siteLocation: '',
      departmentType: '',
      machineStatus: '',
      machineType: '',
      temperatureThreshold: null,
      uptimeThreshold: null,
      searchQuery: filters.searchQuery, // Keep search query
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="site-location" className="block text-sm font-medium text-gray-300 mb-1">
            Site Location
          </label>
          <select
            id="site-location"
            value={filters.siteLocation}
            onChange={(e) => handleFilterChange('siteLocation', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-1">
            Department
          </label>
          <select
            id="department"
            value={filters.departmentType}
            onChange={(e) => handleFilterChange('departmentType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="machine-status" className="block text-sm font-medium text-gray-300 mb-1">
            Machine Status
          </label>
          <select
            id="machine-status"
            value={filters.machineStatus}
            onChange={(e) => handleFilterChange('machineStatus', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {machineStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="machine-type" className="block text-sm font-medium text-gray-300 mb-1">
            Machine Type
          </label>
          <select
            id="machine-type"
            value={filters.machineType}
            onChange={(e) => handleFilterChange('machineType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {machineTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="temperature-threshold" className="block text-sm font-medium text-gray-300 mb-1">
            Temperature Threshold (°C)
          </label>
          <input
            id="temperature-threshold"
            type="number"
            placeholder="e.g., 80"
            value={filters.temperatureThreshold || ''}
            onChange={(e) => handleFilterChange('temperatureThreshold', e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="uptime-threshold" className="block text-sm font-medium text-gray-300 mb-1">
            Min Uptime Hours
          </label>
          <input
            id="uptime-threshold"
            type="number"
            placeholder="e.g., 1000"
            value={filters.uptimeThreshold || ''}
            onChange={(e) => handleFilterChange('uptimeThreshold', e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;