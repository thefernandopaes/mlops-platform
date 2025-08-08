'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Users,
  Building2,
  Mail,
  Loader2,
  Save,
  UserPlus,
  Trash2,
  Edit,
  Crown,
  Code,
  Eye,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import organizationService from '@/lib/organization-service';
import {
  OrganizationWithStats,
  OrganizationMember,
  OrganizationFormData,
  MemberInviteFormData,
  MemberRoleUpdateFormData,
  ORGANIZATION_ROLES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  OrganizationRole,
  OrganizationMemberListResponse,
} from '@/types/organization';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255),
  description: z.string().max(1000).optional(),
  billing_email: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
});

const inviteSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'developer', 'viewer']),
});

const roleUpdateSchema = z.object({
  role: z.enum(['admin', 'developer', 'viewer']),
});

type SettingsViewProps = {
  organizationId?: string;
};

export function OrganizationSettingsView({ organizationId }: SettingsViewProps) {
  const { user } = useAuth();
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(organizationId || null);
  const [organization, setOrganization] = useState<OrganizationWithStats | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize] = useState(10);
  const [memberTotal, setMemberTotal] = useState(0);

  // Organization form
  const {
    register: registerOrg,
    handleSubmit: handleSubmitOrg,
    formState: { errors: orgErrors },
    reset: resetOrg,
  } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
  });

  // Invite form
  const {
    register: registerInvite,
    handleSubmit: handleSubmitInvite,
    formState: { errors: inviteErrors },
    reset: resetInvite,
  } = useForm<MemberInviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'viewer' },
  });

  // Role update form
  const {
    register: registerRole,
    handleSubmit: handleSubmitRole,
    formState: { errors: roleErrors },
    setValue: setRoleValue,
  } = useForm<MemberRoleUpdateFormData>({
    resolver: zodResolver(roleUpdateSchema),
  });

  // Resolve org id from user if not provided
  useEffect(() => {
    if (!resolvedOrgId && user?.organizationId) {
      setResolvedOrgId(user.organizationId);
    }
  }, [user?.organizationId, resolvedOrgId]);

  // Load organization data
  useEffect(() => {
    const loadData = async () => {
      if (!resolvedOrgId) return;

      try {
        setLoading(true);
        const [orgData, membersData] = await Promise.all([
          organizationService.getOrganization(resolvedOrgId),
          organizationService.listMembers(
            resolvedOrgId,
            (memberPage - 1) * memberPageSize,
            memberPageSize
          ),
        ]);

        setOrganization(orgData);
        setMembers(membersData.members);
        setMemberTotal(membersData.total);

        resetOrg({
          name: orgData.name,
          description: orgData.description || '',
          billing_email: orgData.billing_email || '',
        });
      } catch (error) {
        console.error('Failed to load organization data:', error);
        toast.error('Failed to load organization data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedOrgId, memberPage, memberPageSize, resetOrg]);

  const onUpdateOrganization = async (data: OrganizationFormData) => {
    if (!organization) return;

    try {
      setSaving(true);
      const updatedOrg = await organizationService.updateOrganization(organization.id, {
        name: data.name,
        description: data.description || undefined,
        billing_email: data.billing_email || undefined,
      });

      setOrganization((prev) => (prev ? { ...prev, ...updatedOrg } : null));
      toast.success('Organization updated successfully');
    } catch (error) {
      console.error('Failed to update organization:', error);
      toast.error('Failed to update organization');
    } finally {
      setSaving(false);
    }
  };

  const onInviteUser = async (data: MemberInviteFormData) => {
    if (!organization) return;

    try {
      setInviting(true);
      const result = await organizationService.inviteUser(organization.id, data);

      if (result.success) {
        toast.success(result.message);
        resetInvite();
        setShowInviteForm(false);

        // Reload first page of members
        const membersData = await organizationService.listMembers(
          organization.id,
          0,
          memberPageSize
        );
        setMembers(membersData.members);
        setMemberTotal(membersData.total);
        setMemberPage(1);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
      toast.error('Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const onUpdateMemberRole = async (memberId: string, data: MemberRoleUpdateFormData) => {
    if (!organization) return;

    try {
      await organizationService.updateMemberRole(organization.id, memberId, data);
      setMembers((prev) =>
        prev.map((member) =>
          member.user_id === memberId ? { ...member, role: data.role } : member
        )
      );
      setEditingMember(null);
      toast.success('Member role updated successfully');
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Failed to update member role');
    }
  };

  const onRemoveMember = async (memberId: string) => {
    if (!organization) return;

    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await organizationService.removeMember(organization.id, memberId);
      setMembers((prev) => prev.filter((member) => member.user_id !== memberId));
      setMemberTotal((t) => Math.max(0, t - 1));
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member');
    }
  };

  const onDeleteOrganization = async () => {
    if (!organization) return;
    if (!confirm('This action cannot be undone. Delete organization?')) return;
    try {
      await organizationService.deleteOrganization(organization.id);
      toast.success('Organization deleted');
      // After deletion, clear state
      setOrganization(null);
    } catch (error) {
      console.error('Failed to delete organization:', error);
      toast.error('Failed to delete organization');
    }
  };

  const getRoleIcon = (role: OrganizationRole) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'developer':
        return <Code className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: OrganizationRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'developer':
        return 'default';
      case 'viewer':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const isAdmin = organization?.current_user_role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!organization || !resolvedOrgId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Organization not found</p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(memberTotal / memberPageSize));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
                  <p className="text-gray-600">{organization.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Role: {organization.current_user_role}</Badge>
                {isAdmin && (
                  <Button variant="outline" className="text-red-600 border-red-200" onClick={onDeleteOrganization}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Organization
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Organization Details */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Update your organization information and settings.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitOrg(onUpdateOrganization)} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Organization Name</Label>
                        <Input id="name" {...registerOrg('name')} disabled={!isAdmin} className={orgErrors.name ? 'border-red-300' : ''} />
                        {orgErrors.name && <p className="text-sm text-red-600 mt-1">{orgErrors.name.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" {...registerOrg('description')} disabled={!isAdmin} placeholder="Optional description" className={orgErrors.description ? 'border-red-300' : ''} />
                        {orgErrors.description && <p className="text-sm text-red-600 mt-1">{orgErrors.description.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="billing_email">Billing Email</Label>
                        <Input id="billing_email" type="email" {...registerOrg('billing_email')} disabled={!isAdmin} placeholder="billing@example.com" className={orgErrors.billing_email ? 'border-red-300' : ''} />
                        {orgErrors.billing_email && <p className="text-sm text-red-600 mt-1">{orgErrors.billing_email.message}</p>}
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

              {/* Organization Stats */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Members</span>
                      <span className="font-medium">{organization.stats.total_members}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projects</span>
                      <span className="font-medium">{organization.stats.total_projects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Models</span>
                      <span className="font-medium">{organization.stats.total_models}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experiments</span>
                      <span className="font-medium">{organization.stats.total_experiments}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deployments</span>
                      <span className="font-medium">{organization.stats.total_deployments}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Members Management */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your organization members and their roles.</CardDescription>
                  </div>
                  {isAdmin && (
                    <Button onClick={() => setShowInviteForm(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showInviteForm && isAdmin && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Invite New Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmitInvite(onInviteUser)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" {...registerInvite('email')} placeholder="user@example.com" className={inviteErrors.email ? 'border-red-300' : ''} />
                            {inviteErrors.email && <p className="text-sm text-red-600 mt-1">{inviteErrors.email.message}</p>}
                          </div>
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <select id="role" {...registerInvite('role')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                              <option value="viewer">Viewer</option>
                              <option value="developer">Developer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button type="submit" disabled={inviting}>
                            {inviting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Inviting...
                              </>
                            ) : (
                              <>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Invitation
                              </>
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => { setShowInviteForm(false); resetInvite(); }}>Cancel</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Members List */}
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{member.user.full_name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium">{member.user.full_name}</p>
                          <p className="text-sm text-gray-600">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {editingMember === member.user_id ? (
                          <form onSubmit={handleSubmitRole((data) => onUpdateMemberRole(member.user_id, data))} className="flex items-center space-x-2">
                            <select {...registerRole('role')} defaultValue={member.role} className="px-2 py-1 border border-gray-300 rounded text-sm">
                              <option value="viewer">Viewer</option>
                              <option value="developer">Developer</option>
                              <option value="admin">Admin</option>
                            </select>
                            <Button type="submit" size="sm">Save</Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setEditingMember(null)}>Cancel</Button>
                          </form>
                        ) : (
                          <>
                            <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center space-x-1">
                              {getRoleIcon(member.role)}
                              <span>{ORGANIZATION_ROLES[member.role]}</span>
                            </Badge>
                            {isAdmin && member.user_id !== user?.id && (
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => { setEditingMember(member.user_id); setRoleValue('role', member.role); }}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => onRemoveMember(member.user_id)} className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <span className="text-sm text-gray-600">Page {memberPage} of {totalPages}</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" disabled={memberPage <= 1} onClick={() => setMemberPage((p) => Math.max(1, p - 1))}>Prev</Button>
                    <Button variant="outline" size="sm" disabled={memberPage >= totalPages} onClick={() => setMemberPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default OrganizationSettingsView;


