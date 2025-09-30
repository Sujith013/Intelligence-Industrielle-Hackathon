import industrialData from './industrial_sites.json';
import { Site, Machine } from '../types';

describe('Data Processing Utilities', () => {
  describe('Industrial Data Validation', () => {
    it('should have valid structure', () => {
      expect(industrialData).toHaveProperty('sites');
      expect(Array.isArray(industrialData.sites)).toBe(true);
      expect(industrialData.sites.length).toBeGreaterThan(0);
    });

    it('should have sites with required properties', () => {
      industrialData.sites.forEach((site: Site) => {
        expect(site).toHaveProperty('site_id');
        expect(site).toHaveProperty('site_name');
        expect(site).toHaveProperty('location');
        expect(site).toHaveProperty('departments');
        expect(Array.isArray(site.departments)).toBe(true);
      });
    });

    it('should have departments with required properties', () => {
      industrialData.sites.forEach((site: Site) => {
        site.departments.forEach(dept => {
          expect(dept).toHaveProperty('department_id');
          expect(dept).toHaveProperty('department_name');
          expect(dept).toHaveProperty('head');
          expect(dept).toHaveProperty('team');
          expect(dept).toHaveProperty('machines');
          expect(Array.isArray(dept.team)).toBe(true);
          expect(Array.isArray(dept.machines)).toBe(true);
        });
      });
    });

    it('should have machines with valid status values', () => {
      const validStatuses = ['online', 'offline', 'maintenance', 'error', 'operational'];
      
      industrialData.sites.forEach((site: Site) => {
        site.departments.forEach(dept => {
          dept.machines.forEach((machine: Machine) => {
            expect(validStatuses).toContain(machine.status);
          });
        });
      });
    });

    it('should have machines with numeric values in valid ranges', () => {
      industrialData.sites.forEach((site: Site) => {
        site.departments.forEach(dept => {
          dept.machines.forEach((machine: Machine) => {
            expect(typeof machine.temperature).toBe('number');
            expect(typeof machine.vibration).toBe('number');
            expect(typeof machine.energy_consumption_kWh).toBe('number');
            expect(typeof machine.uptime_hours).toBe('number');
            
            expect(machine.temperature).toBeGreaterThanOrEqual(0);
            expect(machine.vibration).toBeGreaterThanOrEqual(0);
            expect(machine.energy_consumption_kWh).toBeGreaterThanOrEqual(0);
            expect(machine.uptime_hours).toBeGreaterThanOrEqual(0);
          });
        });
      });
    });
  });

  describe('Data Aggregation Functions', () => {
    const getMachineStatusCounts = (site: Site) => {
      const allMachines = site.departments.flatMap(d => d.machines);
      return {
        online: allMachines.filter(m => m.status === 'online').length,
        offline: allMachines.filter(m => m.status === 'offline').length,
        maintenance: allMachines.filter(m => m.status === 'maintenance').length,
        error: allMachines.filter(m => m.status === 'error').length,
        total: allMachines.length
      };
    };

    it('should correctly count machine statuses', () => {
      const site = industrialData.sites[0];
      const counts = getMachineStatusCounts(site);
      
      expect(counts.total).toBeGreaterThan(0);
      expect(counts.online + counts.offline + counts.maintenance + counts.error).toBeLessThanOrEqual(counts.total);
    });

    it('should calculate average metrics correctly', () => {
      const site = industrialData.sites[0];
      const allMachines = site.departments.flatMap(d => d.machines);
      
      const avgTemp = allMachines.reduce((sum, m) => sum + m.temperature, 0) / allMachines.length;
      const avgEnergy = allMachines.reduce((sum, m) => sum + m.energy_consumption_kWh, 0) / allMachines.length;
      
      expect(avgTemp).toBeGreaterThan(0);
      expect(avgEnergy).toBeGreaterThan(0);
      expect(isNaN(avgTemp)).toBe(false);
      expect(isNaN(avgEnergy)).toBe(false);
    });
  });
});