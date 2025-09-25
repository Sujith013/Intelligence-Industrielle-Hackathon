import React, {useState} from 'react';
import {FiFilter, FiBarChart2, FiAlertTriangle } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import SortingControls from './SortingControls';
import logo from '../logo.png';

const BarChart2 = FiBarChart2 as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const AlertTriangle = FiAlertTriangle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Filter = FiFilter as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface TopBarProps {
  onShowComparison?: () => void;
  onShowErrors?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onShowComparison, onShowErrors }) => {
  const { resetSelection } = useAppContext();
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-gray-900 border-b border-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={resetSelection} >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="text-white text-xl rounded-md" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Intelligence Industrielle</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <SearchBar />
            
            {onShowErrors && (
              <button
                onClick={onShowErrors}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors duration-200"
              >
                <AlertTriangle className="text-sm" />
                <span className="text-sm">Errors</span>
              </button>
            )}

            {onShowComparison && (
              <button
                onClick={onShowComparison}
                className="flex items-center space-x-2 px-3 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors duration-200"
              >
                <BarChart2 className="text-sm" />
                <span className="text-sm">Compare</span>
              </button>
            )}

            <SortingControls />
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                p-2 rounded-lg transition-colors duration-200
                ${showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }
              `}
            >
              <Filter className="text-lg" />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 bg-gray-800 rounded-lg p-4">
            <FilterPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;