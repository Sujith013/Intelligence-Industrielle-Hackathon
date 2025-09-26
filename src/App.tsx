import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import TopBar from './components/TopBar';
import SitePieChart from './components/SitePieChart';
import SiteDetails from './components/SiteDetails';
import ErrorDashboard from './components/ErrorDashboard';
import ComparisonView from './components/ComparisonView';
import { useAppContext } from './context/AppContext';
import './App.css';

const AppContent = () => {
  const { selectedSite } = useAppContext();
  const [showComparison, setShowComparison] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  return (
    <div className="modal-content min-h-screen bg-gray-900">
      <TopBar 
        onShowComparison={() => setShowComparison(true)}
        onShowErrors={() => setShowErrors(!showErrors)}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {selectedSite ? <SiteDetails /> : <SitePieChart />}
      </main>

      <ErrorDashboard 
        isOpen={showErrors} 
        onClose={() => setShowErrors(false)} 
      />

      <ComparisonView 
        isOpen={showComparison} 
        onClose={() => setShowComparison(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;