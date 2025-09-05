
import type { FirewallRule } from './types';

export const INITIAL_FIREWALL_RULES: FirewallRule[] = [
    { id: 1, name: 'Chrome Web', ip: '8.8.8.8', port: 443, protocol: 'TCP', status: 'allowed', direction: 'outbound' },
    { id: 2, name: 'System Update', ip: '192.168.1.10', port: 80, protocol: 'TCP', status: 'allowed', direction: 'outbound' },
    { id: 3, name: 'Unknown Service', ip: '104.22.5.101', port: 6667, protocol: 'TCP', status: 'blocked', direction: 'inbound' },
    { id: 4, name: 'Game Server', ip: '208.67.222.222', port: 27015, protocol: 'UDP', status: 'allowed', direction: 'outbound' },
    { id: 5, name: 'Suspicious Traffic', ip: '45.137.21.112', port: 4444, protocol: 'TCP', status: 'blocked', direction: 'inbound' },
    { id: 6, name: 'Local Share', ip: '192.168.1.25', port: 139, protocol: 'TCP', status: 'allowed', direction: 'inbound' },
];
