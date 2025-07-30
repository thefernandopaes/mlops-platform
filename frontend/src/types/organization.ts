// Organization Types - Based on backend schemas

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  billing_email?: string;
  subscription_plan: string;
  subscription_status: string;
  is_active: boolean;
  max_users: number;
  max_models: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationStats {
  total_members: number;
  total_projects: number;
  total_models: number;
  total_experiments: number;
  total_deployments: number;
  active_deployments: number;
}

export interface OrganizationWithStats extends Organization {
  stats: OrganizationStats;
  current_user_role: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'admin' | 'developer' | 'viewer';
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean;
  };
}

// Request/Response Types
export interface OrganizationCreateRequest {
  name: string;
  description?: string;
  billing_email?: string;
}

export interface OrganizationUpdateRequest {
  name?: string;
  description?: string;
  billing_email?: string;
  subscription_plan?: string;
  max_users?: number;
  max_models?: number;
}

export interface OrganizationListResponse {
  organizations: Organization[];
  total: number;
  page: number;
  size: number;
}

export interface OrganizationMemberCreateRequest {
  user_id: string;
  role: 'admin' | 'developer' | 'viewer';
}

export interface OrganizationMemberUpdateRequest {
  role: 'admin' | 'developer' | 'viewer';
}

export interface OrganizationMemberListResponse {
  members: OrganizationMember[];
  total: number;
  page: number;
  size: number;
}

export interface UserInvitationRequest {
  email: string;
  role: 'admin' | 'developer' | 'viewer';
}

export interface UserInvitationResponse {
  success: boolean;
  message: string;
  invited_email: string;
  role: string;
}

// Form Types
export interface OrganizationFormData {
  name: string;
  description: string;
  billing_email: string;
}

export interface MemberInviteFormData {
  email: string;
  role: 'admin' | 'developer' | 'viewer';
}

export interface MemberRoleUpdateFormData {
  role: 'admin' | 'developer' | 'viewer';
}

// Constants
export const ORGANIZATION_ROLES = {
  admin: 'Admin',
  developer: 'Developer', 
  viewer: 'Viewer'
} as const;

export const SUBSCRIPTION_PLANS = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise'
} as const;

export const SUBSCRIPTION_STATUS = {
  active: 'Active',
  inactive: 'Inactive',
  trial: 'Trial',
  expired: 'Expired'
} as const;

export type OrganizationRole = keyof typeof ORGANIZATION_ROLES;
export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionStatus = keyof typeof SUBSCRIPTION_STATUS;