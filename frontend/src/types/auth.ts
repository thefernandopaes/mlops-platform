// Authentication Types - Based on backend implementation

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization_name?: string;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  organization_membership: {
    role: 'admin' | 'developer' | 'viewer';
    joined_at: string;
  };
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

// Frontend-specific auth types
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: 'admin' | 'developer' | 'viewer';
  lastLogin: string | null;
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: AuthTokens | null;
}

export interface AuthContextType {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Utilities
  hasRole: (role: 'admin' | 'developer' | 'viewer') => boolean;
  hasMinimumRole: (role: 'admin' | 'developer' | 'viewer') => boolean;
}

// Error types
export interface AuthError {
  code: string;
  message: string;
  details?: any[];
}

export class AuthenticationError extends Error {
  public code: string;
  public details?: any[];

  constructor(error: AuthError) {
    super(error.message);
    this.name = 'AuthenticationError';
    this.code = error.code;
    this.details = error.details;
  }
}