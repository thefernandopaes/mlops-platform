
export interface Project {
  id: string;
  name: string;
  description?: string;
  slug: string;
  visibility: 'private' | 'organization' | 'public';
  settings: ProjectSettings;
  tags?: string[];
  avatar?: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ProjectSettings {
  defaultEnvironment: 'development' | 'staging' | 'production';
  experimentRetention: number; // days
  notifications: {
    deployments: boolean;
    experiments: boolean;
    alerts: boolean;
    teamChanges: boolean;
  };
  integrations: {
    gitRepository?: string;
    slackChannel?: string;
  };
  advanced: {
    resourceLimits?: {
      cpu: number;
      memory: number;
    };
    customDomain?: string;
  };
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'contributor' | 'viewer';
  user: {
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
  };
  addedBy: string;
  createdAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  visibility: 'private' | 'organization' | 'public';
  tags?: string[];
  settings: ProjectSettings;
  members?: {
    userId: string;
    role: 'contributor' | 'viewer';
  }[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

export interface ProjectFormData {
  // Basic Information
  name: string;
  description: string;
  visibility: 'private' | 'organization' | 'public';
  tags: string[];
  avatar?: File;

  // Team Configuration
  members: {
    email: string;
    role: 'contributor' | 'viewer';
  }[];
  bulkEmails: string;

  // Settings
  defaultEnvironment: 'development' | 'staging' | 'production';
  experimentRetention: number;
  notifications: {
    deployments: boolean;
    experiments: boolean;
    alerts: boolean;
    teamChanges: boolean;
  };
  gitRepository: string;
  slackChannel: string;
  resourceLimits: {
    cpu: number;
    memory: number;
  };
  customDomain: string;
}
