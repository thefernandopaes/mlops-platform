
export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  project: {
    id: string;
    name: string;
  };
  model?: {
    id: string;
    name: string;
  };
  framework: string;
  runCount: number;
  bestRun?: {
    id: string;
    metrics: Record<string, number>;
  };
  metrics: Record<string, number>;
  parameters: Record<string, any>;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  duration?: string;
  createdAt: string;
  startedAt: string;
  completedAt?: string;
  progress?: number;
}

export interface ExperimentFilters {
  search: string;
  projects: string[];
  status: string[];
  frameworks: string[];
  authors: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  customMetrics: Array<{
    metric: string;
    operator: 'gt' | 'lt' | 'eq';
    value: number;
  }>;
}

export type ExperimentViewMode = 'list' | 'grid' | 'comparison';

export interface ExperimentSort {
  field: 'name' | 'created' | 'status' | 'duration' | 'metrics';
  direction: 'asc' | 'desc';
}
