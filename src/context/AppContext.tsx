import React, { createContext, useContext, useState, useMemo } from 'react';
import { IndustrialData, Site, FilterState, SortState } from '../types';
import industrialData from '../data/industrial_sites.json';

interface AppContextType {
  data: IndustrialData;
  selectedSite: Site | null;
  selectedDepartmentId: string | null;
  filters: FilterState;
  sorting: SortState;
  setSelectedSite: (site: Site | null) => void;
  setSelectedDepartmentId: (departmentId: string | null) => void;
  setFilters: (filters: FilterState) => void;
  setSorting: (sorting: SortState) => void;
  filteredSites: Site[];
  resetSelection: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialFilters: FilterState = {
  siteLocation: '',
  departmentType: '',
  machineStatus: '',
  machineType: '',
  temperatureThreshold: null,
  uptimeThreshold: null,
  searchQuery: '',
};

const initialSorting: SortState = {
  departmentBy: 'name',
  machineBy: 'uptime',
  teamBy: 'name',
  direction: 'asc',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [sorting, setSorting] = useState<SortState>(initialSorting);

  const filteredSites = useMemo(() => {
    return industrialData.sites.filter(site => {
      if (filters.siteLocation && !site.location.toLowerCase().includes(filters.siteLocation.toLowerCase())) {
        return false;
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const siteMatch = site.site_name.toLowerCase().includes(query);
        const departmentMatch = site.departments.some(dept => 
          dept.department_name.toLowerCase().includes(query) ||
          dept.head.toLowerCase().includes(query)
        );
        const machineMatch = site.departments.some(dept =>
          dept.machines.some(machine => machine.machine_id.toLowerCase().includes(query))
        );
        
        if (!siteMatch && !departmentMatch && !machineMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [filters]);

  const resetSelection = () => {
    setSelectedSite(null);
    setSelectedDepartmentId(null);
  };

  return (
    <AppContext.Provider
      value={{
        data: industrialData as IndustrialData,
        selectedSite,
        selectedDepartmentId,
        filters,
        sorting,
        setSelectedSite,
        setSelectedDepartmentId,
        setFilters,
        setSorting,
        filteredSites,
        resetSelection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};