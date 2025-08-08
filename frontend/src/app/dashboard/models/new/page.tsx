
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
  ChevronLeft,
  ChevronRight,
  Upload,
  FileText,
  BarChart3,
  Settings,
  Package,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Plus,
  Download,
  Code,
  Database,
  Brain,
  Camera,
  MessageSquare,
  Clock,
  Users,
  TrendingUp,
  Cpu,
  Play
} from 'lucide-react';
import modelService, { ModelCreateRequest, ModelVersionCreateRequest } from '@/lib/model-service';
import { useAuth } from '@/contexts/auth-context';

interface ModelUploadForm {
  // Step 1 - Basic Information
  name: string;
  description: string;
  projectId: string;
  tags: string[];
  category: string;

  // Step 2 - Model Details
  framework: string;
  modelType: string;
  version: string;
  stage: string;
  file: File | null;

  // Step 3 - Performance Metrics
  metrics: Record<string, number>;
  trainingDetails: {
    datasetInfo: string;
    trainingDuration: string;
    hardwareUsed: string;
    trainingLogs: File | null;
  };

  // Step 4 - Model Schema
  inputSchema: string;
  outputSchema: string;
  exampleInput: string;
  exampleOutput: string;

  // Step 5 - Dependencies
  requirements: string;
  pythonVersion: string;
  systemRequirements: string;
  environmentVariables: Record<string, string>;
  additionalNotes: string;
}

const initialForm: ModelUploadForm = {
  name: '',
  description: '',
  projectId: '',
  tags: [],
  category: '',
  framework: '',
  modelType: '',
  version: '1.0.0',
  stage: 'development',
  file: null,
  metrics: {},
  trainingDetails: {
    datasetInfo: '',
    trainingDuration: '',
    hardwareUsed: '',
    trainingLogs: null
  },
  inputSchema: '',
  outputSchema: '',
  exampleInput: '',
  exampleOutput: '',
  requirements: '',
  pythonVersion: '3.9',
  systemRequirements: '',
  environmentVariables: {},
  additionalNotes: ''
};

function ModelUploadContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<ModelUploadForm>(initialForm);
  const [isDraft, setIsDraft] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [newEnvVar, setNewEnvVar] = useState({ key: '', value: '' });

  const totalSteps = 5;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Model Registry', href: '/dashboard/models' },
    { label: 'Upload Model' }
  ];

  const steps = [
    { 
      number: 1, 
      title: 'Basic Information', 
      icon: FileText,
      description: 'Model name, description, and categorization'
    },
    { 
      number: 2, 
      title: 'Model Details', 
      icon: Settings,
      description: 'Framework, type, version, and file upload'
    },
    { 
      number: 3, 
      title: 'Performance Metrics', 
      icon: BarChart3,
      description: 'Model performance and training details'
    },
    { 
      number: 4, 
      title: 'Model Schema', 
      icon: Code,
      description: 'Input/output schema and examples'
    },
    { 
      number: 5, 
      title: 'Dependencies', 
      icon: Package,
      description: 'Requirements and environment setup'
    }
  ];

  // Mock data
  const mockProjects = [
    { id: '1', name: 'Fraud Detection' },
    { id: '2', name: 'Customer Analytics' },
    { id: '3', name: 'Image Classification' },
    { id: '4', name: 'NLP Sentiment Analysis' }
  ];

  const frameworks = [
    { id: 'scikit-learn', name: 'Scikit-learn', icon: BarChart3 },
    { id: 'tensorflow', name: 'TensorFlow', icon: Cpu },
    { id: 'pytorch', name: 'PyTorch', icon: Brain },
    { id: 'xgboost', name: 'XGBoost', icon: TrendingUp },
    { id: 'huggingface', name: 'Hugging Face', icon: MessageSquare }
  ];

  const modelCategories = [
    { id: 'classification', name: 'Classification', icon: Database },
    { id: 'regression', name: 'Regression', icon: TrendingUp },
    { id: 'nlp', name: 'Natural Language Processing', icon: MessageSquare },
    { id: 'computer-vision', name: 'Computer Vision', icon: Camera },
    { id: 'time-series', name: 'Time Series', icon: Clock },
    { id: 'recommendation', name: 'Recommendation', icon: Users }
  ];

  const getMetricFields = (category: string) => {
    switch (category) {
      case 'classification':
        return ['accuracy', 'precision', 'recall', 'f1Score', 'auc'];
      case 'regression':
        return ['mae', 'mse', 'rmse', 'r2'];
      default:
        return [];
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!form.name) newErrors.name = 'Model name is required';
        if (!form.projectId) newErrors.projectId = 'Project selection is required';
        if (!form.category) newErrors.category = 'Model category is required';
        break;
      case 2:
        if (!form.framework) newErrors.framework = 'Framework selection is required';
        if (!form.modelType) newErrors.modelType = 'Model type is required';
        if (!form.version) newErrors.version = 'Version is required';
        if (!form.file) newErrors.file = 'Model file is required';
        break;
      case 3:
        // Metrics validation is optional
        break;
      case 4:
        // Schema validation is optional but recommended
        break;
      case 5:
        // Dependencies are optional
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    setIsDraft(true);
    // API call to save draft
    console.log('Saving draft...', form);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      if (!user?.organizationId) return;
      try {
        // Create model
        const modelPayload: ModelCreateRequest = {
          organization_id: user.organizationId,
          project_id: form.projectId,
          name: form.name,
          description: form.description || undefined,
          model_type: form.category || form.modelType || 'classification',
          framework: form.framework || 'scikit-learn',
          task_type: undefined,
          tags: form.tags,
          model_metadata: {
            training: form.trainingDetails,
            requirements: form.requirements,
          },
        };
        const created = await modelService.create(modelPayload);

        // Create initial version with placeholder path
        const versionPayload: ModelVersionCreateRequest = {
          version: form.version || '1.0.0',
          stage: (form.stage as any) || 'development',
          model_file_path: `/placeholder/${created.id}/${form.name.replace(/\s+/g, '-').toLowerCase()}.bin`,
          model_size_bytes: form.file?.size,
          requirements: form.requirements || undefined,
          performance_metrics: form.metrics,
          training_metrics: {},
          model_schema: {
            input: form.inputSchema || undefined,
            output: form.outputSchema || undefined,
            example_input: form.exampleInput || undefined,
            example_output: form.exampleOutput || undefined,
          } as any,
          description: undefined,
        };
        await modelService.createVersion(created.id, versionPayload);

        router.push('/dashboard/models');
      } catch (e) {
        console.error('Failed to register model', e);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, field: keyof ModelUploadForm) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, [field]: file }));
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
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
    setForm(prev => ({
      ...prev,
      environmentVariables: Object.fromEntries(
        Object.entries(prev.environmentVariables).filter(([k]) => k !== key)
      )
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-medium">Model Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Customer Churn Predictor"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your model's purpose, methodology, and key features..."
                className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Supports Markdown formatting</p>
            </div>

            <div>
              <Label htmlFor="project" className="text-base font-medium">Project Assignment *</Label>
              <select
                id="project"
                value={form.projectId}
                onChange={(e) => setForm(prev => ({ ...prev, projectId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.projectId ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select a project</option>
                {mockProjects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
              {errors.projectId && <p className="text-sm text-red-500 mt-1">{errors.projectId}</p>}
            </div>

            <div>
              <Label className="text-base font-medium">Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tag and press Enter"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTag(tag)}
                      className="h-4 w-4 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Model Category *</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {modelCategories.map(category => {
                  const Icon = category.icon;
                  return (
                    <div
                      key={category.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        form.category === category.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setForm(prev => ({ ...prev, category: category.id }))}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Framework *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {frameworks.map(framework => {
                  const Icon = framework.icon;
                  return (
                    <div
                      key={framework.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        form.framework === framework.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setForm(prev => ({ ...prev, framework: framework.id }))}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{framework.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {errors.framework && <p className="text-sm text-red-500 mt-1">{errors.framework}</p>}
            </div>

            <div>
              <Label htmlFor="modelType" className="text-base font-medium">Model Type *</Label>
              <Input
                id="modelType"
                value={form.modelType}
                onChange={(e) => setForm(prev => ({ ...prev, modelType: e.target.value }))}
                placeholder="e.g., Random Forest Classifier, LSTM, ResNet50"
                className={errors.modelType ? 'border-red-500' : ''}
              />
              {errors.modelType && <p className="text-sm text-red-500 mt-1">{errors.modelType}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="version" className="text-base font-medium">Version *</Label>
                <Input
                  id="version"
                  value={form.version}
                  onChange={(e) => setForm(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0.0"
                  className={errors.version ? 'border-red-500' : ''}
                />
                {errors.version && <p className="text-sm text-red-500 mt-1">{errors.version}</p>}
              </div>

              <div>
                <Label htmlFor="stage" className="text-base font-medium">Stage</Label>
                <select
                  id="stage"
                  value={form.stage}
                  onChange={(e) => setForm(prev => ({ ...prev, stage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Model File Upload *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {form.file ? (
                  <div className="space-y-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <div>
                      <p className="font-medium">{form.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(form.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium">Drag and drop your model file</p>
                      <p className="text-gray-500">or click to browse</p>
                    </div>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'file')}
                      accept=".pkl,.h5,.pth,.joblib,.onnx,.pb"
                      className="hidden"
                      id="model-file"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('model-file')?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                )}
              </div>
              {errors.file && <p className="text-sm text-red-500 mt-1">{errors.file}</p>}
              <p className="text-sm text-gray-500 mt-2">
                Supported formats: .pkl, .h5, .pth, .joblib, .onnx, .pb
              </p>
            </div>
          </div>
        );

      case 3:
        const metricFields = getMetricFields(form.category);
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
              {metricFields.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {metricFields.map(field => (
                    <div key={field}>
                      <Label htmlFor={field} className="capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Input
                        id={field}
                        type="number"
                        step="0.001"
                        value={form.metrics[field] || ''}
                        onChange={(e) => setForm(prev => ({
                          ...prev,
                          metrics: {
                            ...prev.metrics,
                            [field]: parseFloat(e.target.value) || 0
                          }
                        }))}
                        placeholder="0.000"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">
                    Select a model category in Step 1 to see relevant performance metrics.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Training Details</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="datasetInfo">Dataset Information</Label>
                  <textarea
                    id="datasetInfo"
                    value={form.trainingDetails.datasetInfo}
                    onChange={(e) => setForm(prev => ({
                      ...prev,
                      trainingDetails: {
                        ...prev.trainingDetails,
                        datasetInfo: e.target.value
                      }
                    }))}
                    placeholder="Describe the training dataset, size, features, etc."
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trainingDuration">Training Duration</Label>
                    <Input
                      id="trainingDuration"
                      value={form.trainingDetails.trainingDuration}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        trainingDetails: {
                          ...prev.trainingDetails,
                          trainingDuration: e.target.value
                        }
                      }))}
                      placeholder="e.g., 2 hours, 30 minutes"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hardwareUsed">Hardware Used</Label>
                    <Input
                      id="hardwareUsed"
                      value={form.trainingDetails.hardwareUsed}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        trainingDetails: {
                          ...prev.trainingDetails,
                          hardwareUsed: e.target.value
                        }
                      }))}
                      placeholder="e.g., Tesla V100, 16GB RAM"
                    />
                  </div>
                </div>

                <div>
                  <Label>Training Logs (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, 'trainingLogs')}
                      accept=".txt,.log,.json"
                      className="hidden"
                      id="training-logs"
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('training-logs')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Training Logs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Input/Output Schema</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="inputSchema">Input Schema</Label>
                  <textarea
                    id="inputSchema"
                    value={form.inputSchema}
                    onChange={(e) => setForm(prev => ({ ...prev, inputSchema: e.target.value }))}
                    placeholder={`{
  "type": "object",
  "properties": {
    "age": {"type": "number"},
    "income": {"type": "number"}
  }
}`}
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="outputSchema">Output Schema</Label>
                  <textarea
                    id="outputSchema"
                    value={form.outputSchema}
                    onChange={(e) => setForm(prev => ({ ...prev, outputSchema: e.target.value }))}
                    placeholder={`{
  "type": "object",
  "properties": {
    "prediction": {"type": "number"},
    "confidence": {"type": "number"}
  }
}`}
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Examples</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="exampleInput">Example Input</Label>
                  <textarea
                    id="exampleInput"
                    value={form.exampleInput}
                    onChange={(e) => setForm(prev => ({ ...prev, exampleInput: e.target.value }))}
                    placeholder={`{
  "age": 35,
  "income": 50000
}`}
                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="exampleOutput">Example Output</Label>
                  <textarea
                    id="exampleOutput"
                    value={form.exampleOutput}
                    onChange={(e) => setForm(prev => ({ ...prev, exampleOutput: e.target.value }))}
                    placeholder={`{
  "prediction": 0.85,
  "confidence": 0.92
}`}
                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Schema Validation</h4>
                  <p className="text-sm text-blue-700">
                    Defining clear input/output schemas helps with API documentation and validation.
                    You can test your model with the provided examples.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <textarea
                id="requirements"
                value={form.requirements}
                onChange={(e) => setForm(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder={`scikit-learn==1.3.0
pandas==2.0.3
numpy==1.24.3`}
                className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-1">
                List package dependencies, one per line
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pythonVersion">Python Version</Label>
                <select
                  id="pythonVersion"
                  value={form.pythonVersion}
                  onChange={(e) => setForm(prev => ({ ...prev, pythonVersion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="3.8">Python 3.8</option>
                  <option value="3.9">Python 3.9</option>
                  <option value="3.10">Python 3.10</option>
                  <option value="3.11">Python 3.11</option>
                </select>
              </div>

              <div>
                <Label htmlFor="systemRequirements">System Requirements</Label>
                <Input
                  id="systemRequirements"
                  value={form.systemRequirements}
                  onChange={(e) => setForm(prev => ({ ...prev, systemRequirements: e.target.value }))}
                  placeholder="e.g., 4GB RAM, GPU optional"
                />
              </div>
            </div>

            <div>
              <Label>Environment Variables</Label>
              <div className="space-y-3">
                {Object.entries(form.environmentVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Input value={key} disabled className="flex-1" />
                    <span>=</span>
                    <Input value={value} disabled className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEnvironmentVariable(key)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center space-x-2">
                  <Input
                    value={newEnvVar.key}
                    onChange={(e) => setNewEnvVar(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="Variable name"
                    className="flex-1"
                  />
                  <span>=</span>
                  <Input
                    value={newEnvVar.value}
                    onChange={(e) => setNewEnvVar(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Value"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEnvironmentVariable}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <textarea
                id="additionalNotes"
                value={form.additionalNotes}
                onChange={(e) => setForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any additional setup instructions or notes..."
                className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Model</h1>
          <p className="text-gray-600">Register a new ML model in the platform</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isActive ? 'border-blue-500 bg-blue-500 text-white' : 
                        isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                        'border-gray-300 bg-white text-gray-400'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-gray-400 max-w-24">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-colors
                      ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
              <span>{steps[currentStep - 1].title}</span>
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSaveDraft}
            >
              Save Draft
            </Button>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/models')}
            >
              Cancel
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Upload className="h-4 w-4 mr-2" />
                Register Model
              </Button>
            )}
          </div>
        </div>

        {/* Draft Saved Indicator */}
        {isDraft && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Draft saved successfully</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function ModelUploadPage() {
  return (
    <ProtectedRoute>
      <ModelUploadContent />
    </ProtectedRoute>
  );
}
