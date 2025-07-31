
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Settings,
  Edit,
  Archive,
  Trash2,
  Eye,
  GitBranch,
  BarChart3,
  Monitor,
  Upload,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Download,
  Copy,
  Share,
  Bell,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Star,
  Target,
  Layers
} from 'lucide-react';
import Link from 'next/link';

function ProjectDetailsContent() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('models');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStage, setFilterStage] = useState('all');

  // Mock project data
  const project = {
    id: projectId,
    name: 'Fraud Detection System',
    description: 'Advanced machine learning system for detecting credit card fraud using multiple algorithms including XGBoost, Random Forest, and Neural Networks. This system processes millions of transactions daily and provides real-time fraud detection with high accuracy and low false positive rates.',
    visibility: 'private',
    status: 'active',
    members: [
      { id: 1, name: 'John Doe', email: 'john@company.com', avatar: 'JD', role: 'owner' },
      { id: 2, name: 'Sarah Chen', email: 'sarah@company.com', avatar: 'SC', role: 'contributor' },
      { id: 3, name: 'Mike Johnson', email: 'mike@company.com', avatar: 'MJ', role: 'contributor' },
      { id: 4, name: 'Emily Davis', email: 'emily@company.com', avatar: 'ED', role: 'viewer' },
    ],
    stats: {
      models: 12,
      experiments: 45,
      deployments: 8,
      activeDeployments: 3
    },
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/dashboard/projects' },
    { label: project.name }
  ];

  // Mock models data
  const models = [
    {
      id: 1,
      name: 'XGBoost Fraud Classifier v2.1',
      framework: 'xgboost',
      type: 'classification',
      stage: 'production',
      accuracy: 0.94,
      lastUpdated: '2 hours ago',
      status: 'active',
      experiments: 12,
      deployments: 3
    },
    {
      id: 2,
      name: 'Neural Network Ensemble',
      framework: 'tensorflow',
      type: 'classification',
      stage: 'staging',
      accuracy: 0.92,
      lastUpdated: '1 day ago',
      status: 'training',
      experiments: 8,
      deployments: 1
    },
    {
      id: 3,
      name: 'Random Forest Baseline',
      framework: 'scikit-learn',
      type: 'classification',
      stage: 'development',
      accuracy: 0.89,
      lastUpdated: '3 days ago',
      status: 'inactive',
      experiments: 5,
      deployments: 0
    }
  ];

  // Mock experiments data
  const experiments = [
    {
      id: 1,
      name: 'Feature Engineering v3',
      model: 'XGBoost Fraud Classifier',
      status: 'completed',
      accuracy: 0.94,
      duration: '2h 15m',
      startedAt: '2024-01-20 10:00',
      startedBy: 'John Doe'
    },
    {
      id: 2,
      name: 'Hyperparameter Tuning',
      model: 'Neural Network Ensemble',
      status: 'running',
      accuracy: 0.91,
      duration: '45m',
      startedAt: '2024-01-20 14:30',
      startedBy: 'Sarah Chen'
    }
  ];

  // Mock deployments data
  const deployments = [
    {
      id: 1,
      name: 'Production API',
      model: 'XGBoost Fraud Classifier v2.1',
      status: 'active',
      endpoint: 'https://api.company.com/fraud/predict',
      requests: '1.2M/day',
      latency: '45ms',
      uptime: '99.9%',
      deployedAt: '2024-01-18'
    },
    {
      id: 2,
      name: 'Staging Environment',
      model: 'Neural Network Ensemble',
      status: 'active',
      endpoint: 'https://staging-api.company.com/fraud/predict',
      requests: '50K/day',
      latency: '72ms',
      uptime: '99.5%',
      deployedAt: '2024-01-19'
    }
  ];

  // Mock activity data
  const activities = [
    {
      id: 1,
      type: 'model_upload',
      user: 'John Doe',
      description: 'Uploaded XGBoost Fraud Classifier v2.1',
      timestamp: '2 hours ago',
      details: 'Model accuracy: 94.2%'
    },
    {
      id: 2,
      type: 'deployment',
      user: 'Sarah Chen',
      description: 'Deployed Neural Network Ensemble to staging',
      timestamp: '1 day ago',
      details: 'Endpoint: staging-api.company.com'
    },
    {
      id: 3,
      type: 'experiment',
      user: 'Mike Johnson',
      description: 'Started feature engineering experiment',
      timestamp: '2 days ago',
      details: 'Testing new transaction features'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'production':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'staging':
        return <Badge className="bg-yellow-100 text-yellow-800">Staging</Badge>;
      case 'development':
        return <Badge className="bg-blue-100 text-blue-800">Development</Badge>;
      case 'training':
        return <Badge className="bg-purple-100 text-purple-800">Training</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'model_upload':
        return <Upload className="h-4 w-4 text-blue-500" />;
      case 'deployment':
        return <Rocket className="h-4 w-4 text-green-500" />;
      case 'experiment':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFramework = filterFramework === 'all' || model.framework === filterFramework;
    const matchesType = filterType === 'all' || model.type === filterType;
    const matchesStage = filterStage === 'all' || model.stage === filterStage;
    return matchesSearch && matchesFramework && matchesType && matchesStage;
  });

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Project Header */}
        <div className="border-b pb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                {getStatusBadge(project.status)}
              </div>
              
              <div className="mb-4">
                <p className={`text-gray-600 ${!isDescriptionExpanded ? 'line-clamp-2' : ''}`}>
                  {project.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-1 p-0 h-auto text-blue-600 hover:bg-transparent"
                >
                  {isDescriptionExpanded ? (
                    <>Show less <ChevronUp className="ml-1 h-3 w-3" /></>
                  ) : (
                    <>Show more <ChevronDown className="ml-1 h-3 w-3" /></>
                  )}
                </Button>
              </div>

              {/* Members */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 5).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white relative group"
                        title={`${member.name} (${member.role})`}
                      >
                        {member.avatar}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {member.name} ({member.role})
                        </div>
                      </div>
                    ))}
                    {project.members.length > 5 && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                        +{project.members.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{project.stats.models}</div>
                    <p className="text-sm text-gray-600">Models</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{project.stats.experiments}</div>
                    <p className="text-sm text-gray-600">Experiments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Rocket className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{project.stats.deployments}</div>
                    <p className="text-sm text-gray-600">Deployments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{project.stats.activeDeployments}</div>
                    <p className="text-sm text-gray-600">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="models" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Models
            </TabsTrigger>
            <TabsTrigger value="experiments" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Experiments
            </TabsTrigger>
            <TabsTrigger value="deployments" className="flex items-center">
              <Rocket className="h-4 w-4 mr-2" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center">
              <Monitor className="h-4 w-4 mr-2" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Models Tab */}
          <TabsContent value="models">
            <div className="space-y-4">
              {/* Models Header */}
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Models</h2>
                  <p className="text-gray-600">Manage your project's machine learning models</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline">
                    <GitBranch className="mr-2 h-4 w-4" />
                    Compare Models
                  </Button>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Model
                  </Button>
                </div>
              </div>

              {/* Models Filters */}
              <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={filterFramework}
                    onChange={(e) => setFilterFramework(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Frameworks</option>
                    <option value="tensorflow">TensorFlow</option>
                    <option value="pytorch">PyTorch</option>
                    <option value="xgboost">XGBoost</option>
                    <option value="scikit-learn">Scikit-learn</option>
                  </select>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="classification">Classification</option>
                    <option value="regression">Regression</option>
                    <option value="clustering">Clustering</option>
                  </select>
                  
                  <select
                    value={filterStage}
                    onChange={(e) => setFilterStage(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Stages</option>
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedModels.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-900">
                    {selectedModels.length} model(s) selected
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Rocket className="mr-2 h-3 w-3" />
                      Deploy
                    </Button>
                    <Button size="sm" variant="outline">
                      <Archive className="mr-2 h-3 w-3" />
                      Archive
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="mr-2 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}

              {/* Models Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredModels.map((model) => (
                  <Card key={model.id} className="hover:shadow-lg transition-shadow duration-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                            {model.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{model.framework}</Badge>
                            <Badge variant="outline">{model.type}</Badge>
                            {getStatusBadge(model.stage)}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(model.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModels([...selectedModels, model.id.toString()]);
                            } else {
                              setSelectedModels(selectedModels.filter(id => id !== model.id.toString()));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Model Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {(model.accuracy * 100).toFixed(1)}%
                          </div>
                          <p className="text-xs text-gray-600">Accuracy</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {model.experiments}
                          </div>
                          <p className="text-xs text-gray-600">Experiments</p>
                        </div>
                      </div>

                      {/* Status and Last Updated */}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                        <div className="flex items-center">
                          {getActivityIcon('model_upload')}
                          <span className="ml-1">{model.lastUpdated}</span>
                        </div>
                        <div>
                          {model.deployments} deployment(s)
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Rocket className="h-3 w-3 mr-1" />
                          Deploy
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Experiments</h2>
                  <p className="text-gray-600">Track and compare your model experiments</p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Experiment
                </Button>
              </div>

              <div className="space-y-4">
                {experiments.map((experiment) => (
                  <Card key={experiment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{experiment.name}</h3>
                          <p className="text-sm text-gray-600">{experiment.model}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Accuracy: {(experiment.accuracy * 100).toFixed(1)}%</span>
                            <span>Duration: {experiment.duration}</span>
                            <span>Started by {experiment.startedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(experiment.status)}
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Deployments Tab */}
          <TabsContent value="deployments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Deployments</h2>
                  <p className="text-gray-600">Manage your model deployments and endpoints</p>
                </div>
                <Button>
                  <Rocket className="mr-2 h-4 w-4" />
                  New Deployment
                </Button>
              </div>

              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <Card key={deployment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{deployment.name}</h3>
                          <p className="text-sm text-gray-600">{deployment.model}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(deployment.status)}
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Requests/day</p>
                          <p className="font-medium">{deployment.requests}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Latency</p>
                          <p className="font-medium">{deployment.latency}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Uptime</p>
                          <p className="font-medium">{deployment.uptime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Deployed</p>
                          <p className="font-medium">{deployment.deployedAt}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {deployment.endpoint}
                          </code>
                          <Button size="sm" variant="outline">
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Performance Monitoring</h2>
                <p className="text-gray-600">Monitor your deployed models' performance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Model Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94.2%</div>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +2.1% from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Prediction Latency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">45ms</div>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      -5ms from last week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Data Drift</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Low</div>
                    <p className="text-xs text-gray-600">No significant drift detected</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Performance charts would be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Project Settings</h2>
                <p className="text-gray-600">Configure your project settings and preferences</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <Input value={project.name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={project.description}
                      className="w-full p-3 border border-gray-300 rounded-md resize-none h-24"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-900">Archive Project</h4>
                      <p className="text-sm text-red-600">
                        Archive this project to make it read-only
                      </p>
                    </div>
                    <Button variant="outline" className="border-red-300 text-red-700">
                      Archive
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-900">Delete Project</h4>
                      <p className="text-sm text-red-600">
                        Permanently delete this project and all its data
                      </p>
                    </div>
                    <Button variant="destructive">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Project Activity</h2>
                  <p className="text-gray-600">Timeline of all project activities</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-3 w-3" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-3 w-3" />
                    Filter
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {activity.description}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {activity.timestamp}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">by {activity.user}</p>
                          {activity.details && (
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.details}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function ProjectDetailsPage() {
  return (
    <ProtectedRoute>
      <ProjectDetailsContent />
    </ProtectedRoute>
  );
}
