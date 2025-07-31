
'use client';

import { useState, useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Upload, 
  Filter, 
  Grid3X3,
  List,
  Star,
  StarOff,
  Download,
  Play,
  Archive,
  MoreHorizontal,
  TrendingUp,
  Calendar,
  Users,
  Database,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  GitBranch,
  Rocket,
  Tags,
  Cpu,
  Brain,
  Camera,
  MessageSquare,
  BarChart3,
  Clock,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { Model, ModelFilters, ModelSort, ModelViewMode } from '@/types/model';

function ModelsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ModelViewMode>('grid');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [sortBy, setSortBy] = useState<ModelSort>({ field: 'updated', direction: 'desc' });
  
  const [filters, setFilters] = useState<ModelFilters>({
    search: '',
    projects: [],
    frameworks: [],
    modelTypes: [],
    stages: [],
    tags: []
  });

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Model Registry' }
  ];

  const primaryAction = {
    label: 'Upload Model',
    href: '/dashboard/models/upload'
  };

  // Mock data for models
  const models: Model[] = [
    {
      id: '1',
      name: 'Fraud Detection v2.1',
      description: 'XGBoost model for credit card fraud detection with improved accuracy',
      version: '2.1.0',
      framework: 'xgboost',
      modelType: 'classification',
      stage: 'production',
      projectId: '1',
      projectName: 'Fraud Detection',
      tags: ['fraud', 'finance', 'binary-classification', 'production-ready'],
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
    },
    {
      id: '2',
      name: 'Product Recommender',
      description: 'Deep learning recommendation system using collaborative filtering',
      version: '1.3.2',
      framework: 'tensorflow',
      modelType: 'recommendation',
      stage: 'staging',
      projectId: '2',
      projectName: 'Recommendation Engine',
      tags: ['recommendation', 'tensorflow', 'collaborative-filtering', 'e-commerce'],
      metrics: {
        accuracy: 0.847,
        precision: 0.823,
        recall: 0.791
      },
      fileSize: 128500000,
      filePath: '/models/product-recommender-v1.3.2.h5',
      createdBy: { id: '2', name: 'Sarah Chen', avatar: 'SC' },
      updatedBy: { id: '2', name: 'Sarah Chen', avatar: 'SC' },
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-18T16:45:00Z',
      deploymentCount: 1,
      downloadCount: 89,
      isFavorite: false,
      isPublic: true
    },
    {
      id: '3',
      name: 'Sentiment Analyzer',
      description: 'BERT-based sentiment analysis for social media text',
      version: '1.0.0',
      framework: 'huggingface',
      modelType: 'nlp',
      stage: 'development',
      projectId: '5',
      projectName: 'NLP Sentiment Analysis',
      tags: ['nlp', 'sentiment', 'bert', 'social-media', 'transformers'],
      metrics: {
        accuracy: 0.891,
        f1Score: 0.885
      },
      fileSize: 412000000,
      filePath: '/models/sentiment-bert-v1.0.0/',
      createdBy: { id: '3', name: 'Mike Johnson', avatar: 'MJ' },
      updatedBy: { id: '4', name: 'Emily Davis', avatar: 'ED' },
      createdAt: '2024-01-05T12:00:00Z',
      updatedAt: '2024-01-17T09:20:00Z',
      deploymentCount: 0,
      downloadCount: 23,
      isFavorite: true,
      isPublic: false
    },
    {
      id: '4',
      name: 'Image Classifier v3',
      description: 'ResNet50-based image classification for automotive parts',
      version: '3.0.1',
      framework: 'pytorch',
      modelType: 'computer-vision',
      stage: 'production',
      projectId: '4',
      projectName: 'Image Classification',
      tags: ['computer-vision', 'resnet', 'automotive', 'classification'],
      metrics: {
        accuracy: 0.934,
        precision: 0.928,
        recall: 0.912
      },
      fileSize: 97300000,
      filePath: '/models/image-classifier-v3.0.1.pth',
      createdBy: { id: '5', name: 'Alex Kim', avatar: 'AK' },
      updatedBy: { id: '5', name: 'Alex Kim', avatar: 'AK' },
      createdAt: '2024-01-20T14:00:00Z',
      updatedAt: '2024-01-22T11:15:00Z',
      deploymentCount: 2,
      downloadCount: 67,
      isFavorite: false,
      isPublic: true
    },
    {
      id: '5',
      name: 'Sales Forecaster',
      description: 'LSTM model for time series sales prediction',
      version: '2.0.0',
      framework: 'tensorflow',
      modelType: 'time-series',
      stage: 'staging',
      projectId: '6',
      projectName: 'Time Series Forecasting',
      tags: ['time-series', 'lstm', 'forecasting', 'sales'],
      metrics: {
        mae: 0.045,
        rmse: 0.067
      },
      fileSize: 34200000,
      filePath: '/models/sales-forecaster-v2.0.0.h5',
      createdBy: { id: '6', name: 'Lisa Wang', avatar: 'LW' },
      updatedBy: { id: '7', name: 'Tom Wilson', avatar: 'TW' },
      createdAt: '2024-01-12T16:30:00Z',
      updatedAt: '2024-01-19T13:45:00Z',
      deploymentCount: 1,
      downloadCount: 34,
      isFavorite: false,
      isPublic: false
    },
    {
      id: '6',
      name: 'Customer Segmentation',
      description: 'K-means clustering for customer behavior analysis',
      version: '1.2.0',
      framework: 'scikit-learn',
      modelType: 'classification',
      stage: 'archived',
      projectId: '3',
      projectName: 'Customer Segmentation',
      tags: ['clustering', 'segmentation', 'customer-analysis', 'k-means'],
      metrics: {
        accuracy: 0.768
      },
      fileSize: 2100000,
      filePath: '/models/customer-segmentation-v1.2.0.pkl',
      createdBy: { id: '4', name: 'Emily Davis', avatar: 'ED' },
      updatedBy: { id: '4', name: 'Emily Davis', avatar: 'ED' },
      createdAt: '2024-01-05T09:00:00Z',
      updatedAt: '2024-01-08T15:20:00Z',
      deploymentCount: 0,
      downloadCount: 12,
      isFavorite: false,
      isPublic: true
    }
  ];

  // Filter and sort models
  const filteredModels = useMemo(() => {
    return models
      .filter(model => {
        const matchesSearch = searchQuery === '' || 
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesProject = filters.projects.length === 0 || filters.projects.includes(model.projectId);
        const matchesFramework = filters.frameworks.length === 0 || filters.frameworks.includes(model.framework);
        const matchesType = filters.modelTypes.length === 0 || filters.modelTypes.includes(model.modelType);
        const matchesStage = filters.stages.length === 0 || filters.stages.includes(model.stage);
        const matchesTags = filters.tags.length === 0 || filters.tags.some(tag => model.tags.includes(tag));
        
        return matchesSearch && matchesProject && matchesFramework && matchesType && matchesStage && matchesTags;
      })
      .sort((a, b) => {
        const direction = sortBy.direction === 'asc' ? 1 : -1;
        
        switch (sortBy.field) {
          case 'name':
            return direction * a.name.localeCompare(b.name);
          case 'created':
            return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          case 'updated':
            return direction * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
          case 'performance':
            const aPerf = a.metrics.accuracy || a.metrics.f1Score || a.metrics.mae || 0;
            const bPerf = b.metrics.accuracy || b.metrics.f1Score || b.metrics.mae || 0;
            return direction * (aPerf - bPerf);
          case 'downloads':
            return direction * (a.downloadCount - b.downloadCount);
          case 'deployments':
            return direction * (a.deploymentCount - b.deploymentCount);
          default:
            return 0;
        }
      });
  }, [models, searchQuery, filters, sortBy]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: models.length,
      production: models.filter(m => m.stage === 'production').length,
      staging: models.filter(m => m.stage === 'staging').length,
      development: models.filter(m => m.stage === 'development').length,
      favorites: models.filter(m => m.isFavorite).length,
      totalDeployments: models.reduce((sum, m) => sum + m.deploymentCount, 0)
    };
  }, [models]);

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'tensorflow': return <Cpu className="h-4 w-4 text-orange-600" />;
      case 'pytorch': return <Brain className="h-4 w-4 text-red-600" />;
      case 'scikit-learn': return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'xgboost': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'huggingface': return <MessageSquare className="h-4 w-4 text-yellow-600" />;
      default: return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'computer-vision': return <Camera className="h-4 w-4" />;
      case 'nlp': return <MessageSquare className="h-4 w-4" />;
      case 'time-series': return <Clock className="h-4 w-4" />;
      case 'recommendation': return <Users className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
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

  const getMainMetric = (model: Model) => {
    if (model.metrics.accuracy) return { label: 'Accuracy', value: (model.metrics.accuracy * 100).toFixed(1) + '%' };
    if (model.metrics.f1Score) return { label: 'F1 Score', value: (model.metrics.f1Score * 100).toFixed(1) + '%' };
    if (model.metrics.mae) return { label: 'MAE', value: model.metrics.mae.toFixed(3) };
    if (model.metrics.rmse) return { label: 'RMSE', value: model.metrics.rmse.toFixed(3) };
    return { label: 'Score', value: 'N/A' };
  };

  const toggleFavorite = (modelId: string) => {
    // This would call an API to toggle favorite status
    console.log('Toggle favorite for model:', modelId);
  };

  const handleSort = (field: ModelSort['field']) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: ModelSort['field']) => {
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
            <h1 className="text-3xl font-bold text-gray-900">Model Registry</h1>
            <p className="text-gray-600 mt-1">Centralized repository for all ML models</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Link href="/dashboard/models/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Model
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Models</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.production}</div>
              <p className="text-sm text-gray-600">Production</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.staging}</div>
              <p className="text-sm text-gray-600">Staging</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.development}</div>
              <p className="text-sm text-gray-600">Development</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.favorites}</div>
              <p className="text-sm text-gray-600">Favorites</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.totalDeployments}</div>
              <p className="text-sm text-gray-600">Deployments</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:w-80 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Framework Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Framework</label>
                    <div className="space-y-2">
                      {['tensorflow', 'pytorch', 'scikit-learn', 'xgboost', 'huggingface'].map(framework => (
                        <div key={framework} className="flex items-center space-x-2">
                          <Checkbox
                            id={`framework-${framework}`}
                            checked={filters.frameworks.includes(framework)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                frameworks: checked
                                  ? [...prev.frameworks, framework]
                                  : prev.frameworks.filter(f => f !== framework)
                              }));
                            }}
                          />
                          <label 
                            htmlFor={`framework-${framework}`}
                            className="text-sm text-gray-700 capitalize cursor-pointer"
                          >
                            {framework === 'scikit-learn' ? 'Scikit-learn' : framework}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Model Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Model Type</label>
                    <div className="space-y-2">
                      {['classification', 'regression', 'nlp', 'computer-vision', 'time-series', 'recommendation'].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={filters.modelTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                modelTypes: checked
                                  ? [...prev.modelTypes, type]
                                  : prev.modelTypes.filter(t => t !== type)
                              }));
                            }}
                          />
                          <label 
                            htmlFor={`type-${type}`}
                            className="text-sm text-gray-700 capitalize cursor-pointer"
                          >
                            {type.replace('-', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stage Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Stage</label>
                    <div className="space-y-2">
                      {['development', 'staging', 'production', 'archived'].map(stage => (
                        <div key={stage} className="flex items-center space-x-2">
                          <Checkbox
                            id={`stage-${stage}`}
                            checked={filters.stages.includes(stage)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                stages: checked
                                  ? [...prev.stages, stage]
                                  : prev.stages.filter(s => s !== stage)
                              }));
                            }}
                          />
                          <label 
                            htmlFor={`stage-${stage}`}
                            className="text-sm text-gray-700 capitalize cursor-pointer"
                          >
                            {stage}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Search and View Controls */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search models by name, description, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex border border-gray-300 rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <select
                  value={`${sortBy.field}-${sortBy.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortBy({ field: field as ModelSort['field'], direction: direction as 'asc' | 'desc' });
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="updated-desc">Latest Updated</option>
                  <option value="created-desc">Latest Created</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="performance-desc">Best Performance</option>
                  <option value="downloads-desc">Most Downloads</option>
                  <option value="deployments-desc">Most Deployments</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedModels.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedModels.length} model{selectedModels.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                    <Button size="sm" variant="outline">
                      <Rocket className="h-4 w-4 mr-1" />
                      Deploy
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Models Grid/Table */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredModels.map((model) => {
                  const mainMetric = getMainMetric(model);
                  
                  return (
                    <Card key={model.id} className="hover:shadow-lg transition-shadow duration-200 group">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={selectedModels.includes(model.id)}
                              onCheckedChange={(checked) => {
                                setSelectedModels(prev => 
                                  checked 
                                    ? [...prev, model.id]
                                    : prev.filter(id => id !== model.id)
                                );
                              }}
                            />
                            {getFrameworkIcon(model.framework)}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleFavorite(model.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {model.isFavorite ? 
                                <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
                                <StarOff className="h-4 w-4 text-gray-400" />
                              }
                            </Button>
                          </div>
                        </div>

                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                            {model.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {model.framework}
                            </Badge>
                            <Badge variant="outline" className="text-xs flex items-center">
                              {getModelTypeIcon(model.modelType)}
                              <span className="ml-1">{model.modelType.replace('-', ' ')}</span>
                            </Badge>
                            <Badge className={`text-xs ${getStageColor(model.stage)}`}>
                              {model.stage}
                            </Badge>
                          </div>
                          <CardDescription className="text-sm text-gray-600 line-clamp-2">
                            {model.description}
                          </CardDescription>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Main Metric */}
                        <div className="text-center py-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">{mainMetric.value}</div>
                          <p className="text-sm text-gray-600">{mainMetric.label}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 text-center text-xs">
                          <div>
                            <div className="font-semibold text-gray-900">{model.deploymentCount}</div>
                            <p className="text-gray-600">Deployments</p>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{model.downloadCount}</div>
                            <p className="text-gray-600">Downloads</p>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{formatFileSize(model.fileSize)}</div>
                            <p className="text-gray-600">Size</p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {model.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {model.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{model.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-3 border-t">
                          <div className="flex space-x-1">
                            <Link href={`/dashboard/models/${model.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline">
                              <Play className="h-3 w-3 mr-1" />
                              Deploy
                            </Button>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(model.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-4">
                          <Checkbox
                            checked={selectedModels.length === filteredModels.length}
                            onCheckedChange={(checked) => {
                              setSelectedModels(checked ? filteredModels.map(m => m.id) : []);
                            }}
                          />
                        </th>
                        <th 
                          className="text-left p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Name</span>
                            {getSortIcon('name')}
                          </div>
                        </th>
                        <th className="text-left p-4">Framework</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Stage</th>
                        <th 
                          className="text-left p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('performance')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Performance</span>
                            {getSortIcon('performance')}
                          </div>
                        </th>
                        <th 
                          className="text-left p-4 cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('updated')}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Last Updated</span>
                            {getSortIcon('updated')}
                          </div>
                        </th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModels.map((model) => {
                        const mainMetric = getMainMetric(model);
                        
                        return (
                          <tr key={model.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-4">
                              <Checkbox
                                checked={selectedModels.includes(model.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedModels(prev => 
                                    checked 
                                      ? [...prev, model.id]
                                      : prev.filter(id => id !== model.id)
                                  );
                                }}
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                {getFrameworkIcon(model.framework)}
                                <div>
                                  <div className="font-medium text-gray-900">{model.name}</div>
                                  <div className="text-sm text-gray-500">v{model.version}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline" className="capitalize">
                                {model.framework}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1">
                                {getModelTypeIcon(model.modelType)}
                                <span className="text-sm capitalize">
                                  {model.modelType.replace('-', ' ')}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={getStageColor(model.stage)}>
                                {model.stage}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{mainMetric.value}</div>
                                <div className="text-sm text-gray-500">{mainMetric.label}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="text-sm">{new Date(model.updatedAt).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">by {model.updatedBy.name}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-1">
                                <Link href={`/dashboard/models/${model.id}`}>
                                  <Button size="sm" variant="ghost">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => toggleFavorite(model.id)}
                                >
                                  {model.isFavorite ? 
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" /> : 
                                    <StarOff className="h-4 w-4" />
                                  }
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Empty State */}
            {filteredModels.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Database className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || Object.values(filters).some(f => f.length > 0) ? 'No models found' : 'No models yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery || Object.values(filters).some(f => f.length > 0) 
                    ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                    : 'Get started by uploading your first model to the registry.'
                  }
                </p>
                {!searchQuery && !Object.values(filters).some(f => f.length > 0) && (
                  <Link href="/dashboard/models/upload">
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Model
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {filteredModels.length > 24 && (
              <div className="flex items-center justify-between pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Showing {Math.min(24, filteredModels.length)} of {filteredModels.length} models
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
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ModelsPage() {
  return (
    <ProtectedRoute>
      <ModelsContent />
    </ProtectedRoute>
  );
}
