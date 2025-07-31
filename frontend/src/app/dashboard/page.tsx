
'use client';

import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Database, 
  GitBranch, 
  Users,
  Activity,
  TrendingUp,
  Building2,
  Rocket,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Play,
  Monitor,
  UserPlus,
  Settings,
  Eye,
  Filter,
  ExternalLink,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function DashboardContent() {
  const { user } = useAuth();
  const [activityFilter, setActivityFilter] = useState('all');

  const breadcrumbs = [
    { label: 'Dashboard' }
  ];

  const primaryAction = {
    label: 'Deploy Model',
    onClick: () => {
      console.log('Deploy model clicked');
    }
  };

  // Mock data for demonstration
  const metrics = {
    totalModels: { value: 24, change: '+3', trend: 'up' },
    activeDeployments: { value: 12, pending: 2, trend: 'stable' },
    uptime: { value: '99.2%', change: '+0.1%', trend: 'up' },
    alerts: { value: 3, critical: 1, trend: 'down' }
  };

  const recentActivities = [
    {
      id: 1,
      type: 'deployment',
      message: 'Model "fraud-detection-v2" deployed to production',
      user: 'Sarah Chen',
      avatar: 'SC',
      timestamp: '2 minutes ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'experiment',
      message: 'Experiment "hyperparameter-tuning-3" completed',
      user: 'Mike Johnson',
      avatar: 'MJ',
      timestamp: '15 minutes ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'alert',
      message: 'Model drift detected in "recommendation-engine"',
      user: 'System',
      avatar: 'SY',
      timestamp: '1 hour ago',
      status: 'warning'
    },
    {
      id: 4,
      type: 'model',
      message: 'New model "sentiment-analysis-v4" registered',
      user: 'Alex Kim',
      avatar: 'AK',
      timestamp: '3 hours ago',
      status: 'info'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Fraud Detection',
      models: 3,
      lastActivity: '2 hours ago',
      progress: 85,
      status: 'active'
    },
    {
      id: 2,
      name: 'Recommendation Engine',
      models: 5,
      lastActivity: '1 day ago',
      progress: 60,
      status: 'warning'
    },
    {
      id: 3,
      name: 'Customer Segmentation',
      models: 2,
      lastActivity: '3 days ago',
      progress: 100,
      status: 'completed'
    }
  ];

  const filterActivities = (activities: typeof recentActivities) => {
    if (activityFilter === 'all') return activities;
    return activities.filter(activity => activity.type === activityFilter);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Database className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} primaryAction={primaryAction}>
      <div className="p-6 space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'User'}!
          </h2>
          <p className="text-gray-600 mb-4">
            Here's an overview of your ML projects and recent activity.
          </p>
          
          {/* Quick Setup Checklist for new users */}
          {(!user?.organizationId || metrics.totalModels.value === 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Complete your setup</h3>
              <div className="space-y-2 text-sm">
                {!user?.organizationId && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full border-2 border-blue-500"></div>
                    <span>Create your organization</span>
                  </div>
                )}
                {metrics.totalModels.value === 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span>Register your first model</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Metrics Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Models</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalModels.value}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {metrics.totalModels.change} this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
              <Rocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeDeployments.value} running</div>
              <p className="text-xs text-muted-foreground">
                {metrics.activeDeployments.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uptime.value}</div>
              <div className="flex items-center text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                {metrics.uptime.change} vs last week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.alerts.value} warnings</div>
              <p className="text-xs text-red-600">
                {metrics.alerts.critical} critical
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Feed (Left Column) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Activity className="mr-2 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <select 
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="all">All</option>
                      <option value="model">Models</option>
                      <option value="deployment">Deployments</option>
                      <option value="alert">Alerts</option>
                      <option value="experiment">Experiments</option>
                    </select>
                  </div>
                </div>
                <CardDescription>
                  Real-time updates from your ML workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterActivities(recentActivities).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                          {activity.avatar}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(activity.status)}
                          <p className="text-sm text-gray-900">{activity.message}</p>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{activity.user}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link href="/dashboard/audit" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
                    View all activity
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Grid (Right Column) */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" size="sm">
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy New Model
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Play className="mr-2 h-4 w-4" />
                  Create Experiment
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Model Performance
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Team Member
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Monitor className="mr-2 h-4 w-4" />
                  Set Up Monitoring
                </Button>
                <Button className="w-full justify-start" variant="outline" size="sm">
                  <Database className="mr-2 h-4 w-4" />
                  Browse Model Registry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Projects Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <GitBranch className="mr-2 h-5 w-5" />
                Recent Projects
              </CardTitle>
              <Link href="/dashboard/projects">
                <Button variant="outline" size="sm">
                  View all projects
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </Link>
            </div>
            <CardDescription>
              Your most recently active ML projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <Badge 
                      variant={project.status === 'active' ? 'default' : project.status === 'warning' ? 'destructive' : 'secondary'}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {project.models} models • {project.lastActivity}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Rocket className="mr-1 h-3 w-3" />
                      Deploy
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Monitor className="mr-1 h-3 w-3" />
                      Monitor
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Performance Summary
              </CardTitle>
              <Button variant="outline" size="sm">
                Export Data
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
            <CardDescription>
              Model performance trends over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Performance chart will be rendered here</p>
                <p className="text-xs text-gray-400">
                  Interactive charts with deployment success rates, response times, and model accuracy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
