export interface TeamMember {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Machine {
  machine_id: string;
  type: string;
  status: string;
  temperature: number;
  vibration: number;
  energy_consumption_kWh: number;
  last_maintenance: string;
  error: string | null;
  uptime_hours: number;
}

export interface Department {
  department_id: string;
  department_name: string;
  head: string;
  team: TeamMember[];
  machines: Machine[];
}

export interface Site {
  site_id: string;
  site_name: string;
  location: string;
  departments: Department[];
}

export interface IndustrialData {
  sites: Site[];
}

export interface FilterState {
  siteLocation: string;
  departmentType: string;
  machineStatus: string;
  machineType: string;
  temperatureThreshold: number | null;
  uptimeThreshold: number | null;
  searchQuery: string;
}

export interface SortState {
  departmentBy: 'name' | 'machineCount';
  machineBy: 'uptime' | 'energy' | 'maintenance' | 'id';
  teamBy: 'name' | 'role';
  direction: 'asc' | 'desc';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  time: string;
  value: number;
}

export interface MachineMetrics {
  temperature: TimeSeriesData[];
  energy: TimeSeriesData[];
  vibration: TimeSeriesData[];
}