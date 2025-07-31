
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Copy,
  Download,
  Share2,
  Settings,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  FileText,
  Package,
  Eye,
  Filter,
  Search,
  MoreHorizontal,
  Trash2,
  GitCompare,
  Maximize2,
  RefreshCw,
  Calendar,
  User,
  Cpu,
  MemoryStick,
  HardDrive,
  Zap,
  Timer,
  Target,
  AlertCircle,
  Info,
  Tag,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  PauseCircle,
  StopCircle
} from 'lucide-react';
import Link from 'next/link';
import { Experiment } from '@/types/experiment';

interface ExperimentRun {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  parameters: Record<string, any>;
  metrics: Record<string, number>;
  artifacts: string[];
  startedAt: string;
  completedAt?: string;
  duration?: string;
  progress?: number;
  logs: string[];
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
}

interface ExperimentArtifact {
  id: string;
  name: string;
  type: 'model' | 'plot' | 'data' | 'config' | 'other';
  size: string;
  createdAt: string;
  runId?: string;
  description?: string;
  downloadUrl: string;
  previewUrl?: string;
}

function ExperimentDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const experimentId = params.id as string;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(5000);

  // Mock experiment data
  const experiment: Experiment = {
    id: experimentId,
    name: 'Hyperparameter Tuning v3',
    description: 'Grid search optimization for XGBoost fraud detection model with advanced feature engineering and cross-validation',
    status: 'running',
    project: { id: '1', name: 'Fraud Detection' },
    model: { id: '1', name: 'XGBoost Fraud Classifier' },
    framework: 'xgboost',
    runCount: 25,
    bestRun: {
      id: 'run_15',
      metrics: { accuracy: 0.951, precision: 0.943, recall: 0.938, f1_score: 0.940 }
    },
    metrics: { accuracy: 0.951, precision: 0.943, recall: 0.938, f1_score: 0.940 },
    parameters: { max_depth: 7, learning_rate: 0.1, n_estimators: 200, subsample: 0.8 },
    tags: ['hyperparameter-tuning', 'production', 'cross-validation'],
    author: { id: '1', name: 'John Doe', avatar: 'JD' },
    duration: '2h 30m',
    createdAt: '2024-01-20T08:00:00Z',
    startedAt: '2024-01-20T08:00:00Z',
    progress: 75
  };

  // Mock runs data
  const runs: ExperimentRun[] = [
    {
      id: 'run_15',
      name: 'Best Run - High Accuracy',
      status: 'completed',
      parameters: { max_depth: 7, learning_rate: 0.1, n_estimators: 200 },
      metrics: { accuracy: 0.951, precision: 0.943, recall: 0.938, f1_score: 0.940 },
      artifacts: ['model.pkl', 'confusion_matrix.png', 'feature_importance.png'],
      startedAt: '2024-01-20T09:15:00Z',
      completedAt: '2024-01-20T09:45:00Z',
      duration: '30m',
      logs: ['Training started...', 'Epoch 1/100 completed', 'Best validation score: 0.951'],
      resourceUsage: { cpu: 85, memory: 12.5, gpu: 45 }
    },
    {
      id: 'run_23',
      name: 'Current Run',
      status: 'running',
      parameters: { max_depth: 8, learning_rate: 0.05, n_estimators: 300 },
      metrics: { accuracy: 0.923, precision: 0.915, recall: 0.898 },
      artifacts: [],
      startedAt: '2024-01-20T10:30:00Z',
      duration: '45m',
      progress: 75,
      logs: ['Training in progress...', 'Epoch 75/100 completed', 'Current validation score: 0.923'],
      resourceUsage: { cpu: 92, memory: 14.2, gpu: 78 }
    },
    {
      id: 'run_12',
      name: 'Failed Run - Memory Error',
      status: 'failed',
      parameters: { max_depth: 12, learning_rate: 0.2, n_estimators: 500 },
      metrics: { accuracy: 0.876 },
      artifacts: ['error_log.txt'],
      startedAt: '2024-01-20T08:30:00Z',
      completedAt: '2024-01-20T08:45:00Z',
      duration: '15m',
      logs: ['Training started...', 'Memory allocation error', 'Run terminated'],
      resourceUsage: { cpu: 95, memory: 16.0 }
    }
  ];

  // Mock artifacts data
  const artifacts: ExperimentArtifact[] = [
    {
      id: 'artifact_1',
      name: 'best_model.pkl',
      type: 'model',
      size: '2.3 MB',
      createdAt: '2024-01-20T09:45:00Z',
      runId: 'run_15',
      description: 'Best performing XGBoost model',
      downloadUrl: '/download/artifact_1'
    },
    {
      id: 'artifact_2',
      name: 'confusion_matrix.png',
      type: 'plot',
      size: '156 KB',
      createdAt: '2024-01-20T09:45:00Z',
      runId: 'run_15',
      description: 'Confusion matrix for best model',
      downloadUrl: '/download/artifact_2',
      previewUrl: '/preview/artifact_2'
    },
    {
      id: 'artifact_3',
      name: 'feature_importance.png',
      type: 'plot',
      size: '98 KB',
      createdAt: '2024-01-20T09:45:00Z',
      runId: 'run_15',
      description: 'Feature importance visualization',
      downloadUrl: '/download/artifact_3',
      previewUrl: '/preview/artifact_3'
    },
    {
      id: 'artifact_4',
      name: 'experiment_config.json',
      type: 'config',
      size: '2 KB',
      createdAt: '2024-01-20T08:00:00Z',
      description: 'Experiment configuration and parameters',
      downloadUrl: '/download/artifact_4'
    }
  ];

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Experiments', href: '/dashboard/experiments' },
    { label: experiment.name }
  ];

  const getStatusBadge = (status: string, progress?: number) => {
    switch (status) {
      case 'running':
        return (
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-100 text-blue-800">
              <Play className="h-3 w-3 mr-1" />
              Running
            </Badge>
            {progress && (
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{progress}%</span>
              </div>
            )}
          </div>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary">
            <Pause className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDuration = (duration?: string) => {
    return duration || 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStopExperiment = () => {
    console.log('Stopping experiment...');
  };

  const handleRestartExperiment = () => {
    console.log('Restarting experiment...');
  };

  const handleCloneExperiment = () => {
    router.push(`/dashboard/experiments/new?clone=${experimentId}`);
  };

  const handleShareExperiment = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleExportResults = () => {
    console.log('Exporting results...');
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 space-y-6">
        {/* Experiment Header */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{experiment.name}</h1>
                {getStatusBadge(experiment.status, experiment.progress)}
              </div>
              <p className="text-gray-600 mb-4">{experiment.description}</p>
              
              {/* Key Metrics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {Object.entries(experiment.metrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {typeof value === 'number' ? (value < 1 ? (value * 100).toFixed(1) + '%' : value.toFixed(3)) : value}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
              </div>

              {/* Runtime Information */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Runtime: {formatDuration(experiment.duration)}
                </div>
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {experiment.runCount} runs
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {experiment.author.name}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Started {formatDate(experiment.startedAt)}
                </div>
              </div>
            </div>

            {/* Control Actions */}
            <div className="flex flex-wrap gap-2">
              {experiment.status === 'running' && (
                <Button onClick={handleStopExperiment} variant="outline" size="sm">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              )}
              <Button onClick={handleRestartExperiment} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
              <Button onClick={handleCloneExperiment} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Clone
              </Button>
              <Button onClick={handleShareExperiment} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleExportResults} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="runs">Runs</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Experiment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Experiment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Project</h4>
                    <Badge variant="outline">{experiment.project.name}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Associated Model</h4>
                    {experiment.model ? (
                      <Link href={`/dashboard/models/${experiment.model.id}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                          {experiment.model.name}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Badge>
                      </Link>
                    ) : (
                      <span className="text-gray-500">No associated model</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Framework</h4>
                    <Badge variant="secondary">{experiment.framework}</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {experiment.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Best Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Best Results</CardTitle>
                  <CardDescription>
                    Best performing run from this experiment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {experiment.bestRun ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Run ID:</span>
                        <Badge variant="secondary">{experiment.bestRun.id}</Badge>
                      </div>
                      {Object.entries(experiment.bestRun.metrics).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{key}:</span>
                          <span className="font-semibold">
                            {typeof value === 'number' ? (value < 1 ? (value * 100).toFixed(1) + '%' : value.toFixed(3)) : value}
                          </span>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        <Eye className="h-3 w-3 mr-2" />
                        View Run Details
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-500">No completed runs yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Runtime Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Runtime Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Runtime:</span>
                    <span className="font-medium">{formatDuration(experiment.duration)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed Runs:</span>
                    <span className="font-medium">{runs.filter(r => r.status === 'completed').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Failed Runs:</span>
                    <span className="font-medium text-red-600">{runs.filter(r => r.status === 'failed').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Success Rate:</span>
                    <span className="font-medium text-green-600">
                      {((runs.filter(r => r.status === 'completed').length / runs.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Cpu className="h-4 w-4 mr-2" />
                        CPU Usage
                      </span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <MemoryStick className="h-4 w-4 mr-2" />
                        Memory Usage
                      </span>
                      <span>12.5 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center">
                        <Zap className="h-4 w-4 mr-2" />
                        GPU Usage
                      </span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Runs Tab */}
          <TabsContent value="runs" className="space-y-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search runs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              
              {selectedRuns.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{selectedRuns.length} selected</span>
                  <Button size="sm" variant="outline">
                    <GitCompare className="h-4 w-4 mr-2" />
                    Compare
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <Checkbox />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Run</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Best Metric</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Duration</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Started</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {runs.map((run) => (
                        <tr key={run.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <Checkbox />
                          </td>
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{run.name || run.id}</div>
                              <div className="text-sm text-gray-500">ID: {run.id}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {getStatusBadge(run.status, run.progress)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm">
                              {Object.entries(run.metrics).slice(0, 1).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">
                                    {typeof value === 'number' ? (value < 1 ? (value * 100).toFixed(1) + '%' : value.toFixed(3)) : value}
                                  </span>
                                  <span className="text-gray-500 ml-1">({key})</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            {formatDuration(run.duration)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatDate(run.startedAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-1">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              {run.status === 'running' && (
                                <Button size="sm" variant="outline">
                                  <StopCircle className="h-3 w-3" />
                                </Button>
                              )}
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
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Real-time Metrics Dashboard</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4 mr-2" />
                  Fullscreen
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Accuracy Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Accuracy Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Interactive chart would be here</p>
                      <p className="text-sm text-gray-400">Real-time accuracy tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loss Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Loss Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Interactive chart would be here</p>
                      <p className="text-sm text-gray-400">Real-time loss tracking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Metric Comparison */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Metric Comparison Across Runs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <GitCompare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Run comparison visualization would be here</p>
                      <p className="text-sm text-gray-400">Compare metrics across different runs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <select 
                  value={logLevel} 
                  onChange={(e) => setLogLevel(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search Logs
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {refreshInterval ? 'Auto-refresh: On' : 'Auto-refresh: Off'}
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Training Logs</CardTitle>
                <CardDescription>Real-time experiment logs and system messages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
                  <div className="space-y-1">
                    <div>[2024-01-20 08:00:15] INFO: Experiment started</div>
                    <div>[2024-01-20 08:00:16] INFO: Loading training data...</div>
                    <div>[2024-01-20 08:00:18] INFO: Data loaded successfully (10,000 samples)</div>
                    <div>[2024-01-20 08:00:20] INFO: Starting hyperparameter optimization</div>
                    <div>[2024-01-20 08:00:22] INFO: Run 1/25 started with params: max_depth=3, learning_rate=0.1</div>
                    <div>[2024-01-20 08:02:45] INFO: Run 1/25 completed - Accuracy: 0.892</div>
                    <div>[2024-01-20 08:02:46] INFO: Run 2/25 started with params: max_depth=5, learning_rate=0.1</div>
                    <div>[2024-01-20 08:05:12] INFO: Run 2/25 completed - Accuracy: 0.923</div>
                    <div>[2024-01-20 08:05:13] WARN: Memory usage approaching limit (90%)</div>
                    <div>[2024-01-20 08:05:15] INFO: Run 3/25 started with params: max_depth=7, learning_rate=0.1</div>
                    <div>[2024-01-20 08:07:42] INFO: Run 3/25 completed - Accuracy: 0.951</div>
                    <div>[2024-01-20 08:07:43] INFO: New best score achieved!</div>
                    <div>[2024-01-20 08:07:45] INFO: Run 4/25 started with params: max_depth=9, learning_rate=0.1</div>
                    <div>[2024-01-20 08:10:12] ERROR: Run 4/25 failed - Out of memory</div>
                    <div>[2024-01-20 08:10:15] INFO: Adjusting memory allocation...</div>
                    <div>[2024-01-20 08:10:20] INFO: Run 5/25 started with params: max_depth=7, learning_rate=0.05</div>
                    <div className="text-yellow-400">[2024-01-20 10:30:42] INFO: Currently running - Run 23/25...</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Artifacts Tab */}
          <TabsContent value="artifacts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Experiment Artifacts</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artifacts.map((artifact) => (
                <Card key={artifact.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-gray-400" />
                        <div>
                          <CardTitle className="text-sm font-medium">{artifact.name}</CardTitle>
                          <CardDescription className="text-xs">{artifact.size}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {artifact.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {artifact.description && (
                      <p className="text-sm text-gray-600">{artifact.description}</p>
                    )}
                    {artifact.runId && (
                      <div className="text-xs text-gray-500">
                        From run: {artifact.runId}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Created: {formatDate(artifact.createdAt)}
                    </div>
                    <div className="flex space-x-2">
                      {artifact.previewUrl && (
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Artifact Lineage */}
            <Card>
              <CardHeader>
                <CardTitle>Artifact Lineage</CardTitle>
                <CardDescription>Track the relationships and dependencies between artifacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <div className="text-center">
                    <GitCompare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Artifact lineage graph would be here</p>
                    <p className="text-sm text-gray-400">Visualize artifact dependencies and relationships</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function ExperimentDetailsPage() {
  return (
    <ProtectedRoute>
      <ExperimentDetailsContent />
    </ProtectedRoute>
  );
}
