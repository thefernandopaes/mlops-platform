
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star,
  StarOff,
  Download,
  Rocket,
  Archive,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Database,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Code,
  Play,
  Copy,
  ExternalLink,
  GitBranch,
  Clock,
  Activity,
  MessageSquare,
  FileText,
  Settings,
  Eye,
  Users,
  Server,
  Monitor,
  Cpu,
  Memory,
  HardDrive,
  Zap,
  Globe,
  Shield,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Terminal
} from 'lucide-react';
import Link from 'next/link';
import { Model } from '@/types/model';

function ModelDetailsContent() {
  const params = useParams();
  const modelId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['metrics', 'training']);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Mock model data - would come from API
  const model: Model = {
    id: modelId,
    name: 'Fraud Detection System v2.1',
    description: 'Advanced XGBoost model for real-time credit card fraud detection with enhanced feature engineering and improved accuracy. Trained on 2M+ transactions with sophisticated ensemble methods.',
    version: '2.1.0',
    framework: 'xgboost',
    modelType: 'classification',
    stage: 'production',
    projectId: '1',
    projectName: 'Fraud Detection',
    tags: ['fraud', 'finance', 'binary-classification', 'production-ready', 'ensemble'],
    metrics: {
      accuracy: 0.962,
      precision: 0.943,
      recall: 0.881,
      f1Score: 0.912,
      auc: 0.978
    },
    fileSize: 45600000,
    filePath: '/models/fraud-detection-v2.1.xgb',
    createdBy: { id: '1', name: 'John Doe', avatar: 'JD' },
    updatedBy: { id: '1', name: 'John Doe', avatar: 'JD' },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    deploymentCount: 3,
    downloadCount: 156,
    isFavorite: true,
    isPublic: false
  };

  // Mock versions data
  const versions = [
    {
      id: '1',
      version: '2.1.0',
      stage: 'production',
      status: 'healthy',
      metrics: { accuracy: 0.962, precision: 0.943, recall: 0.881, f1Score: 0.912, auc: 0.978 },
      createdAt: '2024-01-20T14:30:00Z',
      createdBy: 'John Doe',
      deployments: 3,
      notes: 'Improved feature engineering with new transaction velocity features',
      fileSize: 45600000
    },
    {
      id: '2', 
      version: '2.0.0',
      stage: 'archived',
      status: 'archived',
      metrics: { accuracy: 0.945, precision: 0.928, recall: 0.867, f1Score: 0.896, auc: 0.971 },
      createdAt: '2024-01-15T10:00:00Z',
      createdBy: 'John Doe',
      deployments: 0,
      notes: 'Initial production release with baseline features',
      fileSize: 42300000
    },
    {
      id: '3',
      version: '1.3.0',
      stage: 'archived', 
      status: 'archived',
      metrics: { accuracy: 0.923, precision: 0.908, recall: 0.845, f1Score: 0.875, auc: 0.963 },
      createdAt: '2024-01-10T08:00:00Z',
      createdBy: 'Sarah Chen',
      deployments: 0,
      notes: 'Pre-production candidate with enhanced preprocessing',
      fileSize: 38900000
    }
  ];

  // Mock deployments data
  const deployments = [
    {
      id: '1',
      environment: 'production',
      endpoint: 'https://api.mlplatform.com/v1/fraud-detection',
      status: 'healthy',
      version: '2.1.0',
      instances: 3,
      cpu: '85%',
      memory: '2.1GB',
      requests: '1.2K/min',
      latency: '45ms',
      lastDeployed: '2024-01-20T14:30:00Z',
      deployedBy: 'John Doe'
    },
    {
      id: '2',
      environment: 'staging',
      endpoint: 'https://staging-api.mlplatform.com/v1/fraud-detection',
      status: 'healthy',
      version: '2.1.0',
      instances: 1,
      cpu: '23%',
      memory: '756MB',
      requests: '45/min',
      latency: '38ms',
      lastDeployed: '2024-01-20T15:00:00Z',
      deployedBy: 'John Doe'
    }
  ];

  // Mock performance data
  const performanceData = [
    { date: '2024-01-15', accuracy: 0.945, precision: 0.928, recall: 0.867, f1Score: 0.896 },
    { date: '2024-01-16', accuracy: 0.948, precision: 0.931, recall: 0.872, f1Score: 0.901 },
    { date: '2024-01-17', accuracy: 0.952, precision: 0.936, recall: 0.875, f1Score: 0.905 },
    { date: '2024-01-18', accuracy: 0.958, precision: 0.940, recall: 0.878, f1Score: 0.908 },
    { date: '2024-01-19', accuracy: 0.960, precision: 0.942, recall: 0.879, f1Score: 0.910 },
    { date: '2024-01-20', accuracy: 0.962, precision: 0.943, recall: 0.881, f1Score: 0.912 }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Models', href: '/dashboard/models' },
    { label: model.name }
  ];

  const handleEditName = () => {
    if (isEditingName) {
      // Save logic here
      console.log('Saving name:', editedName);
      setIsEditingName(false);
    } else {
      setEditedName(model.name);
      setIsEditingName(true);
    }
  };

  const handleEditDescription = () => {
    if (isEditingDescription) {
      // Save logic here
      console.log('Saving description:', editedDescription);
      setIsEditingDescription(false);
    } else {
      setEditedDescription(model.description);
      setIsEditingDescription(true);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'production': return 'bg-green-100 text-green-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'development': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb > 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Model Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Model Name */}
              {isEditingName ? (
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl font-bold h-auto p-2"
                  />
                  <Button size="sm" onClick={handleEditName}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditingName(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{model.name}</h1>
                  <Button size="sm" variant="ghost" onClick={handleEditName}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Badges */}
              <div className="flex items-center space-x-3 mb-3">
                <Badge variant="outline" className="text-sm">
                  v{model.version}
                </Badge>
                <Badge className={`text-sm ${getStageColor(model.stage)}`}>
                  {model.stage}
                </Badge>
                <div className="flex items-center space-x-1">
                  {getStatusIcon('healthy')}
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Last updated {formatDate(model.updatedAt)}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                {model.isFavorite ? 
                  <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
                  <StarOff className="h-4 w-4" />
                }
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Rocket className="mr-2 h-4 w-4" />
                Deploy
              </Button>
              <Button variant="outline" size="sm">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Description */}
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleEditDescription}>
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingDescription(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start space-x-2">
              <p className="text-gray-600 flex-1">{model.description}</p>
              <Button size="sm" variant="ghost" onClick={handleEditDescription}>
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Performance Metrics */}
                <Card>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleSection('metrics')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Performance Metrics</span>
                      </CardTitle>
                      {expandedSections.includes('metrics') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </div>
                  </CardHeader>
                  {expandedSections.includes('metrics') && (
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {(model.metrics.accuracy! * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">Accuracy</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {(model.metrics.precision! * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">Precision</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {(model.metrics.recall! * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">Recall</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {(model.metrics.f1Score! * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">F1 Score</p>
                        </div>
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                          <div className="text-2xl font-bold text-indigo-600">
                            {(model.metrics.auc! * 100).toFixed(1)}%
                          </div>
                          <p className="text-sm text-gray-600">AUC</p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Training Information */}
                <Card>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => toggleSection('training')}
                  >
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Database className="h-5 w-5" />
                        <span>Training Information</span>
                      </CardTitle>
                      {expandedSections.includes('training') ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </div>
                  </CardHeader>
                  {expandedSections.includes('training') && (
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="font-medium">Framework</Label>
                            <p className="text-gray-600 capitalize">{model.framework}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Model Type</Label>
                            <p className="text-gray-600 capitalize">{model.modelType.replace('-', ' ')}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Training Dataset</Label>
                            <p className="text-gray-600">Credit Card Transactions v3.2</p>
                          </div>
                          <div>
                            <Label className="font-medium">Training Duration</Label>
                            <p className="text-gray-600">4.2 hours</p>
                          </div>
                          <div>
                            <Label className="font-medium">Features</Label>
                            <p className="text-gray-600">47 engineered features</p>
                          </div>
                          <div>
                            <Label className="font-medium">Training Size</Label>
                            <p className="text-gray-600">2.1M transactions</p>
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Hyperparameters</Label>
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <code className="text-sm">
                              max_depth: 8, learning_rate: 0.1, n_estimators: 500, subsample: 0.8
                            </code>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Model Lineage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <GitBranch className="h-5 w-5" />
                      <span>Model Lineage</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">Data Preprocessing Pipeline</div>
                          <div className="text-sm text-gray-600">fraud_detection_preprocessing_v2.1</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">Feature Engineering</div>
                          <div className="text-sm text-gray-600">enhanced_feature_extraction_v1.3</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg bg-blue-50">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium">Current Model</div>
                          <div className="text-sm text-gray-600">fraud_detection_v2.1</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Downloads</span>
                      <span className="font-medium">{model.downloadCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deployments</span>
                      <span className="font-medium">{model.deploymentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">File Size</span>
                      <span className="font-medium">{formatFileSize(model.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created</span>
                      <span className="font-medium">{new Date(model.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {model.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Model deployed to production</p>
                          <p className="text-xs text-gray-600">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Version 2.1.0 uploaded</p>
                          <p className="text-xs text-gray-600">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Performance metrics updated</p>
                          <p className="text-xs text-gray-600">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Version History</h2>
                  <p className="text-gray-600">Manage and compare model versions</p>
                </div>
                <div className="flex space-x-2">
                  {selectedVersions.length > 1 && (
                    <Button variant="outline">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Compare Selected
                    </Button>
                  )}
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Version
                  </Button>
                </div>
              </div>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4">
                          <input type="checkbox" className="rounded" />
                        </th>
                        <th className="text-left p-4">Version</th>
                        <th className="text-left p-4">Stage</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Accuracy</th>
                        <th className="text-left p-4">F1 Score</th>
                        <th className="text-left p-4">Size</th>
                        <th className="text-left p-4">Created</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {versions.map((version) => (
                        <tr key={version.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4">
                            <input 
                              type="checkbox" 
                              className="rounded"
                              checked={selectedVersions.includes(version.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedVersions(prev => [...prev, version.id]);
                                } else {
                                  setSelectedVersions(prev => prev.filter(id => id !== version.id));
                                }
                              }}
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-medium">v{version.version}</div>
                            {version.notes && (
                              <div className="text-sm text-gray-600 mt-1">{version.notes}</div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge className={getStageColor(version.stage)}>
                              {version.stage}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(version.status)}
                              <span className="capitalize">{version.status}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">
                              {(version.metrics.accuracy * 100).toFixed(1)}%
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">
                              {(version.metrics.f1Score * 100).toFixed(1)}%
                            </div>
                          </td>
                          <td className="p-4">
                            {formatFileSize(version.fileSize)}
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {formatDate(version.createdAt)}
                            </div>
                            <div className="text-xs text-gray-600">
                              by {version.createdBy}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Rocket className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Schema Tab */}
          <TabsContent value="schema">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Model Schema</h2>
                <p className="text-gray-600">Input/output specification and API documentation</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Schema */}
                <Card>
                  <CardHeader>
                    <CardTitle>Input Schema</CardTitle>
                    <CardDescription>Expected input format and parameters</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="font-medium mb-2">Transaction Data</div>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">amount</span>
                            <Badge variant="outline">float</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">merchant_category</span>
                            <Badge variant="outline">string</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">transaction_time</span>
                            <Badge variant="outline">datetime</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">card_type</span>
                            <Badge variant="outline">string</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="font-medium">Example Request</Label>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md overflow-x-auto">
                          <pre className="text-sm">
{`{
  "amount": 125.50,
  "merchant_category": "grocery",
  "transaction_time": "2024-01-20T14:30:00Z",
  "card_type": "credit"
}`}
                          </pre>
                        </div>
                        <Button size="sm" variant="outline" className="mt-2">
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Example
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Output Schema */}
                <Card>
                  <CardHeader>
                    <CardTitle>Output Schema</CardTitle>
                    <CardDescription>Model prediction format and confidence scores</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <div className="font-medium mb-2">Prediction Result</div>
                        <div className="text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">is_fraud</span>
                            <Badge variant="outline">boolean</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">fraud_probability</span>
                            <Badge variant="outline">float</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">confidence_score</span>
                            <Badge variant="outline">float</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">risk_factors</span>
                            <Badge variant="outline">array</Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="font-medium">Example Response</Label>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md overflow-x-auto">
                          <pre className="text-sm">
{`{
  "is_fraud": false,
  "fraud_probability": 0.12,
  "confidence_score": 0.94,
  "risk_factors": ["unusual_time"]
}`}
                          </pre>
                        </div>
                        <Button size="sm" variant="outline" className="mt-2">
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Example
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* API Explorer */}
              <Card>
                <CardHeader>
                  <CardTitle>Interactive API Explorer</CardTitle>
                  <CardDescription>Test your model with sample data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="test-input">Test Input (JSON)</Label>
                      <textarea
                        id="test-input"
                        className="w-full h-32 mt-2 p-3 border border-gray-300 rounded-md font-mono text-sm"
                        placeholder="Paste your JSON input here..."
                        defaultValue={`{
  "amount": 125.50,
  "merchant_category": "grocery",
  "transaction_time": "2024-01-20T14:30:00Z",
  "card_type": "credit"
}`}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button>
                        <Play className="mr-2 h-4 w-4" />
                        Test Prediction
                      </Button>
                      <Button variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Performance Analytics</h2>
                <p className="text-gray-600">Monitor model performance over time and across environments</p>
              </div>

              {/* Performance Metrics Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Accuracy Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg">
                      <div className="text-center text-gray-500">
                        <LineChart className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart visualization would go here</p>
                        <p className="text-sm">Showing accuracy over time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Precision vs Recall</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border border-gray-200 rounded-lg">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart visualization would go here</p>
                        <p className="text-sm">Precision/Recall comparison</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Baseline Comparison</CardTitle>
                  <CardDescription>Compare current model with baseline and previous versions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-4">Model</th>
                          <th className="text-left p-4">Accuracy</th>
                          <th className="text-left p-4">Precision</th>
                          <th className="text-left p-4">Recall</th>
                          <th className="text-left p-4">F1 Score</th>
                          <th className="text-left p-4">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 bg-blue-50">
                          <td className="p-4 font-medium">Current (v2.1.0)</td>
                          <td className="p-4">96.2%</td>
                          <td className="p-4">94.3%</td>
                          <td className="p-4">88.1%</td>
                          <td className="p-4">91.2%</td>
                          <td className="p-4">-</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="p-4">Previous (v2.0.0)</td>
                          <td className="p-4">94.5%</td>
                          <td className="p-4">92.8%</td>
                          <td className="p-4">86.7%</td>
                          <td className="p-4">89.6%</td>
                          <td className="p-4">
                            <div className="flex items-center text-green-600">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              +1.7%
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="p-4">Baseline</td>
                          <td className="p-4">89.3%</td>
                          <td className="p-4">87.1%</td>
                          <td className="p-4">82.4%</td>
                          <td className="p-4">84.7%</td>
                          <td className="p-4">
                            <div className="flex items-center text-green-600">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              +6.9%
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Deployments Tab */}
          <TabsContent value="deployments">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Deployments</h2>
                  <p className="text-gray-600">Manage model deployments across environments</p>
                </div>
                <Button>
                  <Rocket className="mr-2 h-4 w-4" />
                  New Deployment
                </Button>
              </div>

              {/* Active Deployments */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {deployments.map((deployment) => (
                  <Card key={deployment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="capitalize">{deployment.environment}</CardTitle>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(deployment.status)}
                          <span className="text-sm capitalize">{deployment.status}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Version</Label>
                          <p className="font-medium">v{deployment.version}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Instances</Label>
                          <p className="font-medium">{deployment.instances}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">CPU Usage</Label>
                          <p className="font-medium">{deployment.cpu}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Memory</Label>
                          <p className="font-medium">{deployment.memory}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Requests/min</Label>
                          <p className="font-medium">{deployment.requests}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Latency</Label>
                          <p className="font-medium">{deployment.latency}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-600">Endpoint URL</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="flex-1 text-sm bg-gray-100 p-2 rounded">
                            {deployment.endpoint}
                          </code>
                          <Button size="sm" variant="outline">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm text-gray-600">
                          Deployed {formatDate(deployment.lastDeployed)} by {deployment.deployedBy}
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Monitor className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Terminal className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Deployment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Deployment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Production deployment successful</div>
                            <div className="text-sm text-gray-600">v2.1.0 deployed to production</div>
                          </div>
                          <div className="text-sm text-gray-600">2 hours ago</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Staging deployment</div>
                            <div className="text-sm text-gray-600">v2.1.0 deployed to staging</div>
                          </div>
                          <div className="text-sm text-gray-600">1 day ago</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Rollback completed</div>
                            <div className="text-sm text-gray-600">Rolled back from v2.0.1 to v2.0.0</div>
                          </div>
                          <div className="text-sm text-gray-600">3 days ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function ModelDetailsPage() {
  return (
    <ProtectedRoute>
      <ModelDetailsContent />
    </ProtectedRoute>
  );
}
