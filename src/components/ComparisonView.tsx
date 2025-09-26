import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiMapPin } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import { Site } from '../types';
import { useAppContext } from '../context/AppContext';

const X = FiX as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const MapPin = FiMapPin as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface ComparisonViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ isOpen, onClose }) => {
  const { data } = useAppContext();
  const [selectedSites, setSelectedSites] = useState<Site[]>([]);

  const handleSiteToggle = (site: Site) => {
    if (selectedSites.find(s => s.site_id === site.site_id)) {
      setSelectedSites(selectedSites.filter(s => s.site_id !== site.site_id));
    } else if (selectedSites.length < 2) {
      setSelectedSites([...selectedSites, site]);
    }
  };

  const getComparisonData = () => {
    if (selectedSites.length < 2) return null;

    const [site1, site2] = selectedSites;
    
    const getStatusCounts = (site: Site) => {
      const allMachines = site.departments.flatMap(d => d.machines);
      return {
        online: allMachines.filter(m => m.status === 'online').length,
        offline: allMachines.filter(m => m.status === 'offline').length,
        maintenance: allMachines.filter(m => m.status === 'maintenance').length,
        error: allMachines.filter(m => m.status === 'error').length,
      };
    };

    const site1Stats = getStatusCounts(site1);
    const site2Stats = getStatusCounts(site2);

    const statusData = [
      { name: 'Online', [site1.site_name]: site1Stats.online, [site2.site_name]: site2Stats.online },
      { name: 'Offline', [site1.site_name]: site1Stats.offline, [site2.site_name]: site2Stats.offline },
      { name: 'Maintenance', [site1.site_name]: site1Stats.maintenance, [site2.site_name]: site2Stats.maintenance },
      { name: 'Error', [site1.site_name]: site1Stats.error, [site2.site_name]: site2Stats.error },
    ];

    const deptData = [
      { name: 'Departments', [site1.site_name]: site1.departments.length, [site2.site_name]: site2.departments.length },
      { 
        name: 'Total Machines', 
        [site1.site_name]: site1.departments.reduce((sum, d) => sum + d.machines.length, 0),
        [site2.site_name]: site2.departments.reduce((sum, d) => sum + d.machines.length, 0)
      },
      { 
        name: 'Team Members', 
        [site1.site_name]: site1.departments.reduce((sum, d) => sum + d.team.length, 0),
        [site2.site_name]: site2.departments.reduce((sum, d) => sum + d.team.length, 0)
      }
    ];

    // Average metrics comparison
    const getAvgMetrics = (site: Site) => {
      const allMachines = site.departments.flatMap(d => d.machines);
      const count = allMachines.length;
      return {
        avgTemp: allMachines.reduce((sum, m) => sum + m.temperature, 0) / count,
        avgEnergy: allMachines.reduce((sum, m) => sum + m.energy_consumption_kWh, 0) / count,
        avgUptime: allMachines.reduce((sum, m) => sum + m.uptime_hours, 0) / count,
      };
    };

    const site1Metrics = getAvgMetrics(site1);
    const site2Metrics = getAvgMetrics(site2);

    const metricsData = [
      { name: 'Avg Temperature (°C)', [site1.site_name]: site1Metrics.avgTemp.toFixed(1), [site2.site_name]: site2Metrics.avgTemp.toFixed(1) },
      { name: 'Avg Energy (kWh)', [site1.site_name]: site1Metrics.avgEnergy.toFixed(0), [site2.site_name]: site2Metrics.avgEnergy.toFixed(0) },
      { name: 'Avg Uptime (h)', [site1.site_name]: site1Metrics.avgUptime.toFixed(0), [site2.site_name]: site2Metrics.avgUptime.toFixed(0) },
    ];

    return { statusData, deptData, metricsData };
  };

  if (!isOpen) return null;

  const comparisonData = getComparisonData();
  const COLORS = ['#3B82F6', '#8B5CF6'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Site Comparison</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="text-xl" />
            </button>
          </div>

          {/* Site Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Select Sites to Compare (max 2)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.sites.map(site => {
                const isSelected = selectedSites.find(s => s.site_id === site.site_id);
                const isDisabled = !isSelected && selectedSites.length >= 2;
                
                return (
                  <button
                    key={site.site_id}
                    onClick={() => !isDisabled && handleSiteToggle(site)}
                    disabled={isDisabled}
                    className={`
                      p-4 rounded-lg border transition-all duration-200 text-left
                      ${isSelected 
                        ? 'bg-blue-900/30 border-blue-500 text-white' 
                        : isDisabled
                        ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
                        : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        isSelected ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <div>
                        <div className="font-semibold">{site.site_name}</div>
                        <div className="text-sm flex items-center space-x-1 mt-1">
                          <MapPin className="text-xs" />
                          <span>{site.location}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Results */}
          {comparisonData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Site Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedSites.map((site, index) => (
                  <div key={site.site_id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      ></div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{site.site_name}</h4>
                        <p className="text-gray-300 text-sm">{site.location}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{site.departments.length}</div>
                        <div className="text-xs text-gray-400">Departments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">
                          {site.departments.reduce((sum, d) => sum + d.machines.length, 0)}
                        </div>
                        <div className="text-xs text-gray-400">Machines</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">
                          {site.departments.reduce((sum, d) => sum + d.team.length, 0)}
                        </div>
                        <div className="text-xs text-gray-400">Team Members</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Machine Status Comparison */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Machine Status Comparison</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData.statusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey={selectedSites[0].site_name} fill={COLORS[0]} />
                        <Bar dataKey={selectedSites[1].site_name} fill={COLORS[1]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Department & Resources Comparison */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-4">Resources Comparison</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData.deptData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }} 
                        />
                        <Bar dataKey={selectedSites[0].site_name} fill={COLORS[0]} />
                        <Bar dataKey={selectedSites[1].site_name} fill={COLORS[1]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Metrics Table */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-4">Average Metrics Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-2 text-gray-300">Metric</th>
                        <th className="text-center py-2 text-blue-400">{selectedSites[0].site_name}</th>
                        <th className="text-center py-2 text-purple-400">{selectedSites[1].site_name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.metricsData.map((metric, index) => (
                        <tr key={index} className="border-b border-gray-600">
                          <td className="py-2 text-gray-300">{metric.name}</td>
                          <td className="py-2 text-center text-white">{metric[selectedSites[0].site_name]}</td>
                          <td className="py-2 text-center text-white">{metric[selectedSites[1].site_name]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {selectedSites.length < 2 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Please select 2 sites to view comparison</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ComparisonView;