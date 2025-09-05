
import React, { useState, useEffect } from 'react';
import type { FirewallRule, NetworkLog } from '../types';
import { INITIAL_FIREWALL_RULES } from '../constants';
import { AlertCircle, CheckCircle, Wifi } from './Icons';

// --- Mock Traffic Generation ---
const MOCK_APPS = ['Chrome', 'System', 'GameClient', 'svchost.exe', 'Discord', 'Unknown Process'];
const MOCK_IPS = ['8.8.8.8', '192.168.1.75', '104.18.3.96', '45.137.21.112', '72.21.91.29', '208.67.222.222'];
const MOCK_PORTS = [443, 80, 8080, 27015, 6667, 5222, 4444];

const generateMockTraffic = (): Omit<NetworkLog, 'id' | 'timestamp' | 'status'> => ({
    appName: MOCK_APPS[Math.floor(Math.random() * MOCK_APPS.length)],
    ip: MOCK_IPS[Math.floor(Math.random() * MOCK_IPS.length)],
    port: MOCK_PORTS[Math.floor(Math.random() * MOCK_PORTS.length)],
    direction: Math.random() > 0.5 ? 'inbound' : 'outbound',
    protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
});
// --- End Mock Traffic Generation ---


const FirewallView: React.FC = () => {
    const [rules, setRules] = useState<FirewallRule[]>(INITIAL_FIREWALL_RULES);
    const [trafficLogs, setTrafficLogs] = useState<NetworkLog[]>([]);
    const [firewallEnabled, setFirewallEnabled] = useState(true);

    useEffect(() => {
        if (!firewallEnabled) return;

        const intervalId = setInterval(() => {
            const newTraffic = generateMockTraffic();
            const matchingRule = rules.find(rule => rule.ip === newTraffic.ip || rule.port === newTraffic.port);
            
            const logEntry: NetworkLog = {
                id: Date.now() + Math.random(),
                timestamp: new Date().toLocaleTimeString(),
                status: matchingRule ? matchingRule.status : 'needs_review',
                ...newTraffic,
            };

            setTrafficLogs(prev => [logEntry, ...prev].slice(0, 50));
        }, 2500);

        return () => clearInterval(intervalId);
    }, [rules, firewallEnabled]);


    const toggleRuleStatus = (id: number) => {
        setRules(rules.map(rule => 
            rule.id === id ? { ...rule, status: rule.status === 'allowed' ? 'blocked' : 'allowed' } : rule
        ));
    };
    
    const ToggleSwitch = () => (
        <label htmlFor="firewall-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
                <input
                    id="firewall-toggle"
                    type="checkbox"
                    className="sr-only"
                    checked={firewallEnabled}
                    onChange={() => setFirewallEnabled(!firewallEnabled)}
                />
                <div className={`block w-14 h-8 rounded-full ${firewallEnabled ? 'bg-accent' : 'bg-gray-600'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${firewallEnabled ? 'transform translate-x-full' : ''}`}></div>
            </div>
            <div className="ml-3 text-white font-medium">
                {firewallEnabled ? 'Enabled' : 'Disabled'}
            </div>
        </label>
    );

    const statusIcons = {
        allowed: <CheckCircle className="w-5 h-5 text-success" />,
        blocked: <AlertCircle className="w-5 h-5 text-danger" />,
        needs_review: <Wifi className="w-5 h-5 text-warning" />,
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-bold">Firewall Rules</h1>
                        <p className="text-gray-400 mt-2">Manage inbound and outbound connection rules.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center space-x-4">
                        <span className="text-sm font-semibold">Status:</span>
                        <ToggleSwitch />
                    </div>
                </div>
                <div className="bg-secondary rounded-lg border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-300">
                            {/* Table content remains the same */}
                             <thead className="bg-border/50 text-xs uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">Application</th>
                                <th scope="col" className="px-6 py-3 hidden md:table-cell">Direction</th>
                                <th scope="col" className="px-6 py-3">Protocol</th>
                                <th scope="col" className="px-6 py-3 hidden lg:table-cell">Remote IP</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rules.map((rule) => (
                                <tr key={rule.id} className="border-b border-border hover:bg-border/50 transition-colors duration-200">
                                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{rule.name}</td>
                                    <td className="px-6 py-4 capitalize hidden md:table-cell">{rule.direction}</td>
                                    <td className="px-6 py-4">{rule.protocol}</td>
                                    <td className="px-6 py-4 hidden lg:table-cell">{rule.ip}:{rule.port}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            rule.status === 'allowed' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                                        }`}>
                                            {rule.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => toggleRuleStatus(rule.id)}
                                            className={`py-1 px-3 text-xs font-bold rounded-md transition-colors duration-200 ${
                                                rule.status === 'allowed' ? 'bg-danger/80 hover:bg-danger text-white' : 'bg-success/80 hover:bg-success text-white'
                                            }`}
                                        >
                                            {rule.status === 'allowed' ? 'Block' : 'Allow'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2">
                <h2 className="text-3xl font-bold mb-2">Live Network Activity</h2>
                <p className="text-gray-400 mb-6">Real-time connection monitoring.</p>
                <div className="bg-secondary rounded-lg border border-border p-4 h-[60vh] overflow-y-auto flex flex-col-reverse">
                    <div className="space-y-3">
                        {trafficLogs.length === 0 && firewallEnabled && (
                            <p className="text-center text-gray-500 p-8">Listening for network activity...</p>
                        )}
                         {trafficLogs.length === 0 && !firewallEnabled && (
                            <p className="text-center text-gray-500 p-8">Firewall is disabled. No activity is being monitored.</p>
                        )}
                        {trafficLogs.map(log => (
                            <div key={log.id} className="flex items-start text-xs animate-fadeIn">
                                <div className="mr-3 mt-1">{statusIcons[log.status]}</div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-white">
                                        {log.appName}
                                        <span className={`capitalize ml-2 font-normal text-gray-400`}>({log.direction})</span>
                                    </p>
                                    <p className="text-gray-400">{log.ip}:{log.port} - {log.protocol}</p>
                                </div>
                                <p className="text-gray-500">{log.timestamp}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FirewallView;
