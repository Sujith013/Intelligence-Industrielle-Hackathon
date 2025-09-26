import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadialBarChart, RadialBar
} from 'recharts';
import { 
  FiCpu, FiThermometer, FiActivity, FiZap, FiTool, FiAlertTriangle, FiChevronDown, FiChevronUp, FiClock,
  FiSettings, FiUser } from 'react-icons/fi';
import { Machine } from '../types';
import { useAppContext } from '../context/AppContext';

interface MachineListProps {
  machines: Machine[];
  departmentName: string;
}

const Cpu = FiCpu as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Thermometer = FiThermometer as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Activity = FiActivity as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Zap = FiZap as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Tool = FiTool as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const AlertTriangle = FiAlertTriangle as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const ChevronDown = FiChevronDown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const ChevronUp = FiChevronUp as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Clock = FiClock as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Settings = FiSettings as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const User = FiUser as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  

const MachineList: React.FC<MachineListProps> = ({ machines, departmentName }) => {
  const { filters, sorting } = useAppContext();
  const [expandedMachine, setExpandedMachine] = useState<string | null>(null);

  const filteredMachines = machines.filter(machine => {
    if (filters.machineStatus && machine.status !== filters.machineStatus) return false;
    if (filters.machineType && machine.type !== filters.machineType) return false;
    if (filters.temperatureThreshold && machine.temperature <= filters.temperatureThreshold) return false;
    if (filters.uptimeThreshold && machine.uptime_hours < filters.uptimeThreshold) return false;
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (!machine.machine_id.toLowerCase().includes(query) &&
          !machine.type.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  const sortedMachines = [...filteredMachines].sort((a, b) => {
    const direction = sorting.direction === 'asc' ? 1 : -1;
    
    switch (sorting.machineBy) {
      case 'uptime':
        return direction * (a.uptime_hours - b.uptime_hours);
      case 'energy':
        return direction * (a.energy_consumption_kWh - b.energy_consumption_kWh);
      case 'maintenance':
        return direction * new Date(a.last_maintenance).getTime() - new Date(b.last_maintenance).getTime();
      case 'id':
        return direction * a.machine_id.localeCompare(b.machine_id);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-900/30 border-green-500/30';
      case 'offline': return 'text-gray-400 bg-gray-900/30 border-gray-500/30';
      case 'maintenance': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/30';
      case 'error': return 'text-red-400 bg-red-900/30 border-red-500/30';
      default: return 'text-gray-400 bg-gray-900/30 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Activity className="text-green-400" />;
      case 'offline': return <Cpu className="text-gray-400" />;
      case 'maintenance': return <Tool className="text-yellow-400" />;
      case 'error': return <AlertTriangle className="text-red-400" />;
      default: return <Cpu className="text-gray-400" />;
    }
  };

  const generateTimeSeriesData = (machine: Machine) => {
    const hours = 24;
    const data = [];
    for (let i = hours; i >= 0; i--) {
      data.push({
        time: `${i}h ago`,
        temperature: machine.temperature + (Math.random() - 0.5) * 10,
        energy: machine.energy_consumption_kWh + (Math.random() - 0.5) * 200,
        vibration: machine.vibration + (Math.random() - 0.5) * 0.5,
      });
    }
    return data;
  };

  const getTemperatureGaugeData = (temperature: number) => {
    const maxTemp = 120;
    const percentage = (temperature / maxTemp) * 100;
    return [
      { name: 'Temperature', value: percentage, fill: 
        temperature > 100 ? '#EF4444' : 
        temperature > 80 ? '#F59E0B' : 
        temperature > 60 ? '#10B981' : '#3B82F6'
      }
    ];
  };

  if (sortedMachines.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400 text-center py-4">No machines match your current filters</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-white mb-4">
        {departmentName} Machines ({sortedMachines.length})
      </h4>

      <div className="space-y-4">
        {sortedMachines.map((machine, index) => {
          const isExpanded = expandedMachine === machine.machine_id;
          const timeSeriesData = generateTimeSeriesData(machine);
          const tempGaugeData = getTemperatureGaugeData(machine.temperature);

          return (
            <motion.div
              key={machine.machine_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-700 rounded-lg overflow-hidden"
            >

              <div
                className="p-4 cursor-pointer hover:bg-gray-600 transition-colors duration-200"
                onClick={() => setExpandedMachine(isExpanded ? null : machine.machine_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(machine.status)}
                      <span className="text-white font-semibold">{machine.machine_id}</span>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(machine.status)}`}>
                      {machine.status.charAt(0).toUpperCase() + machine.status.slice(1)}
                    </div>
                    
                    <span className="text-gray-300">{machine.type}</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Thermometer />
                      <span>{machine.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Zap />
                      <span>{machine.energy_consumption_kWh.toFixed(0)} kWh</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <Clock />
                      <span>{machine.uptime_hours}h</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-gray-400" />
                    ) : (
                      <ChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>

                {machine.error && (
                  <div className="mt-2 flex items-center space-x-2 text-red-400 text-sm">
                    <AlertTriangle />
                    <span>Error: {machine.error}</span>
                  </div>
                )}
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-600"
                >
                  <div className="p-4 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-600 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">Temperature</div>
                        <div className={`text-lg font-semibold ${
                          machine.temperature > 100 ? 'text-red-400' : 
                          machine.temperature > 80 ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                          {machine.temperature.toFixed(1)}°C
                        </div>
                      </div>
                      <div className="bg-gray-600 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">Vibration</div>
                        <div className="text-blue-400 text-lg font-semibold">{machine.vibration.toFixed(2)}</div>
                      </div>
                      <div className="bg-gray-600 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">Energy</div>
                        <div className="text-purple-400 text-lg font-semibold">{machine.energy_consumption_kWh.toFixed(0)} kWh</div>
                      </div>
                      <div className="bg-gray-600 rounded-lg p-3">
                        <div className="text-gray-400 text-sm">Last Maintenance</div>
                        <div className="text-gray-300 text-sm">{machine.last_maintenance}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-600 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-3">Temperature Trend (24h)</h5>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeriesData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                              <YAxis stroke="#9CA3AF" fontSize={12} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px'
                                }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="temperature" 
                                stroke="#EF4444" 
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-gray-600 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-3">Temperature Status</h5>
                        <div className="h-48 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={tempGaugeData}>
                              <RadialBar dataKey="value" cornerRadius={10} fill={tempGaugeData[0].fill} />
                            </RadialBarChart>
                          </ResponsiveContainer>
                          <div className="absolute text-center">
                            <div className="text-2xl font-bold text-white">{machine.temperature.toFixed(1)}°C</div>
                            <div className="text-gray-400 text-sm">Current</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-600 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-3">Energy Usage (24h)</h5>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={timeSeriesData.slice(-12)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                              <YAxis stroke="#9CA3AF" fontSize={12} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px'
                                }} 
                              />
                              <Bar dataKey="energy" fill="#8B5CF6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-gray-600 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-3">Vibration Levels (24h)</h5>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeriesData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                              <YAxis stroke="#9CA3AF" fontSize={12} />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1F2937', 
                                  border: '1px solid #374151',
                                  borderRadius: '8px'
                                }} 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="vibration" 
                                stroke="#10B981" 
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MachineList;