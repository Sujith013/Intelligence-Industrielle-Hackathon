import React, { useState } from 'react';
import { FiFilter, FiBarChart2, FiAlertTriangle, FiMenu, FiX } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import SortingControls from './SortingControls';
import logo from '../logo.png';

const BarChart2 = FiBarChart2 as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const AlertTriangle = FiAlertTriangle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Filter = FiFilter as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Menu = FiMenu as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const X = FiX as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface TopBarProps {
  onShowComparison?: () => void;
  onShowErrors?: () => void;  
}

const TopBar: React.FC<TopBarProps> = ({ onShowComparison, onShowErrors }) => {
  const { resetSelection } = useAppContext();
  const [showFilters, setShowFilters] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Top Bar for larger screens */}
      <div className="hidden lg:block bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={resetSelection}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src={logo} alt="Logo" className="text-white text-xl rounded-md" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Intelligence Industrielle</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <SearchBar placeHolder='lg'/>
              
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

              <SortingControls screenSize='lg'/>
              
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

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden
            ${showFilters ? "mt-4 bg-gray-800 rounded-lg p-10 max-h-[500px] opacity-100 scale-100" : "max-h-0 opacity-0 scale-95"}`}
          >
            <FilterPanel />
          </div>
        </div>
      </div>

      {/* Top Bar for smaller screens */}
      <div className="lg:hidden bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={resetSelection}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <img src={logo} alt="Logo" className="text-white rounded-md" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Intelligence Industrielle</h1>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-gray-800 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <Menu className="text-lg" />
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setIsSidebarOpen(false)}>
          <div 
            className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gray-900 transform transition-transform duration-300 ease-in-out shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="text-lg" />
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Search</label>
                <SearchBar placeHolder='sm'/>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Actions</h3>
                
                {onShowErrors && (
                  <button
                    onClick={() => {
                      onShowErrors();
                      setIsSidebarOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors duration-200"
                  >
                    <AlertTriangle className="text-sm" />
                    <span className="text-sm">View Errors</span>
                  </button>
                )}

                {onShowComparison && (
                  <button
                    onClick={() => {
                      onShowComparison();
                      setIsSidebarOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors duration-200"
                  >
                    <BarChart2 className="text-sm" />
                    <span className="text-sm">Compare Sites</span>
                  </button>
                )}

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 border
                    ${showFilters 
                      ? 'bg-blue-600/20 border-blue-500/30 text-blue-400' 
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  <Filter className="text-sm" />
                  <span className="text-sm">Filters</span>
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Export & Sort</h3>
                <div className="space-y-2">
                  <SortingControls screenSize='sm'/>
                </div>
              </div>

              {showFilters && (
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Filters</h3>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <FilterPanel />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;