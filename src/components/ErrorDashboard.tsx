import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiAlertTriangle, FiClock, FiMapPin, FiSettings } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const X = FiX as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Clock = FiClock as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const MapPin = FiMapPin as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Settings = FiSettings as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const AlertTriangle = FiAlertTriangle as React.ComponentType<React.SVGProps<SVGSVGElement>>;  

interface DashBoardProps{
  isOpen: boolean;
  onClose: () => void;
}

const ErrorDashboard: React.FC<DashBoardProps> = ({isOpen, onClose}) => {
  const { data } = useAppContext();

  const errorMachines = data.sites.flatMap(site =>
    site.departments.flatMap(dept =>
      dept.machines
        .filter(machine => machine.error || machine.status === 'error' || machine.status === 'offline')
        .map(machine => ({
          ...machine,
          siteName: site.site_name,
          siteLocation: site.location,
          departmentName: dept.department_name,
        }))
    )
  );

  const sortedErrors = errorMachines.sort((a, b) => {
    if (a.status === 'error' && b.status !== 'error') return -1;
    if (b.status === 'error' && a.status !== 'error') return 1;
    return new Date(b.last_maintenance).getTime() - new Date(a.last_maintenance).getTime();
  });

  const getErrorSeverity = (machine: any) => {
    if (machine.status === 'error') return 'critical';
    if (machine.status === 'offline') return 'high';
    if (machine.error) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-900/30 border-red-500/50 text-red-400';
      case 'high': return 'bg-orange-900/30 border-orange-500/50 text-orange-400';
      case 'medium': return 'bg-yellow-900/30 border-yellow-500/50 text-yellow-400';
      default: return 'bg-gray-900/30 border-gray-500/50 text-gray-400';
    }
  };

  const errorStats = {
    critical: sortedErrors.filter(m => getErrorSeverity(m) === 'critical').length,
    high: sortedErrors.filter(m => getErrorSeverity(m) === 'high').length,
    medium: sortedErrors.filter(m => getErrorSeverity(m) === 'medium').length,
  };

  if (sortedErrors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <AlertTriangle className="text-green-400" />
          <span>Error Dashboard</span>
        </h2>
        <div className="text-center py-8">
          <div className="text-green-400 text-4xl mb-4">✅</div>
          <p className="text-gray-400 text-lg">All systems operational</p>
          <p className="text-gray-500 text-sm">No active errors or alerts detected</p>
        </div>
      </motion.div>
    );
  }

  if (!isOpen) return null;

  return (
    <motion.div
    initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg w-full max-w-6xl max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6 p-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="text-red-400" />
          <span>Error Dashboard</span>
        </h2>
        <div className="text-red-400 text-sm">
          {sortedErrors.length} active issues 
          {
            <button
              onClick={onClose}
              className="p-2 translate-y-1 text-gray-400 hover:text-white transition-colors">
              <X className="text-xl"/>
            </button>
        }
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-xl font-bold text-white">{sortedErrors.length}</div>
          <div className="text-gray-300 text-sm">Total Issues</div>
        </div>
        <div className="bg-red-900/30 rounded-lg p-4 border border-red-500/30">
          <div className="text-xl font-bold text-red-400">{errorStats.critical}</div>
          <div className="text-gray-300 text-sm">Critical</div>
        </div>
        <div className="bg-orange-900/30 rounded-lg p-4 border border-orange-500/30">
          <div className="text-xl font-bold text-orange-400">{errorStats.high}</div>
          <div className="text-gray-300 text-sm">High Priority</div>
        </div>
        <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-500/30">
          <div className="text-xl font-bold text-yellow-400">{errorStats.medium}</div>
          <div className="text-gray-300 text-sm">Medium Priority</div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto p-6">
        {sortedErrors.slice(0, 20).map((machine, index) => {
          const severity = getErrorSeverity(machine);
          const severityColor = getSeverityColor(severity);

          return (
            <motion.div
              key={`${machine.machine_id}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-lg border p-4 ${severityColor}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <Settings className="text-gray-400" />
                      <span className="font-semibold text-white">{machine.machine_id}</span>
                    </div>
                    <span className="text-gray-300 text-sm">{machine.type}</span>
                    <div className="px-2 py-1 rounded-full text-xs font-medium bg-current bg-opacity-20">
                      {severity.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-2">
                    {machine.error && (
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertTriangle className="text-xs" />
                        <span>Error: {machine.error}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="text-xs" />
                      <span>{machine.siteName} • {machine.departmentName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="text-xs" />
                      <span>Last maintenance: {machine.last_maintenance}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className={`text-sm font-semibold ${
                    machine.status === 'error' ? 'text-red-400' : 
                    machine.status === 'offline' ? 'text-gray-400' : 'text-yellow-400'
                  }`}>
                    {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-current border-opacity-20">
                <div>
                  <div className="text-xs text-gray-400">Temperature</div>
                  <div className={`text-sm font-semibold ${
                    machine.temperature > 100 ? 'text-red-400' : 
                    machine.temperature > 80 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {machine.temperature.toFixed(1)}°C
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Vibration</div>
                  <div className="text-sm font-semibold text-blue-400">
                    {machine.vibration.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Uptime</div>
                  <div className="text-sm font-semibold text-purple-400">
                    {machine.uptime_hours}h
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {sortedErrors.length > 20 && (
        <div className="mt-4 text-center text-gray-400 text-sm p-3">
          Showing top 20 issues. {sortedErrors.length - 20} more issues available.
        </div>
      )}
    </motion.div>
  </motion.div>
  );
};

export default ErrorDashboard;