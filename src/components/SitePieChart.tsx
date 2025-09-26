import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];

const SitePieChart: React.FC = () => {
  const { filteredSites, setSelectedSite, selectedSite } = useAppContext();

  const pieData = filteredSites.map((site, index) => ({
    name: site.site_name,
    value: site.departments.length,
    site: site,
    color: COLORS[index % COLORS.length],
    machineCount: site.departments.reduce((sum, dept) => sum + dept.machines.length, 0),
  }));

  const handlePieClick = (data: any) => {
    if (selectedSite?.site_id === data.site.site_id) {
      setSelectedSite(null);
    } else {
      setSelectedSite(data.site);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-gray-300 text-sm">Location: {data.site.location}</p>
          <p className="text-gray-300 text-sm">Departments: {data.value}</p>
          <p className="text-gray-300 text-sm">Total Machines: {data.machineCount}</p>
        </div>
      );
    }
    return null;
  };

  if (filteredSites.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-400 text-lg">There are no sites matching your current filters</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Industrial Sites Overview</h2>
        <p className="text-gray-400">
          Click on a site to view detailed information • {filteredSites.length} sites available
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
              onClick={handlePieClick}
              className="cursor-pointer"
            >
              {pieData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  strokeWidth={0}
                  className="hover:opacity-80 transition-opacity duration-200"
                />
              ))}

            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        {pieData.map((site, index) => (
          <div
            className={`
              p-4 rounded-lg border cursor-pointer transition-all duration-200
              ${selectedSite?.site_id === site.site.site_id
                ? 'bg-blue-900/30 border-blue-500'
                : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }
            `}
            onClick={() => handlePieClick(site)}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: site.color }}
              ></div>
              <div>
                <h3 className="text-white font-semibold">{site.name}</h3>
                <p className="text-gray-400 text-sm">{site.site.location}</p>
              </div>
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-300">Departments: {site.value}</span>
              <span className="text-gray-300">Machines: {site.machineCount}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SitePieChart;