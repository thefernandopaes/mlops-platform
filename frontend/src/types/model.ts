
export interface Model {
  id: string;
  name: string;
  description: string;
  version: string;
  framework: 'scikit-learn' | 'tensorflow' | 'pytorch' | 'xgboost' | 'huggingface' | 'onnx';
  modelType: 'classification' | 'regression' | 'nlp' | 'computer-vision' | 'time-series' | 'recommendation';
  stage: 'development' | 'staging' | 'production' | 'archived';
  projectId: string;
  projectName: string;
  tags: string[];
  metrics: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
    rmse?: number;
    mae?: number;
    auc?: number;
    [key: string]: number | undefined;
  };
  fileSize: number;
  filePath: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  updatedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  deploymentCount: number;
  downloadCount: number;
  isFavorite: boolean;
  isPublic: boolean;
  thumbnailUrl?: string;
}

export interface ModelFilters {
  search: string;
  projects: string[];
  frameworks: string[];
  modelTypes: string[];
  stages: string[];
  tags: string[];
}

export interface ModelSort {
  field: 'name' | 'created' | 'updated' | 'performance' | 'downloads' | 'deployments';
  direction: 'asc' | 'desc';
}

export type ModelViewMode = 'grid' | 'table';

export interface ModelUpload {
  name: string;
  description: string;
  framework: Model['framework'];
  modelType: Model['modelType'];
  projectId: string;
  tags: string[];
  file: File;
  metrics?: Model['metrics'];
}
