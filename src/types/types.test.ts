import { FilterState, SortState,  TeamMember, 
  Machine, 
  Department, 
  Site, 
  IndustrialData, 
  ChartDataPoint, 
  TimeSeriesData, 
  MachineMetrics } from '../types';

describe('Type Definitions', () => {
  describe('TeamMember', () => {
    it('should have correct property types', () => {
      const member: TeamMember = {
        name: 'Alice',
        role: 'Engineer',
        email: 'alice@example.com',
        phone: '123-456-7890',
      };

      expect(member).toBeDefined();
      expect(typeof member.name).toBe('string');
      expect(typeof member.role).toBe('string');
      expect(typeof member.email).toBe('string');
      expect(typeof member.phone).toBe('string');
    });
  });

  describe('Machine', () => {
    it('should have correct property types', () => {
      const machine: Machine = {
        machine_id: 'M001',
        type: 'CNC',
        status: 'online',
        temperature: 75,
        vibration: 0.5,
        energy_consumption_kWh: 120,
        last_maintenance: '2025-09-01',
        error: null,
        uptime_hours: 500,
      };

      expect(machine).toBeDefined();
      expect(typeof machine.machine_id).toBe('string');
      expect(typeof machine.type).toBe('string');
      expect(typeof machine.status).toBe('string');
      expect(typeof machine.temperature).toBe('number');
      expect(typeof machine.vibration).toBe('number');
      expect(typeof machine.energy_consumption_kWh).toBe('number');
      expect(typeof machine.last_maintenance).toBe('string');
      expect([null, 'string']).toContain(machine.error);
      expect(typeof machine.uptime_hours).toBe('number');
    });
  });

  describe('Department', () => {
    it('should have team and machines arrays', () => {
      const department: Department = {
        department_id: 'D001',
        department_name: 'Production',
        head: 'John Doe',
        team: [{ name: 'Alice', role: 'Engineer', email: 'alice@example.com', phone: '123-456-7890' }],
        machines: [{
          machine_id: 'M001',
          type: 'CNC',
          status: 'online',
          temperature: 75,
          vibration: 0.5,
          energy_consumption_kWh: 120,
          last_maintenance: '2025-09-01',
          error: null,
          uptime_hours: 500,
        }],
      };

      expect(department).toBeDefined();
      expect(typeof department.department_id).toBe('string');
      expect(Array.isArray(department.team)).toBe(true);
      expect(Array.isArray(department.machines)).toBe(true);
    });
  });

  describe('Site', () => {
    it('should have departments array', () => {
      const site: Site = {
        site_id: 'S001',
        site_name: 'Main Plant',
        location: 'Montreal',
        departments: [],
      };

      expect(site).toBeDefined();
      expect(typeof site.site_id).toBe('string');
      expect(typeof site.site_name).toBe('string');
      expect(typeof site.location).toBe('string');
      expect(Array.isArray(site.departments)).toBe(true);
    });
  });

  describe('IndustrialData', () => {
    it('should have sites array', () => {
      const data: IndustrialData = {
        sites: [],
      };

      expect(data).toBeDefined();
      expect(Array.isArray(data.sites)).toBe(true);
    });
  });

  describe('ChartDataPoint', () => {
    it('should have name, value, and optional color', () => {
      const point: ChartDataPoint = {
        name: 'Temperature',
        value: 75,
        color: '#ff0000',
      };

      expect(point).toBeDefined();
      expect(typeof point.name).toBe('string');
      expect(typeof point.value).toBe('number');
      expect(['string', 'undefined']).toContain(typeof point.color);
    });
  });

  describe('TimeSeriesData', () => {
    it('should have time and value properties', () => {
      const ts: TimeSeriesData = {
        time: '2025-09-26T12:00:00Z',
        value: 100,
      };

      expect(ts).toBeDefined();
      expect(typeof ts.time).toBe('string');
      expect(typeof ts.value).toBe('number');
    });
  });

  describe('MachineMetrics', () => {
    it('should have arrays for temperature, energy, and vibration', () => {
      const metrics: MachineMetrics = {
        temperature: [{ time: '2025-09-26T12:00:00Z', value: 75 }],
        energy: [{ time: '2025-09-26T12:00:00Z', value: 120 }],
        vibration: [{ time: '2025-09-26T12:00:00Z', value: 0.5 }],
      };

      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics.temperature)).toBe(true);
      expect(Array.isArray(metrics.energy)).toBe(true);
      expect(Array.isArray(metrics.vibration)).toBe(true);
    });
  });

  describe('FilterState', () => {
    it('should have all required properties', () => {
      const filterState: FilterState = {
        siteLocation: 'Montreal',
        departmentType: 'Production',
        machineStatus: 'online',
        machineType: 'CNC',
        temperatureThreshold: 80,
        uptimeThreshold: 1000,
        searchQuery: 'test',
      };

      expect(filterState).toBeDefined();
      expect(typeof filterState.siteLocation).toBe('string');
      expect(typeof filterState.departmentType).toBe('string');
      expect(typeof filterState.machineStatus).toBe('string');
      expect(typeof filterState.machineType).toBe('string');
      expect(typeof filterState.searchQuery).toBe('string');
      expect(typeof filterState.temperatureThreshold).toBe('number');
      expect(typeof filterState.uptimeThreshold).toBe('number');
    });

    it('should allow null values for optional numeric fields', () => {
      const filterState: FilterState = {
        siteLocation: '',
        departmentType: '',
        machineStatus: '',
        machineType: '',
        temperatureThreshold: null,
        uptimeThreshold: null,
        searchQuery: '',
      };

      expect(filterState.temperatureThreshold).toBeNull();
      expect(filterState.uptimeThreshold).toBeNull();
    });
  });

  describe('SortState', () => {
    it('should have correct direction values', () => {
      const sortState: SortState = {
        departmentBy: 'name',
        machineBy: 'uptime',
        teamBy: 'name',
        direction: 'asc',
      };

      expect(sortState).toBeDefined();
      expect(['name', 'machineCount']).toContain(sortState.departmentBy);
      expect(['uptime', 'energy', 'maintenance', 'id']).toContain(sortState.machineBy);
      expect(['name', 'role']).toContain(sortState.teamBy);
      expect(['asc', 'desc']).toContain(sortState.direction);
    });
  });
});