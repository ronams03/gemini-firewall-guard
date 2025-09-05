
import React from 'react';
import { ShieldCheck, AlertCircle, Bug, Wifi } from './Icons';
import type { ScanSummary } from '../App';

interface DashboardProps {
  setActiveView: (view: 'dashboard' | 'scan' | 'firewall') => void;
  lastScan: ScanSummary | null;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveView, lastScan }) => {
  const threatsFound = lastScan?.threatsFound ?? 0;
  const securityStatus = threatsFound > 0 ? 'at_risk' : 'protected';

  const StatusCard = () => (
    <div className={`col-span-1 md:col-span-2 lg:col-span-3 p-8 rounded-lg flex flex-col items-center justify-center text-center bg-secondary border border-border ${securityStatus === 'protected' && lastScan ? 'animate-pulse' : ''}`}>
      {securityStatus === 'protected' ? (
        <>
          <ShieldCheck className="w-20 h-20 text-success mb-4" />
          <h2 className="text-3xl font-bold text-white">You Are Protected</h2>
          <p className="text-gray-400 mt-2">Your system is secure. No immediate threats detected.</p>
        </>
      ) : (
        <>
          <AlertCircle className="w-20 h-20 text-danger mb-4" />
          <h2 className="text-3xl font-bold text-white">System at Risk</h2>
          <p className="text-gray-400 mt-2">{threatsFound} {threatsFound === 1 ? 'threat has' : 'threats have'} been detected. Immediate action is recommended.</p>
        </>
      )}
      <button 
        onClick={() => setActiveView('scan')}
        className="mt-6 bg-accent hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
      >
        {lastScan ? 'Run Another Scan' : 'Run First Scan'}
      </button>
    </div>
  );

  const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; actionLabel: string; action: () => void; }> = ({ icon, title, value, actionLabel, action }) => (
    <div className="bg-secondary p-6 rounded-lg border border-border flex flex-col animate-fadeIn" style={{ animationDelay: '200ms' }}>
      <div className="flex items-center text-gray-400 mb-2">
        {icon}
        <span className="ml-2 font-semibold">{title}</span>
      </div>
      <p className="text-3xl font-bold text-white mb-4">{value}</p>
      <button 
        onClick={action}
        className="mt-auto bg-border hover:bg-gray-700 text-gray-300 font-semibold py-2 px-4 rounded-lg transition duration-300 text-sm"
      >
        {actionLabel}
      </button>
    </div>
  );

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-2">Security Dashboard</h1>
      <p className="text-gray-400 mb-8">Welcome back. Here's an overview of your system's security.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusCard />

        <InfoCard 
          icon={<Bug className="w-5 h-5" />}
          title="Last Scan Threats"
          value={lastScan ? (threatsFound > 0 ? `${threatsFound} Threats` : "Clean") : "N/A"}
          actionLabel="View Scan Details"
          action={() => setActiveView('scan')}
        />
        <InfoCard 
          icon={<Wifi className="w-5 h-5" />}
          title="Firewall Status"
          value="Enabled"
          actionLabel="Manage Firewall"
          action={() => setActiveView('firewall')}
        />
        <div className="bg-secondary p-6 rounded-lg border border-border animate-fadeIn" style={{ animationDelay: '400ms' }}>
          <h3 className="font-semibold text-white mb-3">Quick Stats</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Last Scan Time:</span> <span className="text-gray-400">{lastScan?.scanTime ?? 'N/A'}</span></li>
            <li className="flex justify-between"><span>Files Scanned:</span> <span className="text-gray-400">{lastScan?.filesScanned ?? 0}</span></li>
            <li className="flex justify-between"><span>Firewall Rules:</span> <span className="text-gray-400">15 Active</span></li>
            <li className="flex justify-between"><span>Database Version:</span> <span className="text-gray-400">v2.1.88</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
