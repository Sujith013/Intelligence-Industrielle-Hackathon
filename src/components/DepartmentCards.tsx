import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiSettings, FiChevronDown, FiChevronUp, FiUsers } from 'react-icons/fi';
import { Department } from '../types';
import { useAppContext } from '../context/AppContext';
import MachineList from './MachineList';

const User = FiUser as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Settings = FiSettings as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const ChevronDown = FiChevronDown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const ChevronUp = FiChevronUp as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Users = FiUsers as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface DepartmentCardsProps {
  departments: Department[];
}

const DepartmentCards: React.FC<DepartmentCardsProps> = ({ departments }) => {
  const { selectedDepartmentId, setSelectedDepartmentId, filters, sorting } = useAppContext();

  const filteredDepartments = departments.filter(dept => {

    if (filters.departmentType && dept.department_name !== filters.departmentType) {
      return false;
    }

    if (filters.machineStatus || filters.machineType || filters.temperatureThreshold || filters.uptimeThreshold) {
      const matchingMachines = dept.machines.filter(machine => {
        if (filters.machineStatus && machine.status !== filters.machineStatus) return false;
        if (filters.machineType && machine.type !== filters.machineType) return false;
        if (filters.temperatureThreshold && machine.temperature <= filters.temperatureThreshold) return false;
        if (filters.uptimeThreshold && machine.uptime_hours < filters.uptimeThreshold) return false;
        return true;
      });
      
      if (matchingMachines.length === 0) return false;
    }

    return true;
  });

  const sortedDepartments = [...filteredDepartments].sort((a, b) => {
    const direction = sorting.direction === 'asc' ? 1 : -1;
    
    switch (sorting.departmentBy) {
      case 'name':
        return direction * a.department_name.localeCompare(b.department_name);
      case 'machineCount':
        return direction * (a.machines.length - b.machines.length);
      default:
        return 0;
    }
  });

  const toggleDepartment = (departmentId: string) => {
    setSelectedDepartmentId(
      selectedDepartmentId === departmentId ? null : departmentId
    );
  };

  const getStatusCounts = (dept: Department) => {
    const statusCounts = {
      online: dept.machines.filter(m => m.status === 'online').length,
      offline: dept.machines.filter(m => m.status === 'offline').length,
      maintenance: dept.machines.filter(m => m.status === 'maintenance').length,
      error: dept.machines.filter(m => m.status === 'error').length,
    };
    return statusCounts;
  };

  if (sortedDepartments.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Departments</h3>
        <div className="text-center py-8">
          <p className="text-gray-400 text-lg">No departments match your current filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Departments ({sortedDepartments.length})</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDepartments.map((dept, index) => {
          const isExpanded = selectedDepartmentId === dept.department_id;
          const statusCounts = getStatusCounts(dept);
          
          return (
            <motion.div
              key={dept.department_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                ${isExpanded ? 'md:col-span-2 lg:col-span-3' : ''}
              `}
            >
              <div
                className={`
                  bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-6 cursor-pointer
                  border transition-all duration-300 hover:shadow-lg
                  ${isExpanded 
                    ? 'border-blue-500 shadow-blue-500/20' 
                    : 'border-gray-600 hover:border-gray-500'
                  }
                `}
                onClick={() => toggleDepartment(dept.department_id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Settings className="text-white text-lg" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-lg">{dept.department_name}</h4>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <User className="text-xs" />
                        <span>Head: {dept.head}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{dept.machines.length}</div>
                      <div className="text-gray-400 text-xs">Machines</div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-gray-400" />
                    ) : (
                      <ChevronDown className="text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-green-900/30 rounded-lg p-2 border border-green-500/30">
                    <div className="text-green-400 font-semibold text-sm">{statusCounts.online}</div>
                    <div className="text-gray-400 text-xs">Online</div>
                  </div>
                  <div className="bg-yellow-900/30 rounded-lg p-2 border border-yellow-500/30">
                    <div className="text-yellow-400 font-semibold text-sm">{statusCounts.maintenance}</div>
                    <div className="text-gray-400 text-xs">mtnce</div>
                  </div>
                  <div className="bg-gray-900/30 rounded-lg p-2 border border-gray-500/30">
                    <div className="text-gray-400 font-semibold text-sm">{statusCounts.offline}</div>
                    <div className="text-gray-400 text-xs">Offline</div>
                  </div>
                  <div className="bg-red-900/30 rounded-lg p-2 border border-red-500/30">
                    <div className="text-red-400 font-semibold text-sm">{statusCounts.error}</div>
                    <div className="text-gray-400 text-xs">Error</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Users className="text-xs" />
                    <span>{dept.team.length} team members</span>
                  </div>
                  <span className="text-gray-500 text-xs">Click to expand</span>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >

                    <div className="bg-gray-700 rounded-lg p-4 mb-4">
                      <h5 className="text-white font-semibold mb-3">Team Members</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dept.team.map((member, memberIndex) => (
                          <div
                            key={`${member.email}-${memberIndex}`}
                            className="bg-gray-600 rounded-lg p-3"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="text-white text-sm font-semibold">{member.name}</div>
                                <div className="text-gray-400 text-xs">{member.role}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <MachineList machines={dept.machines} departmentName={dept.department_name} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentCards;