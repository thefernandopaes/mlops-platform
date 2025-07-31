
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
