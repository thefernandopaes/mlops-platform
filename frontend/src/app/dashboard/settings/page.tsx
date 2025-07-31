
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Settings, 
  Building2, 
  Shield, 
  Zap, 
  Bell, 
  Server,
  Mail, 
  Loader2, 
  Save,
  Key,
  Globe,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Users,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';
import toast from 'react-hot-toast';

// Validation schemas
const organizationProfileSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255),
  description: z.string().max(1000).optional(),
  industry: z.string().max(100).optional(),
  website: z.string().url('Invalid URL format').optional().or(z.literal('')),
  billing_email: z.string().email('Invalid email format').optional().or(z.literal('')),
  timezone: z.string(),
  locale: z.string(),
});

const securitySettingsSchema = z.object({
  require_2fa: z.boolean(),
  password_min_length: z.number().min(8).max(128),
  password_require_uppercase: z.boolean(),
  password_require_lowercase: z.boolean(),
  password_require_numbers: z.boolean(),
  password_require_symbols: z.boolean(),
  session_timeout_minutes: z.number().min(15).max(1440),
  max_login_attempts: z.number().min(3).max(10),
});

const integrationSettingsSchema = z.object({
  slack_enabled: z.boolean(),
  slack_webhook_url: z.string().optional(),
  github_enabled: z.boolean(),
  github_org: z.string().optional(),
  sso_enabled: z.boolean(),
  sso_provider: z.string().optional(),
  api_rate_limit: z.number().min(100).max(10000),
});

const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  slack_notifications: z.boolean(),
  alert_frequency: z.enum(['immediate', 'hourly', 'daily']),
  digest_frequency: z.enum(['daily', 'weekly', 'monthly']),
  maintenance_notifications: z.boolean(),
  security_notifications: z.boolean(),
});

const resourceSettingsSchema = z.object({
  max_cpu_cores: z.number().min(1).max(128),
  max_memory_gb: z.number().min(1).max(512),
  max_storage_gb: z.number().min(10).max(10000),
  monthly_budget_usd: z.number().min(0).max(100000),
  auto_scaling_enabled: z.boolean(),
  cost_alerts_enabled: z.boolean(),
  cost_alert_threshold_percent: z.number().min(50).max(100),
});

interface OrganizationSettings {
  profile: {
    name: string;
    description?: string;
    industry?: string;
    website?: string;
    billing_email?: string;
    timezone: string;
    locale: string;
    logo_url?: string;
  };
  security: {
    require_2fa: boolean;
    password_min_length: number;
    password_require_uppercase: boolean;
    password_require_lowercase: boolean;
    password_require_numbers: boolean;
    password_require_symbols: boolean;
    session_timeout_minutes: number;
    max_login_attempts: number;
  };
  integrations: {
    slack_enabled: boolean;
    slack_webhook_url?: string;
    github_enabled: boolean;
    github_org?: string;
    sso_enabled: boolean;
    sso_provider?: string;
    api_rate_limit: number;
  };
  notifications: {
    email_notifications: boolean;
    slack_notifications: boolean;
    alert_frequency: 'immediate' | 'hourly' | 'daily';
    digest_frequency: 'daily' | 'weekly' | 'monthly';
    maintenance_notifications: boolean;
    security_notifications: boolean;
  };
  resources: {
    max_cpu_cores: number;
    max_memory_gb: number;
    max_storage_gb: number;
    monthly_budget_usd: number;
    auto_scaling_enabled: boolean;
    cost_alerts_enabled: boolean;
    cost_alert_threshold_percent: number;
  };
}

