
export interface SystemHealth {
  score: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface OverviewMetrics {
  activeDeployments: number;
  totalAlerts: {
    critical: number;
    warning: number;
    info: number;
  };
  overallUptime: number; // percentage
  avgResponseTime: number; // milliseconds
  resourceUtilization: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

export interface ModelPerformanceCard {
  id: string;
  name: string;
  version: string;
  environment: string;
  metrics: {
    accuracy: number;
    latency: number;
    throughput: number;
  };
  status: 'healthy' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
  lastUpdated: string;
}

export interface MonitoringAlert {
  id: string;
  type: 'performance' | 'error' | 'resource' | 'security' | 'drift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  modelName?: string;
  deploymentId?: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  resolvedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export interface DataQualityMetrics {
  driftScore: number; // 0-1
  qualityScore: number; // 0-100
  anomaliesDetected: number;
  validationErrors: number;
  featureChanges: number;
  lastChecked: string;
}

export interface PerformanceAnalytics {
  timeRange: '1h' | '24h' | '7d' | '30d';
  accuracyTrend: Array<{
    timestamp: string;
    value: number;
  }>;
  responseTimeTrend: Array<{
    timestamp: string;
    value: number;
  }>;
  errorRateTrend: Array<{
    timestamp: string;
    value: number;
  }>;
  resourceUsageTrend: Array<{
    timestamp: string;
    cpu: number;
    memory: number;
  }>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  targets: string[]; // deployment IDs or model IDs
  notificationChannels: string[];
  createdBy: string;
  createdAt: string;
}

export interface MonitoringFilters {
  timeRange: '1h' | '24h' | '7d' | '30d';
  environment: string[];
  status: string[];
  severity: string[];
  alertType: string[];
}
