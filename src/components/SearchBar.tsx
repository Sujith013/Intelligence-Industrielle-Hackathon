import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const Search = FiSearch as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface SearchBarProps {
  placeHolder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeHolder }) => {
  
  const { filters, setFilters } = useAppContext();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeHolder==="sm"?"Search...":"Search machines, departments, or sites..."}
        value={filters.searchQuery}
        onChange={handleSearchChange}
        className={`
          block ${placeHolder==="sm"?'w-70':'w-80'} pl-10 pr-3 py-2 border border-gray-700
          rounded-lg bg-gray-800 text-white placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:border-transparent transition-colors duration-200
        `}
      />
    </div>
  );
};

export default SearchBar;