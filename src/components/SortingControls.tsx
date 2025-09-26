import React from 'react';
import { FiDownload, FiArrowUp } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const Download = FiDownload as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const ArrowUp = FiArrowUp as React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface SortingControlsProps {
  screenSize?: 'sm' | 'lg';
}

const SortingControls: React.FC<SortingControlsProps> = ({ screenSize }) => {
  const { sorting, setSorting, data } = useAppContext();

  const handleSort = (field: string, type: 'department' | 'machine' | 'team') => {
    const newDirection: 'asc' | 'desc' = sorting.direction === 'asc' ? 'desc' : 'asc';
    const newSorting = { ...sorting, direction: newDirection };
    
    if (type === 'department') {
      newSorting.departmentBy = field as any;
    } else if (type === 'machine') {
      newSorting.machineBy = field as any;
    } else if (type === 'team') {
      newSorting.teamBy = field as any;
    }
    
    setSorting(newSorting);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'industrial_sites_data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const csvData: any[] = [];
    
    data.sites.forEach(site => {
      site.departments.forEach(dept => {
        dept.machines.forEach(machine => {
          csvData.push({
            site_id: site.site_id,
            site_name: site.site_name,
            location: site.location,
            department_id: dept.department_id,
            department_name: dept.department_name,
            department_head: dept.head,
            machine_id: machine.machine_id,
            machine_type: machine.type,
            status: machine.status,
            temperature: machine.temperature,
            vibration: machine.vibration,
            energy_consumption_kWh: machine.energy_consumption_kWh,
            last_maintenance: machine.last_maintenance,
            error: machine.error,
            uptime_hours: machine.uptime_hours
          });
        });
      });
    });

    const csvHeaders = Object.keys(csvData[0] || {}).join(',');
    const csvRows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'industrial_sites_data.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`${screenSize==='lg'?'flex flex-row':'flex flex-col space-y-4'} items-center space-x-4`}>
      <div className="flex items-center space-x-2">
        <ArrowUp className="text-gray-400" />
        <select
          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          value={`${sorting.departmentBy}-${sorting.direction}`}
          onChange={(e) => {
            const [field, direction] = e.target.value.split('-');
            setSorting({ ...sorting, departmentBy: field as any, direction: direction as 'asc' | 'desc' });
          }}
        >
          <option value="name-asc">Departments A-Z</option>
          <option value="name-desc">Departments Z-A</option>
          <option value="machineCount-asc">Fewer Machines</option>
          <option value="machineCount-desc">More Machines</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={exportToJSON}
          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          <Download className="text-xs" />
          <span>JSON</span>
        </button>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
        >
          <Download className="text-xs" />
          <span>CSV</span>
        </button>
      </div>
    </div>
  );
};

export default SortingControls;