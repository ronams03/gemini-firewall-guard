
import React, { useState } from 'react';
import { ShieldCheck, Bug, Wifi, LayoutDashboard } from './components/Icons';
import Dashboard from './components/Dashboard';
import ScanView from './components/ScanView';
import FirewallView from './components/FirewallView';

type View = 'dashboard' | 'scan' | 'firewall';

export interface ScanSummary {
  threatsFound: number;
  filesScanned: number;
  scanTime: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [lastScan, setLastScan] = useState<ScanSummary | null>(null);

  const renderView = () => {
    switch (currentView) {
      case 'scan':
        return <ScanView onScanComplete={setLastScan} />;
      case 'firewall':
        return <FirewallView />;
      case 'dashboard':
      default:
        return <Dashboard setActiveView={setCurrentView} lastScan={lastScan} />;
    }
  };

  const NavItem: React.FC<{ view: View; icon: React.ReactNode; label: string }> = ({ view, icon, label }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center space-y-1 w-full p-3 rounded-lg transition-all duration-200 ${
        currentView === view ? 'bg-accent/20 text-accent' : 'text-gray-400 hover:bg-border hover:text-white'
      }`}
      aria-label={`Navigate to ${label}`}
      aria-current={currentView === view}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-primary font-sans">
      <nav className="w-24 bg-secondary border-r border-border p-3 flex flex-col items-center space-y-4">
        <div className="flex items-center justify-center text-accent mb-6" aria-hidden="true">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="flex flex-col items-center space-y-2 w-full">
            <NavItem view="dashboard" icon={<LayoutDashboard className="w-6 h-6" />} label="Dashboard" />
            <NavItem view="scan" icon={<Bug className="w-6 h-6" />} label="Scan" />
            <NavItem view="firewall" icon={<Wifi className="w-6 h-6" />} label="Firewall" />
        </div>
      </nav>
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
