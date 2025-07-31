
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertCircle
} from 'lucide-react';
import { ProjectFormData } from '@/types/project';

function CreateProjectContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

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
    { label: 'Create Project' }
  ];

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

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // TODO: Implement save draft API call
      console.log('Saving draft:', formData);
      setIsDraft(false);
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    try {
      // TODO: Implement create project API call
      console.log('Creating project:', formData);
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDraft) {
      setShowUnsavedWarning(true);
    } else {
      router.push('/dashboard/projects');
    }
  };

  const confirmCancel = () => {
    router.push('/dashboard/projects');
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mt-1">Set up a new project to organize your ML models and experiments</p>
          </div>
          
          {isDraft && (
            <div className="flex items-center text-orange-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              Unsaved changes
            </div>
          )}
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
                        <p className="font-medium">You (Current User)</p>
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
            disabled={loading}
          >
            Cancel
          </Button>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={loading || !formData.name.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
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
      </div>
    </DashboardLayout>
  );
}

export default function CreateProjectPage() {
  return (
    <ProtectedRoute>
      <CreateProjectContent />
    </ProtectedRoute>
  );
}
