
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  ArrowRight, 
  ArrowLeft,
  Check,
  ChevronRight,
  Settings,
  Server,
  Globe,
  Shield,
  DollarSign,
  Clock,
  TestTube,
  FileText,
  Database,
  Cpu,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  Code,
  Package,
  Play,
  Calendar,
  Save,
  Eye,
  Zap,
  Users,
  Lock,
  Monitor,
  BarChart3,
  Target
} from 'lucide-react';
import { Model } from '@/types/model';

interface DeploymentForm {
  // Step 1: Model Selection
  selectedModel: Model | null;
  selectedVersion: string;
  
  // Step 2: Environment Configuration
  deploymentName: string;
  description: string;
  environment: 'development' | 'staging' | 'production';
  instanceType: 'cpu-small' | 'cpu-medium' | 'cpu-large' | 'gpu-small' | 'gpu-large';
  minInstances: number;
  maxInstances: number;
  autoScaling: boolean;
  endpointUrl: string;
  environmentVariables: Record<string, string>;
  
  // Step 3: Deployment Configuration
  baseImage: string;
  healthCheckPath: string;
  startupTimeoutSeconds: number;
  enableMonitoring: boolean;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warning' | 'error';
  
  // Step 4: Review
  scheduleDeployment: boolean;
  scheduledAt: string;
  testDeployment: boolean;
}

const initialForm: DeploymentForm = {
  selectedModel: null,
  selectedVersion: '',
  deploymentName: '',
  description: '',
  environment: 'development',
  instanceType: 'cpu-medium',
  minInstances: 1,
  maxInstances: 5,
  autoScaling: true,
  endpointUrl: '',
  environmentVariables: {},
  baseImage: 'python:3.11-slim',
  healthCheckPath: '/health',
  startupTimeoutSeconds: 300,
  enableMonitoring: true,
  enableLogging: true,
  logLevel: 'info',
  scheduleDeployment: false,
  scheduledAt: '',
  testDeployment: false
};

function DeployModelContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<DeploymentForm>(initialForm);
  const [searchQuery, setSearchQuery] = useState('');
  const [newEnvVar, setNewEnvVar] = useState({ key: '', value: '' });
  const [isDeploying, setIsDeploying] = useState(false);

  const totalSteps = 4;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Deployments', href: '/dashboard/deployments' },
    { label: 'Deploy Model' }
  ];

  const steps = [
    { 
      number: 1, 
      title: 'Model Selection', 
      icon: Database,
      description: 'Choose model and version'
    },
    { 
      number: 2, 
      title: 'Environment', 
      icon: Settings,
      description: 'Configure deployment environment'
    },
    { 
      number: 3, 
      title: 'Configuration', 
      icon: Code,
      description: 'Set container and monitoring options'
    },
    { 
      number: 4, 
      title: 'Review & Deploy', 
      icon: Play,
      description: 'Review and deploy your model'
    }
  ];

  // Mock models data
  const models: Model[] = [
    {
      id: '1',
      name: 'XGBoost Fraud Classifier',
      description: 'High-performance fraud detection model using XGBoost with 95% accuracy',
      version: '1.2.3',
      framework: 'xgboost',
      modelType: 'classification',
      stage: 'production',
      projectId: '1',
      projectName: 'Fraud Detection',
      tags: ['fraud', 'classification', 'production'],
      metrics: { accuracy: 0.95, precision: 0.93, recall: 0.92, f1Score: 0.925 },
      fileSize: 45231680,
      filePath: '/models/fraud-classifier-v1.2.3.pkl',
      createdBy: { id: '1', name: 'John Doe' },
      updatedBy: { id: '1', name: 'John Doe' },
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      deploymentCount: 3,
      downloadCount: 145,
      isFavorite: true,
      isPublic: false
    },
    {
      id: '2',
      name: 'BERT Sentiment Analyzer',
      description: 'Fine-tuned BERT model for sentiment analysis with multi-language support',
      version: '2.1.0',
      framework: 'huggingface',
      modelType: 'nlp',
      stage: 'staging',
      projectId: '2',
      projectName: 'NLP Pipeline',
      tags: ['nlp', 'sentiment', 'bert'],
      metrics: { accuracy: 0.88, f1Score: 0.87 },
      fileSize: 438291456,
      filePath: '/models/bert-sentiment-v2.1.0',
      createdBy: { id: '2', name: 'Sarah Chen' },
      updatedBy: { id: '2', name: 'Sarah Chen' },
      createdAt: '2024-01-12T09:00:00Z',
      updatedAt: '2024-01-18T11:20:00Z',
      deploymentCount: 1,
      downloadCount: 89,
      isFavorite: false,
      isPublic: true
    },
    {
      id: '3',
      name: 'ResNet Image Classifier',
      description: 'Computer vision model for product image classification',
      version: '3.0.1',
      framework: 'pytorch',
      modelType: 'computer-vision',
      stage: 'development',
      projectId: '3',
      projectName: 'Image Recognition',
      tags: ['computer-vision', 'classification', 'resnet'],
      metrics: { accuracy: 0.91, precision: 0.89 },
      fileSize: 102400000,
      filePath: '/models/resnet-classifier-v3.0.1.pth',
      createdBy: { id: '3', name: 'Mike Johnson' },
      updatedBy: { id: '3', name: 'Mike Johnson' },
      createdAt: '2024-01-10T15:30:00Z',
      updatedAt: '2024-01-22T08:45:00Z',
      deploymentCount: 0,
      downloadCount: 34,
      isFavorite: false,
      isPublic: false
    }
  ];

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getFrameworkBadge = (framework: string) => {
    const colors = {
      'scikit-learn': 'bg-orange-100 text-orange-800',
      'tensorflow': 'bg-blue-100 text-blue-800',
      'pytorch': 'bg-red-100 text-red-800',
      'xgboost': 'bg-green-100 text-green-800',
      'huggingface': 'bg-purple-100 text-purple-800',
      'onnx': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[framework as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {framework}
      </Badge>
    );
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'production':
        return <Badge className="bg-green-100 text-green-800">Production</Badge>;
      case 'staging':
        return <Badge className="bg-yellow-100 text-yellow-800">Staging</Badge>;
      case 'development':
        return <Badge className="bg-blue-100 text-blue-800">Development</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{stage}</Badge>;
    }
  };

  const getEnvironmentBadge = (environment: string) => {
    switch (environment) {
      case 'production':
        return <Badge className="bg-red-100 text-red-800">Production</Badge>;
      case 'staging':
        return <Badge className="bg-yellow-100 text-yellow-800">Staging</Badge>;
      case 'development':
        return <Badge className="bg-blue-100 text-blue-800">Development</Badge>;
      default:
        return <Badge variant="outline">{environment}</Badge>;
    }
  };

  const getInstanceTypeInfo = (type: string) => {
    const types = {
      'cpu-small': { name: 'CPU Small', cpu: '1 vCPU', memory: '2 GB', cost: '$0.05/hour' },
      'cpu-medium': { name: 'CPU Medium', cpu: '2 vCPU', memory: '4 GB', cost: '$0.10/hour' },
      'cpu-large': { name: 'CPU Large', cpu: '4 vCPU', memory: '8 GB', cost: '$0.20/hour' },
      'gpu-small': { name: 'GPU Small', cpu: '2 vCPU + GPU', memory: '8 GB', cost: '$0.50/hour' },
      'gpu-large': { name: 'GPU Large', cpu: '4 vCPU + GPU', memory: '16 GB', cost: '$1.00/hour' }
    };
    return types[type as keyof typeof types];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateEndpointUrl = (name: string, environment: string) => {
    const baseUrl = environment === 'production' 
      ? 'https://api.company.com' 
      : `https://api-${environment}.company.com`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${baseUrl}/${slug}/predict`;
  };

  const handleModelSelect = (model: Model) => {
    setForm(prev => ({
      ...prev,
      selectedModel: model,
      selectedVersion: model.version,
      deploymentName: `${model.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${form.environment}`,
      endpointUrl: generateEndpointUrl(model.name, form.environment)
    }));
  };

  const handleEnvironmentChange = (environment: 'development' | 'staging' | 'production') => {
    setForm(prev => ({
      ...prev,
      environment,
      endpointUrl: prev.selectedModel 
        ? generateEndpointUrl(prev.selectedModel.name, environment)
        : ''
    }));
  };

  const addEnvironmentVariable = () => {
    if (newEnvVar.key && newEnvVar.value) {
      setForm(prev => ({
        ...prev,
        environmentVariables: {
          ...prev.environmentVariables,
          [newEnvVar.key]: newEnvVar.value
        }
      }));
      setNewEnvVar({ key: '', value: '' });
    }
  };

  const removeEnvironmentVariable = (key: string) => {
    setForm(prev => {
      const newVars = { ...prev.environmentVariables };
      delete newVars[key];
      return { ...prev, environmentVariables: newVars };
    });
  };

  const calculateEstimatedCost = () => {
    const instanceInfo = getInstanceTypeInfo(form.instanceType);
    const hourlyRate = parseFloat(instanceInfo.cost.replace('$', '').replace('/hour', ''));
    const avgInstances = (form.minInstances + form.maxInstances) / 2;
    const monthlyCost = hourlyRate * avgInstances * 24 * 30;
    return monthlyCost.toFixed(2);
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return form.selectedModel && form.selectedVersion;
      case 2:
        return form.deploymentName && form.environment;
      case 3:
        return form.baseImage && form.healthCheckPath;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    // Simulate deployment
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsDeploying(false);
    router.push('/dashboard/deployments');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Search */}
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

            {/* Model Selection */}
            <div className="grid gap-4">
              {filteredModels.map((model) => (
                <Card 
                  key={model.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    form.selectedModel?.id === model.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleModelSelect(model)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                          <Badge variant="outline">v{model.version}</Badge>
                          {getFrameworkBadge(model.framework)}
                          {getStageBadge(model.stage)}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{model.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="text-sm">
                            <span className="text-gray-500">Accuracy:</span>
                            <span className="ml-2 font-medium">{(model.metrics.accuracy || 0 * 100).toFixed(1)}%</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Size:</span>
                            <span className="ml-2 font-medium">{formatFileSize(model.fileSize)}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Deployments:</span>
                            <span className="ml-2 font-medium">{model.deploymentCount}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Downloads:</span>
                            <span className="ml-2 font-medium">{model.downloadCount}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {model.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {form.selectedModel?.id === model.id && (
                        <CheckCircle className="h-6 w-6 text-blue-500 ml-4" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Model Compatibility Check */}
            {form.selectedModel && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900">Model Ready for Deployment</h4>
                      <p className="text-sm text-green-700">
                        This model is compatible with our deployment infrastructure and has passed all validation checks.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Basic Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Basic Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deploymentName">Deployment Name</Label>
                    <Input
                      id="deploymentName"
                      value={form.deploymentName}
                      onChange={(e) => setForm(prev => ({ ...prev, deploymentName: e.target.value }))}
                      placeholder="my-model-deployment"
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <select
                      id="environment"
                      value={form.environment}
                      onChange={(e) => handleEnvironmentChange(e.target.value as any)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="development">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this deployment..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resource Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>Resource Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Instance Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {['cpu-small', 'cpu-medium', 'cpu-large', 'gpu-small', 'gpu-large'].map((type) => {
                      const info = getInstanceTypeInfo(type);
                      return (
                        <div
                          key={type}
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            form.instanceType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                          }`}
                          onClick={() => setForm(prev => ({ ...prev, instanceType: type as any }))}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{info.name}</h4>
                            {form.instanceType === type && <Check className="h-4 w-4 text-blue-500" />}
                          </div>
                          <p className="text-sm text-gray-600">{info.cpu}, {info.memory}</p>
                          <p className="text-sm font-medium text-green-600">{info.cost}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="minInstances">Min Instances</Label>
                    <Input
                      id="minInstances"
                      type="number"
                      min="1"
                      value={form.minInstances}
                      onChange={(e) => setForm(prev => ({ ...prev, minInstances: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxInstances">Max Instances</Label>
                    <Input
                      id="maxInstances"
                      type="number"
                      min="1"
                      value={form.maxInstances}
                      onChange={(e) => setForm(prev => ({ ...prev, maxInstances: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="autoScaling"
                      checked={form.autoScaling}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, autoScaling: !!checked }))}
                    />
                    <Label htmlFor="autoScaling">Enable Auto-scaling</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Network Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Network Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="endpointUrl">Endpoint URL</Label>
                  <Input
                    id="endpointUrl"
                    value={form.endpointUrl}
                    onChange={(e) => setForm(prev => ({ ...prev, endpointUrl: e.target.value }))}
                    placeholder="https://api.company.com/my-model/predict"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This URL will be used to access your deployed model
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Environment Variables */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="h-5 w-5" />
                  <span>Environment Variables</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    placeholder="Key"
                    value={newEnvVar.key}
                    onChange={(e) => setNewEnvVar(prev => ({ ...prev, key: e.target.value }))}
                  />
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Value"
                      value={newEnvVar.value}
                      onChange={(e) => setNewEnvVar(prev => ({ ...prev, value: e.target.value }))}
                    />
                    <Button onClick={addEnvironmentVariable} size="sm">
                      Add
                    </Button>
                  </div>
                </div>
                
                {Object.entries(form.environmentVariables).length > 0 && (
                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-2">Environment Variables</h4>
                    <div className="space-y-2">
                      {Object.entries(form.environmentVariables).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{key} = {value}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeEnvironmentVariable(key)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Container Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Container Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="baseImage">Base Image</Label>
                    <select
                      id="baseImage"
                      value={form.baseImage}
                      onChange={(e) => setForm(prev => ({ ...prev, baseImage: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="python:3.11-slim">Python 3.11 Slim</option>
                      <option value="python:3.10-slim">Python 3.10 Slim</option>
                      <option value="tensorflow/tensorflow:latest">TensorFlow Latest</option>
                      <option value="pytorch/pytorch:latest">PyTorch Latest</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="healthCheckPath">Health Check Path</Label>
                    <Input
                      id="healthCheckPath"
                      value={form.healthCheckPath}
                      onChange={(e) => setForm(prev => ({ ...prev, healthCheckPath: e.target.value }))}
                      placeholder="/health"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="startupTimeout">Startup Timeout (seconds)</Label>
                  <Input
                    id="startupTimeout"
                    type="number"
                    value={form.startupTimeoutSeconds}
                    onChange={(e) => setForm(prev => ({ ...prev, startupTimeoutSeconds: parseInt(e.target.value) }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Monitoring Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Monitoring & Logging</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableMonitoring"
                        checked={form.enableMonitoring}
                        onCheckedChange={(checked) => setForm(prev => ({ ...prev, enableMonitoring: !!checked }))}
                      />
                      <Label htmlFor="enableMonitoring">Enable Performance Monitoring</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableLogging"
                        checked={form.enableLogging}
                        onCheckedChange={(checked) => setForm(prev => ({ ...prev, enableLogging: !!checked }))}
                      />
                      <Label htmlFor="enableLogging">Enable Application Logging</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="logLevel">Log Level</Label>
                    <select
                      id="logLevel"
                      value={form.logLevel}
                      onChange={(e) => setForm(prev => ({ ...prev, logLevel: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      disabled={!form.enableLogging}
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Deployment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Deployment Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Model Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span>{form.selectedModel?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Version:</span>
                        <span>v{form.selectedVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Framework:</span>
                        <span>{form.selectedModel?.framework}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span>{form.selectedModel ? formatFileSize(form.selectedModel.fileSize) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Deployment Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span>{form.deploymentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Environment:</span>
                        <span>{getEnvironmentBadge(form.environment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Instance Type:</span>
                        <span>{getInstanceTypeInfo(form.instanceType).name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Scaling:</span>
                        <span>{form.minInstances}-{form.maxInstances} instances</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Estimation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Cost Estimation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">Estimated Monthly Cost</h4>
                      <p className="text-sm text-blue-700">
                        Based on {form.minInstances}-{form.maxInstances} instances of {getInstanceTypeInfo(form.instanceType).name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-900">${calculateEstimatedCost()}</div>
                      <div className="text-sm text-blue-700">per month</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deployment Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Deployment Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="testDeployment"
                    checked={form.testDeployment}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, testDeployment: !!checked }))}
                  />
                  <Label htmlFor="testDeployment">Test deployment before going live</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="scheduleDeployment"
                    checked={form.scheduleDeployment}
                    onCheckedChange={(checked) => setForm(prev => ({ ...prev, scheduleDeployment: !!checked }))}
                  />
                  <Label htmlFor="scheduleDeployment">Schedule deployment for later</Label>
                </div>
                
                {form.scheduleDeployment && (
                  <div className="ml-6">
                    <Label htmlFor="scheduledAt">Scheduled Time</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={(e) => setForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deploy Model</h1>
          <p className="text-gray-600 mt-1">Deploy your ML model to production environments</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                  ${currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                  }
                `}>
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                
                <div className="ml-4 min-w-0">
                  <h3 className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-400 mx-8" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex space-x-3">
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceedToNext()}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleDeploy}
                disabled={!canProceedToNext() || isDeploying}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isDeploying ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Deploy Model
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DeployModelPage() {
  return (
    <ProtectedRoute>
      <DeployModelContent />
    </ProtectedRoute>
  );
}
