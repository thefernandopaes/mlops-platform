
export interface Deployment {
  id: string;
  name: string;
  model: {
    id: string;
    name: string;
    version: string;
  };
  project: {
    id: string;
    name: string;
  };
  environment: 'development' | 'staging' | 'production';
  status: 'active' | 'inactive' | 'deploying' | 'failed' | 'terminating';
  health: 'healthy' | 'warning' | 'critical';
  endpoint: string;
  instanceType: 'small' | 'medium' | 'large' | 'gpu';
  instances: {
    current: number;
    min: number;
    max: number;
  };
  resources: {
    cpu: number; // percentage
    memory: number; // percentage
    requests: number; // requests per hour
  };
  uptime: number; // percentage
  lastDeployed: string;
  lastUpdated: string;
  deployedBy: string;
  alerts: number;
  autoScaling: boolean;
  createdAt: string;
}

export interface DeploymentFilters {
  environment: string[];
  status: string[];
  health: string[];
  model: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
}

export type DeploymentViewMode = 'grid' | 'list';

export interface DeploymentStats {
  total: number;
  active: number;
  deploying: number;
  failed: number;
  totalRequests: number;
  avgUptime: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
}

export interface DeploymentMetrics {
  requestRate: number;
  errorRate: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number;
  concurrentUsers: number;
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage?: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface DeploymentAlert {
  id: string;
  type: 'performance' | 'error' | 'resource' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  resolvedBy?: string;
}

export interface DeploymentHistory {
  id: string;
  action: 'deploy' | 'update' | 'scale' | 'restart' | 'terminate' | 'rollback';
  description: string;
  timestamp: string;
  performedBy: string;
  status: 'success' | 'failed' | 'in_progress';
  details?: Record<string, any>;
}

export interface DeploymentConfiguration {
  environmentVariables: Record<string, string>;
  scalingPolicy: {
    minInstances: number;
    maxInstances: number;
    targetCpuUtilization: number;
    targetMemoryUtilization: number;
    autoScaling: boolean;
  };
  healthCheck: {
    path: string;
    interval: number;
    timeout: number;
    retries: number;
  };
  networking: {
    port: number;
    protocol: string;
    allowedOrigins?: string[];
  };
  resources: {
    cpu: string;
    memory: string;
    gpu?: string;
  };
}
