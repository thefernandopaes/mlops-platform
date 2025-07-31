
'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Grid3X3,
  List,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Cpu,
  HardDrive,
  Gauge,
  Calendar,
  User,
  ExternalLink,
  Eye,
  Settings,
  Scale,
  PowerOff,
  RotateCcw,
  Download,
  FileText,
  Server,
  Globe,
  Zap,
  AlertCircle,
  TrendingUp,
  Monitor,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { Deployment, DeploymentFilters, DeploymentViewMode, DeploymentStats } from '@/types/deployment';

function DeploymentsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<DeploymentViewMode>('grid');
  const [selectedDeployments, setSelectedDeployments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<DeploymentFilters>({
    environment: [],
    status: [],
    health: [],
    model: [],
    dateRange: {}
  });

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Deployments' }
  ];

  const primaryAction = {
    label: 'Deploy Model',
    href: '/dashboard/deployments/new'
  };

  // Mock deployments data
  const deployments: Deployment[] = [
    {
      id: '1',
      name: 'fraud-detection-api',
      model: { id: '1', name: 'XGBoost Fraud Classifier', version: '1.2.3' },
      project: { id: '1', name: 'Fraud Detection' },
      environment: 'production',
      status: 'active',
      health: 'healthy',
      endpoint: 'https://fraud-api.example.com',
      instanceType: 'medium',
      instances: { current: 3, min: 2, max: 10 },
      resources: { cpu: 45, memory: 62, requests: 1247 },
      uptime: 99.9,
      lastDeployed: '2024-01-20T14:30:00Z',
      lastUpdated: '2024-01-22T09:15:00Z',
      deployedBy: 'John Doe',
      alerts: 0,
      autoScaling: true,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'recommendation-engine',
      model: { id: '2', name: 'Collaborative Filtering', version: '2.1.0' },
      project: { id: '2', name: 'Recommendation Engine' },
      environment: 'production',
      status: 'active',
      health: 'warning',
      endpoint: 'https://recommend-api.example.com',
      instanceType: 'large',
      instances: { current: 5, min: 3, max: 15 },
      resources: { cpu: 78, memory: 84, requests: 3456 },
      uptime: 98.5,
      lastDeployed: '2024-01-18T11:00:00Z',
      lastUpdated: '2024-01-21T16:20:00Z',
      deployedBy: 'Sarah Chen',
      alerts: 2,
      autoScaling: true,
      createdAt: '2024-01-10T14:00:00Z'
    },
    {
      id: '3',
      name: 'sentiment-analyzer-v1',
      model: { id: '3', name: 'BERT Sentiment Analyzer', version: '1.0.0' },
      project: { id: '5', name: 'NLP Sentiment Analysis' },
      environment: 'staging',
      status: 'deploying',
      health: 'healthy',
      endpoint: 'https://sentiment-staging.example.com',
      instanceType: 'gpu',
      instances: { current: 1, min: 1, max: 3 },
      resources: { cpu: 23, memory: 41, requests: 89 },
      uptime: 100,
      lastDeployed: '2024-01-22T13:45:00Z',
      lastUpdated: '2024-01-22T13:45:00Z',
      deployedBy: 'Mike Johnson',
      alerts: 0,
      autoScaling: false,
      createdAt: '2024-01-22T13:30:00Z'
    },
    {
      id: '4',
      name: 'image-classifier-dev',
      model: { id: '4', name: 'ResNet Image Classifier', version: '3.0.1' },
      project: { id: '4', name: 'Image Classification' },
      environment: 'development',
      status: 'active',
      health: 'healthy',
      endpoint: 'https://image-dev.example.com',
      instanceType: 'small',
      instances: { current: 1, min: 1, max: 2 },
      resources: { cpu: 34, memory: 28, requests: 156 },
      uptime: 95.2,
      lastDeployed: '2024-01-21T08:30:00Z',
      lastUpdated: '2024-01-21T15:10:00Z',
      deployedBy: 'Alex Kim',
      alerts: 0,
      autoScaling: false,
      createdAt: '2024-01-20T12:00:00Z'
    },
    {
      id: '5',
      name: 'old-fraud-model',
      model: { id: '1', name: 'XGBoost Fraud Classifier', version: '1.1.0' },
      project: { id: '1', name: 'Fraud Detection' },
      environment: 'production',
      status: 'failed',
      health: 'critical',
      endpoint: 'https://fraud-old.example.com',
      instanceType: 'medium',
      instances: { current: 0, min: 1, max: 5 },
      resources: { cpu: 0, memory: 0, requests: 0 },
      uptime: 0,
      lastDeployed: '2024-01-19T10:00:00Z',
      lastUpdated: '2024-01-19T10:15:00Z',
      deployedBy: 'John Doe',
      alerts: 5,
      autoScaling: true,
      createdAt: '2024-01-15T09:00:00Z'
    },
    {
      id: '6',
      name: 'sales-forecaster-staging',
      model: { id: '5', name: 'LSTM Sales Forecaster', version: '2.0.0' },
      project: { id: '6', name: 'Time Series Forecasting' },
      environment: 'staging',
      status: 'inactive',
      health: 'healthy',
      endpoint: 'https://sales-staging.example.com',
      instanceType: 'medium',
      instances: { current: 0, min: 1, max: 3 },
      resources: { cpu: 0, memory: 0, requests: 0 },
      uptime: 100,
      lastDeployed: '2024-01-17T14:20:00Z',
      lastUpdated: '2024-01-20T11:30:00Z',
      deployedBy: 'Lisa Wang',
      alerts: 0,
      autoScaling: true,
      createdAt: '2024-01-12T16:00:00Z'
    }
  ];

  // Calculate stats
  const stats: DeploymentStats = {
    total: deployments.length,
    active: deployments.filter(d => d.status === 'active').length,
    deploying: deployments.filter(d => d.status === 'deploying').length,
    failed: deployments.filter(d => d.status === 'failed').length,
    totalRequests: deployments.reduce((sum, d) => sum + d.resources.requests, 0),
    avgUptime: deployments.reduce((sum, d) => sum + d.uptime, 0) / deployments.length,
    healthyCount: deployments.filter(d => d.health === 'healthy').length,
    warningCount: deployments.filter(d => d.health === 'warning').length,
    criticalCount: deployments.filter(d => d.health === 'critical').length
  };

  // Filter deployments
  const filteredDeployments = deployments.filter(deployment => {
    const matchesSearch = deployment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deployment.model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deployment.project.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || deployment.environment === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'deploying':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Play className="h-3 w-3 mr-1" />
            Deploying
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary">
            <Pause className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'terminating':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Square className="h-3 w-3 mr-1" />
            Terminating
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getHealthBadge = (health: string, alerts: number) => {
    switch (health) {
      case 'healthy':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">Healthy</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-yellow-700">Warning</span>
            {alerts > 0 && (
              <Badge variant="secondary" className="text-xs">
                {alerts} alerts
              </Badge>
            )}
          </div>
        );
      case 'critical':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-700">Critical</span>
            {alerts > 0 && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                {alerts} alerts
              </Badge>
            )}
          </div>
        );
      default:
        return <span className="text-sm text-gray-500">{health}</span>;
    }
  };

  const getEnvironmentBadge = (environment: string) => {
    switch (environment) {
      case 'production':
        return <Badge className="bg-purple-100 text-purple-800">Production</Badge>;
      case 'staging':
        return <Badge className="bg-yellow-100 text-yellow-800">Staging</Badge>;
      case 'development':
        return <Badge className="bg-blue-100 text-blue-800">Development</Badge>;
      default:
        return <Badge variant="outline">{environment}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`;
  };

  const handleSelectDeployment = (deploymentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDeployments([...selectedDeployments, deploymentId]);
    } else {
      setSelectedDeployments(selectedDeployments.filter(id => id !== deploymentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeployments(filteredDeployments.map(d => d.id));
    } else {
      setSelectedDeployments([]);
    }
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} primaryAction={primaryAction}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deployments</h1>
            <p className="text-gray-600 mt-1">Manage model deployments across environments</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Link href="/dashboard/deployments/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Deploy Model
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Deployments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Server className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Requests/hr</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalRequests.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Uptime</p>
                  <p className="text-2xl font-bold text-indigo-600">{formatUptime(stats.avgUptime)}</p>
                </div>
                <Activity className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="development">
              Development ({deployments.filter(d => d.environment === 'development').length})
            </TabsTrigger>
            <TabsTrigger value="staging">
              Staging ({deployments.filter(d => d.environment === 'staging').length})
            </TabsTrigger>
            <TabsTrigger value="production">
              Production ({deployments.filter(d => d.environment === 'production').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-6">
            {/* Filters Panel */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="deploying">Deploying</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Health</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">All Health</option>
                        <option value="healthy">Healthy</option>
                        <option value="warning">Warning</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">All Models</option>
                        <option value="fraud">XGBoost Fraud Classifier</option>
                        <option value="recommendation">Collaborative Filtering</option>
                        <option value="sentiment">BERT Sentiment Analyzer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instance Type</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                        <option value="">All Types</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="gpu">GPU</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search and Actions */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search deployments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {selectedDeployments.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedDeployments.length} selected
                  </span>
                  <Button size="sm" variant="outline">
                    <Scale className="mr-2 h-4 w-4" />
                    Scale
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart
                  </Button>
                  <Button size="sm" variant="outline">
                    <PowerOff className="mr-2 h-4 w-4" />
                    Terminate
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Health Check
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Deployments Grid */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDeployments.map((deployment) => (
                  <Card key={deployment.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                              checked={selectedDeployments.includes(deployment.id)}
                              onCheckedChange={(checked) => handleSelectDeployment(deployment.id, !!checked)}
                            />
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {deployment.name}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-sm text-gray-600">
                            {deployment.model.name} v{deployment.model.version}
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        {getStatusBadge(deployment.status)}
                        {getEnvironmentBadge(deployment.environment)}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Health and Endpoint */}
                      <div className="space-y-2">
                        {getHealthBadge(deployment.health, deployment.alerts)}
                        <div className="flex items-center text-sm text-gray-600">
                          <Globe className="h-3 w-3 mr-1" />
                          <span className="truncate">{deployment.endpoint}</span>
                        </div>
                      </div>

                      {/* Resource Metrics */}
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Cpu className="h-3 w-3 mr-1 text-blue-600" />
                            <span className="font-semibold">{deployment.resources.cpu}%</span>
                          </div>
                          <div className="text-xs text-gray-600">CPU</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <HardDrive className="h-3 w-3 mr-1 text-green-600" />
                            <span className="font-semibold">{deployment.resources.memory}%</span>
                          </div>
                          <div className="text-xs text-gray-600">Memory</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="h-3 w-3 mr-1 text-purple-600" />
                            <span className="font-semibold">{deployment.resources.requests}</span>
                          </div>
                          <div className="text-xs text-gray-600">Req/hr</div>
                        </div>
                      </div>

                      {/* Instance Info */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Server className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{deployment.instances.current}/{deployment.instances.max} instances</span>
                        </div>
                        <div className="flex items-center">
                          <Activity className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{formatUptime(deployment.uptime)} uptime</span>
                        </div>
                      </div>

                      {/* Deployment Info */}
                      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {deployment.deployedBy}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(deployment.lastDeployed)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-3 border-t">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Configure
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Deployments List */}
            {viewMode === 'list' && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <Checkbox
                              checked={selectedDeployments.length === filteredDeployments.length}
                              onCheckedChange={handleSelectAll}
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Deployment</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Health</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Resources</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Instances</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Uptime</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Last Updated</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredDeployments.map((deployment) => (
                          <tr key={deployment.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <Checkbox
                                checked={selectedDeployments.includes(deployment.id)}
                                onCheckedChange={(checked) => handleSelectDeployment(deployment.id, !!checked)}
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{deployment.name}</div>
                                <div className="text-sm text-gray-500">
                                  {deployment.model.name} v{deployment.model.version}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  {getEnvironmentBadge(deployment.environment)}
                                  <Badge variant="outline" className="text-xs">
                                    {deployment.instanceType}
                                  </Badge>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              {getStatusBadge(deployment.status)}
                            </td>
                            <td className="px-4 py-4">
                              {getHealthBadge(deployment.health, deployment.alerts)}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="space-y-1">
                                <div>CPU: {deployment.resources.cpu}%</div>
                                <div>Memory: {deployment.resources.memory}%</div>
                                <div>Requests: {deployment.resources.requests}/hr</div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {deployment.instances.current} / {deployment.instances.max}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {formatUptime(deployment.uptime)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatDate(deployment.lastUpdated)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center space-x-1">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {filteredDeployments.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Server className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No deployments found' : 'No deployments yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                    : 'Get started by deploying your first model to make it available via API.'
                  }
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/deployments/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Deploy Model
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function DeploymentsPage() {
  return (
    <ProtectedRoute>
      <DeploymentsContent />
    </ProtectedRoute>
  );
}
