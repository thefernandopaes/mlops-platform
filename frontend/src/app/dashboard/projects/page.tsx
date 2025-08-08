
'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import projectService from '@/lib/project-service';
import { useAuth } from '@/contexts/auth-context';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Users,
  Database,
  Rocket,
  Activity,
  Calendar,
  Archive,
  Edit,
  Trash2,
  Eye,
  GitBranch,
  BarChart3,
  ArrowUpDown,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

function ProjectsContent() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<any[]>([]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects' }
  ];

  const primaryAction = {
    label: 'Create Project',
    href: '/dashboard/projects/new'
  };

  useEffect(() => {
    const run = async () => {
      if (!user?.organizationId) return;
      setLoading(true);
      try {
        const res = await projectService.list(user.organizationId, (page - 1) * pageSize, pageSize);
        setItems(res.projects);
        setTotal(res.total);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user?.organizationId, page, pageSize]);

  const projects = useMemo(() => {
    // Adapt backend shape to UI fields used (keeping legacy fields in UI for now)
    return items.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      status: 'active',
      memberCount: 0,
      members: [],
      modelCount: 0,
      experimentCount: 0,
      deploymentCount: 0,
      lastActivity: new Date(p.updatedAt || p.createdAt).toLocaleString(),
      createdAt: p.createdAt,
      isPersonal: false,
    }));
  }, [items]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'activity':
          return a.lastActivity.localeCompare(b.lastActivity);
        case 'models':
          return b.modelCount - a.modelCount;
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    archived: projects.filter(p => p.status === 'archived').length,
    personal: projects.filter(p => p.isPersonal).length,
    team: projects.filter(p => !p.isPersonal).length,
    avgModels: Math.round(projects.reduce((sum, p) => sum + p.modelCount, 0) / projects.length)
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatLastActivity = (activity: string) => {
    return activity;
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} primaryAction={primaryAction}>
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">Organize and manage your ML projects</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link href="/dashboard/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-500">{stats.archived}</div>
              <p className="text-sm text-gray-600">Archived</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.team}</div>
              <p className="text-sm text-gray-600">Team Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.personal}</div>
              <p className="text-sm text-gray-600">Personal</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.avgModels}</div>
              <p className="text-sm text-gray-600">Avg Models</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Projects</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="name">Name</option>
              <option value="created">Created Date</option>
              <option value="activity">Last Activity</option>
              <option value="models">Models Count</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading projects...</div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Member Avatars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div className="flex -space-x-2">
                        {project.members.slice(0, 5).map((member, index) => (
                          <div
                            key={member.id}
                            className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
                            title={member.name}
                          >
                            {member.avatar}
                          </div>
                        ))}
                        {project.memberCount > 5 && (
                          <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                            +{project.memberCount - 5}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {project.isPersonal ? 'Personal' : 'Team'}
                    </span>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Database className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="text-sm font-semibold text-gray-900">{project.modelCount}</span>
                      </div>
                      <p className="text-xs text-gray-600">Models</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <BarChart3 className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-sm font-semibold text-gray-900">{project.experimentCount}</span>
                      </div>
                      <p className="text-xs text-gray-600">Experiments</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center">
                        <Rocket className="h-3 w-3 text-purple-500 mr-1" />
                        <span className="text-sm font-semibold text-gray-900">{project.deploymentCount}</span>
                      </div>
                      <p className="text-xs text-gray-600">Deployments</p>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <div className="flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      {formatLastActivity(project.lastActivity)}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex space-x-1">
                      <Link href={`/dashboard/projects/${project.id}`}>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/projects/${project.id}/edit`}>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                    <div className="flex space-x-1">
                      {project.status !== 'archived' && (
                        <Button size="sm" variant="outline">
                          <Archive className="h-3 w-3" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <GitBranch className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No projects found' : 'Create your first project'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Get started by creating a new project to organize your models and experiments.'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link href="/dashboard/projects/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {total > pageSize && (
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-600">
              Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <ProjectsContent />
    </ProtectedRoute>
  );
}
