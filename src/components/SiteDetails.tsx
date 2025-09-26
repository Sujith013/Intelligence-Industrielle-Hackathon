import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiUsers, FiMail, FiPhone, FiArrowLeft } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import DepartmentCards from './DepartmentCards';

const MapPin = FiMapPin as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Users = FiUsers as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Mail = FiMail as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const Phone = FiPhone as React.ComponentType<React.SVGProps<SVGSVGElement>>;
const ArrowLeft = FiArrowLeft as React.ComponentType<React.SVGProps<SVGSVGElement>>;

const SiteDetails: React.FC = () => {
  const { selectedSite, setSelectedSite } = useAppContext();

  if (!selectedSite) {
    return null;
  }

  const mapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(selectedSite.location)}`;
  
  // Get all team members from all departments
  const allTeamMembers = selectedSite.departments.flatMap(dept => 
    dept.team.map(member => ({ ...member, department: dept.department_name }))
  );

  // Remove duplicates based on email
  const uniqueTeamMembers = allTeamMembers.filter((member, index, self) => 
    index === self.findIndex(m => m.email === member.email)
  );

  const totalMachines = selectedSite.departments.reduce((sum, dept) => sum + dept.machines.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <button
          onClick={() => setSelectedSite(null)}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="text-lg" />
          <span>Back to Sites Overview</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">{selectedSite.site_name}</h2>
            <div className="flex items-center space-x-2 text-gray-300 mt-2">
              <MapPin className="text-blue-400" />
              <span>{selectedSite.location}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400">{selectedSite.departments.length}</div>
              <div className="text-gray-300 text-sm">Departments</div>
            </div>
          </div>
        </div>

        {/* Site Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-xl font-bold text-green-400">{totalMachines}</div>
            <div className="text-gray-300 text-sm">Total Machines</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-xl font-bold text-yellow-400">
              {selectedSite.departments.reduce((sum, dept) => 
                sum + dept.machines.filter(m => m.status === 'online').length, 0
              )}
            </div>
            <div className="text-gray-300 text-sm">Online Machines</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-xl font-bold text-red-400">
              {selectedSite.departments.reduce((sum, dept) => 
                sum + dept.machines.filter(m => m.status === 'error' || m.status === 'offline').length, 0
              )}
            </div>
            <div className="text-gray-300 text-sm">Issues</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="text-xl font-bold text-purple-400">{uniqueTeamMembers.length}</div>
            <div className="text-gray-300 text-sm">Team Members</div>
          </div>
        </div>
      </div>

      {/* Google Maps */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Location</h3>
        <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
          {/* Placeholder for Google Maps - you'll need to add your API key */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="text-4xl text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">Google Maps</p>
              <p className="text-gray-500 text-sm">{selectedSite.location}</p>
              <p className="text-gray-600 text-xs mt-2">Add your Google Maps API key to enable maps</p>
            </div>
          </div>
          {/* Uncomment and add your API key to enable maps */}
          {/* <iframe
            src={mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe> */}
        </div>
      </div>

      {/* Meet the Team */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="text-xl text-blue-400" />
          <h3 className="text-xl font-bold text-white">Meet the Team</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueTeamMembers.map((member, index) => (
            <motion.div
              key={`${member.email}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors duration-200"
            >
              {/* Avatar placeholder */}
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-semibold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              
              <div>
                <h4 className="text-white font-semibold">{member.name}</h4>
                <p className="text-gray-400 text-sm">{member.role}</p>
                <p className="text-gray-500 text-xs">{member.department}</p>
              </div>
              
              <div className="mt-3 space-y-1">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Mail className="text-xs" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Phone className="text-xs" />
                  <span>{member.phone}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Departments */}
      <DepartmentCards departments={selectedSite.departments} />
    </motion.div>
  );
};

export default SiteDetails;