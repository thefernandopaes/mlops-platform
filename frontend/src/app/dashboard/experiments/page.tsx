
'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Grid3X3,
  List,
  GitCompare,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  User,
  Calendar,
  Timer,
  Tag,
  TrendingUp,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Copy,
  Archive,
  Trash2,
  BarChart3,
  Download,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Experiment, ExperimentFilters, ExperimentViewMode, ExperimentSort } from '@/types/experiment';

function ExperimentsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ExperimentViewMode>('list');
  const [selectedExperiments, setSelectedExperiments] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [sortBy, setSortBy] = useState<ExperimentSort>({ field: 'created', direction: 'desc' });
  
  const [filters, setFilters] = useState<ExperimentFilters>({
    search: '',
    projects: [],
    status: [],
    frameworks: [],
    authors: [],
    tags: [],
    dateRange: {},
    customMetrics: []
  });

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Experiments' }
  ];

  const primaryAction = {
    label: 'Create Experiment',
    href: '/dashboard/experiments/new'
  };

  // Mock experiments data
  const experiments: Experiment[] = [
    {
      id: '1',
      name: 'Hyperparameter Tuning v3',
      description: 'Grid search optimization for XGBoost fraud detection model',
      status: 'completed',
      project: { id: '1', name: 'Fraud Detection' },
      model: { id: '1', name: 'XGBoost Fraud Classifier' },
      framework: 'xgboost',
      runCount: 25,
      bestRun: {
        id: 'run_1',
        metrics: { accuracy: 0.951, precision: 0.943, recall: 0.938 }
      },
      metrics: { accuracy: 0.951, precision: 0.943, recall: 0.938 },
      parameters: { max_depth: 7, learning_rate: 0.1, n_estimators: 200 },
      tags: ['hyperparameter-tuning', 'production'],
      author: { id: '1', name: 'John Doe', avatar: 'JD' },
      duration: '2h 30m',
      createdAt: '2024-01-20T08:00:00Z',
      startedAt: '2024-01-20T08:00:00Z',
      completedAt: '2024-01-20T10:30:00Z'
    },
    {
      id: '2',
      name: 'Feature Engineering v2',
      description: 'Testing new feature combinations for improved model performance',
      status: 'running',
      project: { id: '2', name: 'Recommendation Engine' },
      model: { id: '2', name: 'Neural Network Ensemble' },
      framework: 'tensorflow',
      runCount: 12,
      metrics: { accuracy: 0.923, precision: 0.915, f1_score: 0.919 },
      parameters: { learning_rate: 0.001, batch_size: 32, epochs: 100 },
      tags: ['feature-engineering', 'neural-network'],
      author: { id: '2', name: 'Sarah Chen', avatar: 'SC' },
      duration: '1h 15m',
      createdAt: '2024-01-20T14:00:00Z',
      startedAt: '2024-01-20T14:00:00Z',
      progress: 75
    },
    {
      id: '3',
      name: 'Model Architecture Comparison',
      description: 'Comparing different neural network architectures for image classification',
      status: 'failed',
      project: { id: '4', name: 'Image Classification' },
      framework: 'pytorch',
      runCount: 8,
      metrics: { accuracy: 0.876, top5_accuracy: 0.954 },
      parameters: { model: 'resnet50', learning_rate: 0.01, weight_decay: 0.0001 },
      tags: ['architecture', 'computer-vision'],
      author: { id: '3', name: 'Alex Kim', avatar: 'AK' },
      duration: '45m',
      createdAt: '2024-01-19T16:00:00Z',
      startedAt: '2024-01-19T16:00:00Z',
      completedAt: '2024-01-19T16:45:00Z'
    },
    {
      id: '4',
      name: 'Data Augmentation Study',
      description: 'Evaluating impact of different data augmentation techniques',
      status: 'cancelled',
      project: { id: '4', name: 'Image Classification' },
      framework: 'pytorch',
      runCount: 3,
      metrics: { accuracy: 0.832 },
      parameters: { augmentation: 'rotation+flip', intensity: 0.3 },
      tags: ['data-augmentation', 'preprocessing'],
      author: { id: '4', name: 'Emily Davis', avatar: 'ED' },
      duration: '20m',
      createdAt: '2024-01-19T09:00:00Z',
      startedAt: '2024-01-19T09:00:00Z'
    },
    {
      id: '5',
      name: 'Cross-validation Evaluation',
      description: 'K-fold cross-validation for model generalization assessment',
      status: 'completed',
      project: { id: '3', name: 'Customer Segmentation' },
      framework: 'scikit-learn',
      runCount: 10,
      bestRun: {
        id: 'run_5',
        metrics: { accuracy: 0.887, precision: 0.901, recall: 0.873 }
      },
      metrics: { accuracy: 0.887, precision: 0.901, recall: 0.873 },
      parameters: { n_splits: 5, model: 'random_forest', n_estimators: 100 },
      tags: ['cross-validation', 'evaluation'],
      author: { id: '5', name: 'Tom Wilson', avatar: 'TW' },
      duration: '1h 30m',
      createdAt: '2024-01-18T11:00:00Z',
      startedAt: '2024-01-18T11:00:00Z',
      completedAt: '2024-01-18T12:30:00Z'
    }
  ];

  // Filter experiments
  const filteredExperiments = experiments.filter(experiment => {
    const matchesSearch = experiment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      experiment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      experiment.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy.field) {
      case 'name':
        return sortBy.direction === 'asc' ? 
          a.name.localeCompare(b.name) : 
          b.name.localeCompare(a.name);
      case 'created':
        return sortBy.direction === 'asc' ? 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() :
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'status':
        return sortBy.direction === 'asc' ? 
          a.status.localeCompare(b.status) : 
          b.status.localeCompare(a.status);
      default:
        return 0;
    }
  });

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
              <span className="text-xs text-gray-500">{progress}%</span>
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

  const getTopMetrics = (metrics: Record<string, number>) => {
    return Object.entries(metrics)
      .slice(0, 3)
      .map(([key, value]) => ({
        name: key,
        value: typeof value === 'number' ? (value < 1 ? (value * 100).toFixed(1) + '%' : value.toFixed(3)) : value
      }));
  };

  const formatDuration = (duration?: string) => {
    return duration || 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectExperiment = (experimentId: string, checked: boolean) => {
    if (checked) {
      setSelectedExperiments([...selectedExperiments, experimentId]);
    } else {
      setSelectedExperiments(selectedExperiments.filter(id => id !== experimentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExperiments(filteredExperiments.map(exp => exp.id));
    } else {
      setSelectedExperiments([]);
    }
  };

  const getSortIcon = (field: ExperimentSort['field']) => {
    if (sortBy.field !== field) return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    return sortBy.direction === 'asc' ? 
      <ArrowUp className="h-4 w-4 text-blue-600" /> : 
      <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs} primaryAction={primaryAction}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Experiments</h1>
            <p className="text-gray-600 mt-1">Track and compare ML experiments</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-r-none"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('comparison')}
                className="rounded-l-none"
              >
                <GitCompare className="h-4 w-4" />
              </Button>
            </div>
            <Link href="/dashboard/experiments/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Experiment
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="">All Projects</option>
                    <option value="fraud-detection">Fraud Detection</option>
                    <option value="recommendation">Recommendation Engine</option>
                    <option value="image-classification">Image Classification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="">All Status</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Framework</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="">All Frameworks</option>
                    <option value="tensorflow">TensorFlow</option>
                    <option value="pytorch">PyTorch</option>
                    <option value="scikit-learn">Scikit-learn</option>
                    <option value="xgboost">XGBoost</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    <option value="">All Authors</option>
                    <option value="john-doe">John Doe</option>
                    <option value="sarah-chen">Sarah Chen</option>
                    <option value="alex-kim">Alex Kim</option>
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
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {selectedExperiments.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedExperiments.length} selected
              </span>
              <Button size="sm" variant="outline">
                <GitCompare className="mr-2 h-4 w-4" />
                Compare
              </Button>
              <Button size="sm" variant="outline">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
              <Button size="sm" variant="outline">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSortBy({ 
                field: 'created', 
                direction: sortBy.field === 'created' && sortBy.direction === 'desc' ? 'asc' : 'desc' 
              })}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
            >
              {getSortIcon('created')}
              <span>Sort</span>
            </button>
          </div>
        </div>

        {/* Experiments List */}
        {viewMode === 'list' && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <Checkbox
                          checked={selectedExperiments.length === filteredExperiments.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        <button
                          onClick={() => setSortBy({ 
                            field: 'name', 
                            direction: sortBy.field === 'name' && sortBy.direction === 'asc' ? 'desc' : 'asc' 
                          })}
                          className="flex items-center space-x-1"
                        >
                          <span>Experiment</span>
                          {getSortIcon('name')}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        <button
                          onClick={() => setSortBy({ 
                            field: 'status', 
                            direction: sortBy.field === 'status' && sortBy.direction === 'asc' ? 'desc' : 'asc' 
                          })}
                          className="flex items-center space-x-1"
                        >
                          <span>Status</span>
                          {getSortIcon('status')}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Metrics</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Runs</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Author</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Duration</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredExperiments.map((experiment) => (
                      <tr key={experiment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <Checkbox
                            checked={selectedExperiments.includes(experiment.id)}
                            onCheckedChange={(checked) => handleSelectExperiment(experiment.id, !!checked)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{experiment.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{experiment.description}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {experiment.project.name}
                              </Badge>
                              {experiment.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {getStatusBadge(experiment.status, experiment.progress)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            {getTopMetrics(experiment.metrics).map(metric => (
                              <div key={metric.name} className="flex justify-between text-sm">
                                <span className="text-gray-600">{metric.name}:</span>
                                <span className="font-medium">{metric.value}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {experiment.runCount}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                              {experiment.author.avatar}
                            </div>
                            <span className="text-sm text-gray-900">{experiment.author.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {formatDuration(experiment.duration)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="h-3 w-3" />
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

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments.map((experiment) => (
              <Card key={experiment.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Checkbox
                          checked={selectedExperiments.includes(experiment.id)}
                          onCheckedChange={(checked) => handleSelectExperiment(experiment.id, !!checked)}
                        />
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {experiment.name}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {experiment.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    {getStatusBadge(experiment.status, experiment.progress)}
                    <Badge variant="outline" className="text-xs">
                      {experiment.framework}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Key Metrics</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {getTopMetrics(experiment.metrics).map(metric => (
                        <div key={metric.name} className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{metric.value}</div>
                          <div className="text-xs text-gray-600">{metric.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project and Tags */}
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {experiment.project.name}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {experiment.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {experiment.runCount} runs
                    </div>
                    <div className="flex items-center">
                      <Timer className="h-3 w-3 mr-1" />
                      {formatDuration(experiment.duration)}
                    </div>
                  </div>

                  {/* Author and Date */}
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t">
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                        {experiment.author.avatar}
                      </div>
                      {experiment.author.name}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(experiment.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-3 border-t">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Copy className="h-3 w-3 mr-1" />
                      Clone
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

        {/* Comparison Mode */}
        {viewMode === 'comparison' && (
          <Card>
            <CardHeader>
              <CardTitle>Experiment Comparison</CardTitle>
              <CardDescription>
                Select experiments to compare side-by-side
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <GitCompare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select Experiments to Compare
                </h3>
                <p className="text-gray-600 mb-6">
                  Choose 2-4 experiments from the list to see a detailed comparison
                </p>
                <Button onClick={() => setViewMode('list')}>
                  Browse Experiments
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {filteredExperiments.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No experiments found' : 'No experiments yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Get started by creating your first experiment to track model performance and parameters.'
              }
            </p>
            {!searchQuery && (
              <Link href="/dashboard/experiments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Experiment
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {filteredExperiments.length > 20 && (
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-600">
              Showing {Math.min(20, filteredExperiments.length)} of {filteredExperiments.length} experiments
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ExperimentsPage() {
  return (
    <ProtectedRoute>
      <ExperimentsContent />
    </ProtectedRoute>
  );
}
