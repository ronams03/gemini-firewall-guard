
export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export enum ScanStatus {
  IDLE = 'idle',
  SCANNING = 'scanning',
  COMPLETED = 'completed',
}

export interface ScanResult {
  file: { name: string; size: number; };
  isThreat: boolean;
  threatType: string;
  recommendation: string;
}

export interface FirewallRule {
  id: number;
  name: string;
  ip: string;
  port: number;
  protocol: 'TCP' | 'UDP';
  status: 'allowed' | 'blocked';
  direction: 'inbound' | 'outbound';
}

export interface ThreatAnalysis {
    isThreat: boolean;
    threatType: string;
    recommendation: string;
}

export interface NetworkLog {
  id: number;
  timestamp: string;
  appName: string;
  ip: string;
  port: number;
  direction: 'inbound' | 'outbound';
  protocol: 'TCP' | 'UDP';
  status: 'allowed' | 'blocked' | 'needs_review';
}
