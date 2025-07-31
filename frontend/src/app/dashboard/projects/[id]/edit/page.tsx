
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Plus, 
  X, 
  Upload, 
  Users, 
  Settings, 
  Info,
  Mail,
  Trash2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { ProjectFormData, Project } from '@/types/project';

function EditProjectContent() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [project, setProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState<ProjectFormData>({
    // Basic Information
    name: '',
    description: '',
    visibility: 'private',
    tags: [],
    
    // Team Configuration
    members: [],
    bulkEmails: '',
    
    // Settings
    defaultEnvironment: 'development',
    experimentRetention: 90,
    notifications: {
      deployments: true,
      experiments: true,
      alerts: true,
      teamChanges: false,
    },
    gitRepository: '',
    slackChannel: '',
    resourceLimits: {
      cpu: 2,
      memory: 4,
    },
    customDomain: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState<'contributor' | 'viewer'>('contributor');

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/dashboard/projects' },
    { label: project?.name || 'Loading...', href: `/dashboard/projects/${projectId}` },
    { label: 'Edit' }
  ];

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      
      setLoading(true);
      try {
        // TODO: Implement API call to fetch project
        // Mock data for now
        const mockProject: Project = {
          id: projectId,
          name: 'Fraud Detection System',
          description: 'Machine learning system for detecting fraudulent transactions',
          slug: 'fraud-detection-system',
          visibility: 'organization',
          settings: {
            defaultEnvironment: 'staging',
            experimentRetention: 90,
            notifications: {
              deployments: true,
              experiments: true,
              alerts: false,
              teamChanges: true,
            },
            integrations: {
              gitRepository: 'https://github.com/company/fraud-detection',
              slackChannel: '#ml-alerts',
            },
            advanced: {
              resourceLimits: {
                cpu: 4,
                memory: 8,
              },
              customDomain: 'fraud.company.com',
            },
          },
          tags: ['fraud', 'classification', 'production'],
          organizationId: 'org-123',
          createdBy: 'user-123',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
          isActive: true,
        };

        setProject(mockProject);
        
        // Populate form with project data
        setFormData({
          name: mockProject.name,
          description: mockProject.description || '',
          visibility: mockProject.visibility,
          tags: mockProject.tags || [],
          members: [], // TODO: Load from API
          bulkEmails: '',
          defaultEnvironment: mockProject.settings.defaultEnvironment,
          experimentRetention: mockProject.settings.experimentRetention,
          notifications: mockProject.settings.notifications,
          gitRepository: mockProject.settings.integrations.gitRepository || '',
          slackChannel: mockProject.settings.integrations.slackChannel || '',
          resourceLimits: mockProject.settings.advanced.resourceLimits || { cpu: 2, memory: 4 },
          customDomain: mockProject.settings.advanced.customDomain || '',
        });
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDraft(true);
  };

  const handleNestedInputChange = (parent: keyof ProjectFormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
    setIsDraft(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
      setIsDraft(true);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    setIsDraft(true);
  };

  const addMember = () => {
    if (memberEmail.trim() && !formData.members.find(m => m.email === memberEmail.trim())) {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, { email: memberEmail.trim(), role: memberRole }]
      }));
      setMemberEmail('');
      setIsDraft(true);
    }
  };

  const removeMember = (emailToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.email !== emailToRemove)
    }));
    setIsDraft(true);
  };

  const processBulkEmails = () => {
    if (formData.bulkEmails.trim()) {
      const emails = formData.bulkEmails
        .split(/[,\n]/)
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));
      
      const newMembers = emails
        .filter(email => !formData.members.find(m => m.email === email))
        .map(email => ({ email, role: 'contributor' as const }));
      
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, ...newMembers],
        bulkEmails: ''
      }));
      setIsDraft(true);
    }
  };

  const handleSaveChanges = async () => {
    setSaveLoading(true);
    try {
      // TODO: Implement update project API call
      console.log('Updating project:', { id: projectId, ...formData });
      setIsDraft(false);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    setDeleteLoading(true);
    try {
      // TODO: Implement delete project API call
      console.log('Deleting project:', projectId);
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDraft) {
      setShowUnsavedWarning(true);
    } else {
      router.push(`/dashboard/projects/${projectId}`);
    }
  };

  const confirmCancel = () => {
    router.push(`/dashboard/projects/${projectId}`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout breadcrumbs={breadcrumbs}>
          <div className="p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading project...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <DashboardLayout breadcrumbs={breadcrumbs}>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-4">The project you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => router.push('/dashboard/projects')}>
              Back to Projects
            </Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600 mt-1">Update your project settings and configuration</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {isDraft && (
              <div className="flex items-center text-orange-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                Unsaved changes
              </div>
            )}
            
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Basic Information
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Team Configuration
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>
                  Basic information about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Fraud Detection System"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your project's purpose and goals..."
                    className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                  />
                </div>

                {/* Visibility */}
                <div className="space-y-3">
                  <Label>Visibility</Label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={formData.visibility === 'private'}
                        onChange={(e) => handleInputChange('visibility', e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="font-medium">Private</span>
                      <span className="text-sm text-gray-600">- Only project members can access</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="visibility"
                        value="organization"
                        checked={formData.visibility === 'organization'}
                        onChange={(e) => handleInputChange('visibility', e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="font-medium">Organization</span>
                      <span className="text-sm text-gray-600">- All organization members can view</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={formData.visibility === 'public'}
                        onChange={(e) => handleInputChange('visibility', e.target.value)}
                        className="text-blue-600"
                      />
                      <span className="font-medium">Public</span>
                      <span className="text-sm text-gray-600">- Anyone can view (read-only)</span>
                    </label>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label>Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Project Avatar */}
                <div className="space-y-2">
                  <Label>Project Avatar</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload project image</p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Configuration</CardTitle>
                <CardDescription>
                  Manage project members and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Owner */}
                <div className="space-y-2">
                  <Label>Project Owner</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        U
                      </div>
                      <div>
                        <p className="font-medium">Project Owner</p>
                        <p className="text-sm text-gray-600">Owner</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Team Members */}
                <div className="space-y-3">
                  <Label>Add Team Members</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="Enter email address..."
                    />
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value as 'contributor' | 'viewer')}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="contributor">Contributor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <Button type="button" onClick={addMember} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Current Members */}
                {formData.members.length > 0 && (
                  <div className="space-y-2">
                    <Label>Team Members ({formData.members.length})</Label>
                    <div className="space-y-2">
                      {formData.members.map((member) => (
                        <div key={member.email} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm">
                              {member.email[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{member.email}</p>
                              <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeMember(member.email)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bulk Invite */}
                <div className="space-y-3">
                  <Label>Bulk Invite</Label>
                  <textarea
                    value={formData.bulkEmails}
                    onChange={(e) => handleInputChange('bulkEmails', e.target.value)}
                    placeholder="Enter multiple email addresses separated by commas or new lines..."
                    className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                  />
                  <Button type="button" onClick={processBulkEmails} variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Process Emails
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Default Environment */}
              <Card>
                <CardHeader>
                  <CardTitle>Environment Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Model Environment</Label>
                    <select
                      value={formData.defaultEnvironment}
                      onChange={(e) => handleInputChange('defaultEnvironment', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Experiment Retention Policy</Label>
                    <select
                      value={formData.experimentRetention}
                      onChange={(e) => handleInputChange('experimentRetention', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={365}>365 days</option>
                      <option value={-1}>Forever</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {Object.entries(formData.notifications).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <Checkbox
                          checked={value}
                          onCheckedChange={(checked) => 
                            handleNestedInputChange('notifications', key, checked)
                          }
                        />
                        <span className="capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Git Repository</Label>
                    <Input
                      value={formData.gitRepository}
                      onChange={(e) => handleInputChange('gitRepository', e.target.value)}
                      placeholder="https://github.com/org/repo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Slack Channel</Label>
                    <Input
                      value={formData.slackChannel}
                      onChange={(e) => handleInputChange('slackChannel', e.target.value)}
                      placeholder="#ml-notifications"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CPU Limit (cores)</Label>
                      <Input
                        type="number"
                        value={formData.resourceLimits.cpu}
                        onChange={(e) => handleNestedInputChange('resourceLimits', 'cpu', parseInt(e.target.value))}
                        min={1}
                        max={16}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Memory Limit (GB)</Label>
                      <Input
                        type="number"
                        value={formData.resourceLimits.memory}
                        onChange={(e) => handleNestedInputChange('resourceLimits', 'memory', parseInt(e.target.value))}
                        min={1}
                        max={64}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Custom Domain</Label>
                    <Input
                      value={formData.customDomain}
                      onChange={(e) => handleInputChange('customDomain', e.target.value)}
                      placeholder="my-project.example.com"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button 
            onClick={handleCancel} 
            variant="outline"
            disabled={saveLoading}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSaveChanges}
            disabled={saveLoading || !formData.name.trim()}
          >
            <Save className="mr-2 h-4 w-4" />
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Unsaved Changes Warning */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2">Unsaved Changes</h3>
              <p className="text-gray-600 mb-4">
                You have unsaved changes. Are you sure you want to leave without saving?
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowUnsavedWarning(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Keep Editing
                </Button>
                <Button
                  onClick={confirmCancel}
                  variant="destructive"
                  className="flex-1"
                >
                  Discard Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-red-900">Delete Project</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{project.name}"? This action cannot be undone. 
                All models, experiments, and deployments in this project will be permanently removed.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteProject}
                  variant="destructive"
                  className="flex-1"
                  disabled={deleteLoading}
                >
                  {deleteLoading ? 'Deleting...' : 'Delete Project'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function EditProjectPage() {
  return (
    <ProtectedRoute>
      <EditProjectContent />
    </ProtectedRoute>
  );
}