function OrganizationSettingsContent() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(organizationProfileSchema),
  });

  // Security form
  const {
    register: registerSecurity,
    handleSubmit: handleSubmitSecurity,
    formState: { errors: securityErrors },
    reset: resetSecurity,
    watch: watchSecurity,
  } = useForm({
    resolver: zodResolver(securitySettingsSchema),
  });

  // Integration form
  const {
    register: registerIntegration,
    handleSubmit: handleSubmitIntegration,
    formState: { errors: integrationErrors },
    reset: resetIntegration,
    watch: watchIntegration,
  } = useForm({
    resolver: zodResolver(integrationSettingsSchema),
  });

  // Notification form
  const {
    register: registerNotification,
    handleSubmit: handleSubmitNotification,
    formState: { errors: notificationErrors },
    reset: resetNotification,
  } = useForm({
    resolver: zodResolver(notificationSettingsSchema),
  });

  // Resource form
  const {
    register: registerResource,
    handleSubmit: handleSubmitResource,
    formState: { errors: resourceErrors },
    reset: resetResource,
    watch: watchResource,
  } = useForm({
    resolver: zodResolver(resourceSettingsSchema),
  });

  // Load settings data
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Mock data for now - in real implementation, this would come from API
        const mockSettings: OrganizationSettings = {
          profile: {
            name: 'Acme Corp',
            description: 'Leading AI/ML platform company',
            industry: 'Technology',
            website: 'https://acme.com',
            billing_email: 'billing@acme.com',
            timezone: 'America/New_York',
            locale: 'en-US',
          },
          security: {
            require_2fa: true,
            password_min_length: 12,
            password_require_uppercase: true,
            password_require_lowercase: true,
            password_require_numbers: true,
            password_require_symbols: true,
            session_timeout_minutes: 480,
            max_login_attempts: 5,
          },
          integrations: {
            slack_enabled: true,
            slack_webhook_url: 'https://hooks.slack.com/...',
            github_enabled: true,
            github_org: 'acme-corp',
            sso_enabled: false,
            sso_provider: '',
            api_rate_limit: 1000,
          },
          notifications: {
            email_notifications: true,
            slack_notifications: true,
            alert_frequency: 'immediate',
            digest_frequency: 'daily',
            maintenance_notifications: true,
            security_notifications: true,
          },
          resources: {
            max_cpu_cores: 32,
            max_memory_gb: 128,
            max_storage_gb: 1000,
            monthly_budget_usd: 5000,
            auto_scaling_enabled: true,
            cost_alerts_enabled: true,
            cost_alert_threshold_percent: 80,
          },
        };

        setSettings(mockSettings);
        
        // Reset forms with current data
        resetProfile(mockSettings.profile);
        resetSecurity(mockSettings.security);
        resetIntegration(mockSettings.integrations);
        resetNotification(mockSettings.notifications);
        resetResource(mockSettings.resources);
        
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [resetProfile, resetSecurity, resetIntegration, resetNotification, resetResource]);

  const onSaveProfile = async (data: any) => {
    try {
      setSaving(true);
      // API call would go here
      console.log('Saving profile:', data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const onSaveSecurity = async (data: any) => {
    try {
      setSaving(true);
      // API call would go here
      console.log('Saving security settings:', data);
      toast.success('Security settings updated successfully');
    } catch (error) {
      console.error('Failed to save security settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const onSaveIntegration = async (data: any) => {
    try {
      setSaving(true);
      // API call would go here
      console.log('Saving integration settings:', data);
      toast.success('Integration settings updated successfully');
    } catch (error) {
      console.error('Failed to save integration settings:', error);
      toast.error('Failed to save integration settings');
    } finally {
      setSaving(false);
    }
  };

  const onSaveNotification = async (data: any) => {
    try {
      setSaving(true);
      // API call would go here
      console.log('Saving notification settings:', data);
      toast.success('Notification settings updated successfully');
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const onSaveResource = async (data: any) => {
    try {
      setSaving(true);
      // API call would go here
      console.log('Saving resource settings:', data);
      toast.success('Resource settings updated successfully');
    } catch (error) {
      console.error('Failed to save resource settings:', error);
      toast.error('Failed to save resource settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
                <p className="text-gray-600">Configure your organization preferences and policies</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Resources</span>
            </TabsTrigger>
          </TabsList>

          {/* Organization Profile */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Profile</CardTitle>
                    <CardDescription>
                      Basic information about your organization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitProfile(onSaveProfile)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Organization Name</Label>
                          <Input
                            id="name"
                            {...registerProfile('name')}
                            disabled={!isAdmin}
                            className={profileErrors.name ? 'border-red-300' : ''}
                          />
                          {profileErrors.name && (
                            <p className="text-sm text-red-600 mt-1">{profileErrors.name.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="industry">Industry</Label>
                          <Input
                            id="industry"
                            {...registerProfile('industry')}
                            disabled={!isAdmin}
                            placeholder="e.g., Technology, Healthcare"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          {...registerProfile('description')}
                          disabled={!isAdmin}
                          placeholder="Brief description of your organization"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            type="url"
                            {...registerProfile('website')}
                            disabled={!isAdmin}
                            placeholder="https://example.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="billing_email">Billing Email</Label>
                          <Input
                            id="billing_email"
                            type="email"
                            {...registerProfile('billing_email')}
                            disabled={!isAdmin}
                            placeholder="billing@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="timezone">Timezone</Label>
                          <select
                            id="timezone"
                            {...registerProfile('timezone')}
                            disabled={!isAdmin}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="UTC">UTC</option>
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="locale">Locale</Label>
                          <select
                            id="locale"
                            {...registerProfile('locale')}
                            disabled={!isAdmin}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                            <option value="es-ES">Spanish</option>
                            <option value="fr-FR">French</option>
                            <option value="de-DE">German</option>
                          </select>
                        </div>
                      </div>

                      {isAdmin && (
                        <Button type="submit" disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Members</span>
                      <span className="font-medium">24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Projects</span>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deployed Models</span>
                      <span className="font-medium">15</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Usage</span>
                      <span className="font-medium">$2,847</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure authentication and security policies for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitSecurity(onSaveSecurity)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Authentication Requirements</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="require_2fa"
                        {...registerSecurity('require_2fa')}
                        disabled={!isAdmin}
                      />
                      <Label htmlFor="require_2fa">Require two-factor authentication for all users</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password Policy</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password_min_length">Minimum Password Length</Label>
                        <Input
                          id="password_min_length"
                          type="number"
                          min="8"
                          max="128"
                          {...registerSecurity('password_min_length')}
                          disabled={!isAdmin}
                        />
                      </div>

                      <div>
                        <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                        <Input
                          id="max_login_attempts"
                          type="number"
                          min="3"
                          max="10"
                          {...registerSecurity('max_login_attempts')}
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="password_require_uppercase"
                          {...registerSecurity('password_require_uppercase')}
                          disabled={!isAdmin}
                        />
                        <Label htmlFor="password_require_uppercase">Require uppercase letters</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="password_require_lowercase"
                          {...registerSecurity('password_require_lowercase')}
                          disabled={!isAdmin}
                        />
                        <Label htmlFor="password_require_lowercase">Require lowercase letters</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="password_require_numbers"
                          {...registerSecurity('password_require_numbers')}
                          disabled={!isAdmin}
                        />
                        <Label htmlFor="password_require_numbers">Require numbers</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="password_require_symbols"
                          {...registerSecurity('password_require_symbols')}
                          disabled={!isAdmin}
                        />
                        <Label htmlFor="password_require_symbols">Require special characters</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Session Management</h3>
                    
                    <div>
                      <Label htmlFor="session_timeout_minutes">Session Timeout (minutes)</Label>
                      <Input
                        id="session_timeout_minutes"
                        type="number"
                        min="15"
                        max="1440"
                        {...registerSecurity('session_timeout_minutes')}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>

                  {isAdmin && (
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Security Settings
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Settings */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Third-Party Integrations</CardTitle>
                  <CardDescription>
                    Connect your organization with external services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitIntegration(onSaveIntegration)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Communication</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Mail className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">Slack Integration</h4>
                              <p className="text-sm text-gray-600">Send notifications to Slack channels</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="slack_enabled"
                              {...registerIntegration('slack_enabled')}
                              disabled={!isAdmin}
                            />
                            <Badge variant={watchIntegration('slack_enabled') ? 'default' : 'secondary'}>
                              {watchIntegration('slack_enabled') ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>

                        {watchIntegration('slack_enabled') && (
                          <div>
                            <Label htmlFor="slack_webhook_url">Slack Webhook URL</Label>
                            <Input
                              id="slack_webhook_url"
                              {...registerIntegration('slack_webhook_url')}
                              disabled={!isAdmin}
                              placeholder="https://hooks.slack.com/services/..."
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Development</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Globe className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">GitHub Integration</h4>
                              <p className="text-sm text-gray-600">Connect with GitHub repositories</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="github_enabled"
                              {...registerIntegration('github_enabled')}
                              disabled={!isAdmin}
                            />
                            <Badge variant={watchIntegration('github_enabled') ? 'default' : 'secondary'}>
                              {watchIntegration('github_enabled') ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>

                        {watchIntegration('github_enabled') && (
                          <div>
                            <Label htmlFor="github_org">GitHub Organization</Label>
                            <Input
                              id="github_org"
                              {...registerIntegration('github_org')}
                              disabled={!isAdmin}
                              placeholder="your-github-org"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Single Sign-On</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Key className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">SSO Authentication</h4>
                              <p className="text-sm text-gray-600">Enable SAML or OAuth SSO</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="sso_enabled"
                              {...registerIntegration('sso_enabled')}
                              disabled={!isAdmin}
                            />
                            <Badge variant={watchIntegration('sso_enabled') ? 'default' : 'secondary'}>
                              {watchIntegration('sso_enabled') ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </div>
                        </div>

                        {watchIntegration('sso_enabled') && (
                          <div>
                            <Label htmlFor="sso_provider">SSO Provider</Label>
                            <select
                              id="sso_provider"
                              {...registerIntegration('sso_provider')}
                              disabled={!isAdmin}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Provider</option>
                              <option value="okta">Okta</option>
                              <option value="azure">Azure AD</option>
                              <option value="google">Google Workspace</option>
                              <option value="saml">Generic SAML</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">API Configuration</h3>
                      
                      <div>
                        <Label htmlFor="api_rate_limit">API Rate Limit (requests per minute)</Label>
                        <Input
                          id="api_rate_limit"
                          type="number"
                          min="100"
                          max="10000"
                          {...registerIntegration('api_rate_limit')}
                          disabled={!isAdmin}
                        />
                      </div>
                    </div>

                    {isAdmin && (
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Integration Settings
                          </>
                        )}
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when your organization receives notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitNotification(onSaveNotification)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email_notifications"
                          {...registerNotification('email_notifications')}
                          disabled={!isAdmin}
                        />
                        <Label htmlFor="email_notifications">Email notifications</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="slack_notifications"
                          {...registerNotification('slack_notifications')}
                          disabled={!isAdmin}
                        />
                        <Label htmlFor="slack_notifications">Slack notifications</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Frequency</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="alert_frequency">Alert Frequency</Label>
                        <select
                          id="alert_frequency"
                          {...registerNotification('alert_frequency')}
                          disabled={!isAdmin}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="digest_frequency">Digest Frequency</Label>
                        <select
                          id="digest_frequency"
                          {...registerNotification('digest_frequency')}
                          disabled={!isAdmin}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="maintenance_notifications"
                          {...registerNotification('maintenance_notifications')}
                          disabled={!isAdmin}
                        />
                        <Label htmlFor="maintenance_notifications">Maintenance and system updates</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="security_notifications"
                          {...registerNotification('security_notifications')}
                          disabled={!isAdmin}
                        />
                        <Label htmlFor="security_notifications">Security alerts and incidents</Label>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Notification Settings
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resource Management */}
          <TabsContent value="resources">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Management</CardTitle>
                  <CardDescription>
                    Configure resource limits, quotas, and cost management
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitResource(onSaveResource)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Resource Limits</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="max_cpu_cores">Max CPU Cores</Label>
                          <div className="flex items-center space-x-2">
                            <Cpu className="h-4 w-4 text-gray-500" />
                            <Input
                              id="max_cpu_cores"
                              type="number"
                              min="1"
                              max="128"
                              {...registerResource('max_cpu_cores')}
                              disabled={!isAdmin}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="max_memory_gb">Max Memory (GB)</Label>
                          <div className="flex items-center space-x-2">
                            <Database className="h-4 w-4 text-gray-500" />
                            <Input
                              id="max_memory_gb"
                              type="number"
                              min="1"
                              max="512"
                              {...registerResource('max_memory_gb')}
                              disabled={!isAdmin}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="max_storage_gb">Max Storage (GB)</Label>
                          <div className="flex items-center space-x-2">
                            <HardDrive className="h-4 w-4 text-gray-500" />
                            <Input
                              id="max_storage_gb"
                              type="number"
                              min="10"
                              max="10000"
                              {...registerResource('max_storage_gb')}
                              disabled={!isAdmin}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Cost Management</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="monthly_budget_usd">Monthly Budget (USD)</Label>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <Input
                              id="monthly_budget_usd"
                              type="number"
                              min="0"
                              max="100000"
                              {...registerResource('monthly_budget_usd')}
                              disabled={!isAdmin}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="cost_alert_threshold_percent">Cost Alert Threshold (%)</Label>
                          <Input
                            id="cost_alert_threshold_percent"
                            type="number"
                            min="50"
                            max="100"
                            {...registerResource('cost_alert_threshold_percent')}
                            disabled={!isAdmin}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="auto_scaling_enabled"
                            {...registerResource('auto_scaling_enabled')}
                            disabled={!isAdmin}
                          />
                          <Label htmlFor="auto_scaling_enabled">Enable auto-scaling</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="cost_alerts_enabled"
                            {...registerResource('cost_alerts_enabled')}
                            disabled={!isAdmin}
                          />
                          <Label htmlFor="cost_alerts_enabled">Enable cost alerts</Label>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Resource Settings
                          </>
                        )}
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Current Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Usage</CardTitle>
                  <CardDescription>Monitor your organization's resource consumption</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Cpu className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">16</div>
                      <div className="text-sm text-gray-600">CPU Cores Used</div>
                      <div className="text-xs text-gray-500 mt-1">of {watchResource('max_cpu_cores')} max</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">64 GB</div>
                      <div className="text-sm text-gray-600">Memory Used</div>
                      <div className="text-xs text-gray-500 mt-1">of {watchResource('max_memory_gb')} GB max</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <HardDrive className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">450 GB</div>
                      <div className="text-sm text-gray-600">Storage Used</div>
                      <div className="text-xs text-gray-500 mt-1">of {watchResource('max_storage_gb')} GB max</div>
                    </div>
                    
                    <div className="text-center p-4 border rounded-lg">
                      <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">$2,847</div>
                      <div className="text-sm text-gray-600">Monthly Spend</div>
                      <div className="text-xs text-gray-500 mt-1">of ${watchResource('monthly_budget_usd')} budget</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function OrganizationSettingsPage() {
  return (
    <ProtectedRoute requiredRole="viewer">
      <OrganizationSettingsContent />
    </ProtectedRoute>
  );
}
