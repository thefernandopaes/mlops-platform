export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  maxUsers: string;
  maxProjects: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Model {
  id: string;
  name: string;
  description?: string;
  modelType: string;
  framework?: string;
  organizationId: string;
  projectId: string;
  tags: string[];
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details: any[];
  };
  metadata: {
    timestamp: string;
    requestId: string;
  };
}