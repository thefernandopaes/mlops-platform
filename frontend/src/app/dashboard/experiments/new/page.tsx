
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, X, Play, Clock, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import DashboardLayout from '@/components/dashboard/layout';
import ProtectedRoute from '@/components/auth/protected-route';

interface Parameter {
  id: string;
  name: string;
  type: 'float' | 'int' | 'categorical' | 'boolean';
  min?: number;
  max?: number;
  values?: string[];
  distribution: 'uniform' | 'log-uniform' | 'normal';
}

interface ExperimentFormData {
  name: string;
  description: string;
  projectId: string;
  modelId: string;
  tags: string[];
  framework: string;
  parameters: Parameter[];
  primaryMetric: string;
  secondaryMetrics: string[];
  earlyStopping: {
    enabled: boolean;
    metric: string;
    patience: number;
    minDelta: number;
  };
  maxRuntime: number;
  cpuLimit: number;
  memoryLimit: number;
  trainingDataset: string;
  validationDataset: string;
  testDataset: string;
  preprocessingPipeline: string;
  numberOfRuns: number;
  parallelRuns: number;
  environment: 'development' | 'staging';
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    onCompletion: boolean;
  };
}

function CreateExperimentContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('basic');
  const [newTag, setNewTag] = useState('');
  const [newParameter, setNewParameter] = useState<Partial<Parameter>>({
    name: '',
    type: 'float',
    distribution: 'uniform'
  });
  const [newMetric, setNewMetric] = useState('');

  const [formData, setFormData] = useState<ExperimentFormData>({
    name: '',
    description: '',
    projectId: '',
    modelId: '',
    tags: [],
    framework: 'scikit-learn',
    parameters: [],
    primaryMetric: 'accuracy',
    secondaryMetrics: [],
    earlyStopping: {
      enabled: false,
      metric: 'val_loss',
      patience: 10,
      minDelta: 0.001
    },
    maxRuntime: 3600,
    cpuLimit: 4,
    memoryLimit: 8,
    trainingDataset: '',
    validationDataset: '',
    testDataset: '',
    preprocessingPipeline: '',
    numberOfRuns: 1,
    parallelRuns: 1,
    environment: 'development',
    notifications: {
      onSuccess: true,
      onFailure: true,
      onCompletion: false
    }
  });

  // Mock data
  const projects = [
    { id: '1', name: 'Customer Analytics' },
    { id: '2', name: 'Fraud Detection' },
    { id: '3', name: 'Recommendation Engine' }
  ];

  const models = [
    { id: '1', name: 'Random Forest Classifier' },
    { id: '2', name: 'XGBoost Regressor' },
    { id: '3', name: 'Neural Network' }
  ];

  const frameworks = [
    'scikit-learn',
    'tensorflow',
    'pytorch',
    'xgboost',
    'lightgbm'
  ];

  const commonMetrics = [
    'accuracy', 'precision', 'recall', 'f1_score', 'auc', 'rmse', 'mae', 'r2'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof ExperimentFormData] as any,
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addParameter = () => {
    if (newParameter.name) {
      const parameter: Parameter = {
        id: Date.now().toString(),
        name: newParameter.name,
        type: newParameter.type || 'float',
        distribution: newParameter.distribution || 'uniform',
        ...(newParameter.min !== undefined && { min: newParameter.min }),
        ...(newParameter.max !== undefined && { max: newParameter.max }),
        ...(newParameter.values && { values: newParameter.values })
      };

      setFormData(prev => ({
        ...prev,
        parameters: [...prev.parameters, parameter]
      }));

      setNewParameter({
        name: '',
        type: 'float',
        distribution: 'uniform'
      });
    }
  };

  const removeParameter = (id: string) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.filter(p => p.id !== id)
    }));
  };

  const addSecondaryMetric = () => {
    if (newMetric && !formData.secondaryMetrics.includes(newMetric)) {
      setFormData(prev => ({
        ...prev,
        secondaryMetrics: [...prev.secondaryMetrics, newMetric]
      }));
      setNewMetric('');
    }
  };

  const removeSecondaryMetric = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      secondaryMetrics: prev.secondaryMetrics.filter(m => m !== metric)
    }));
  };

  const handleSubmit = (action: 'start' | 'schedule' | 'template' | 'validate') => {
    console.log('Creating experiment with action:', action, formData);
    // TODO: Implement API call
    router.push('/dashboard/experiments');
  };

  const steps = [
    { id: 'basic', label: 'Basic Info', icon: '1' },
    { id: 'config', label: 'Configuration', icon: '2' },
    { id: 'data', label: 'Data', icon: '3' },
    { id: 'execution', label: 'Execution', icon: '4' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/experiments">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Experiments
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Create New Experiment</h1>
              <p className="text-gray-600">Set up and configure your ML experiment</p>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <Button
                variant={currentStep === step.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(step.id)}
                className="mr-2"
              >
                {step.icon}
              </Button>
              <span className={`text-sm ${currentStep === step.id ? 'font-medium' : 'text-gray-600'}`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-300 mx-4" />
              )}
            </div>
          ))}
        </div>

        <Tabs value={currentStep} onValueChange={setCurrentStep}>
          {/* Basic Information */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Experiment Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Hyperparameter Tuning v3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Project *</Label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => handleInputChange('projectId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                    placeholder="Describe your experiment goals and methodology..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Associated Model (Optional)</Label>
                  <select
                    value={formData.modelId}
                    onChange={(e) => handleInputChange('modelId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select model</option>
                    {models.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag"
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration */}
          <TabsContent value="config">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Framework & Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Framework</Label>
                    <select
                      value={formData.framework}
                      onChange={(e) => handleInputChange('framework', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {frameworks.map(framework => (
                        <option key={framework} value={framework}>{framework}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <Label>Hyperparameter Grid</Label>
                    
                    {/* Existing Parameters */}
                    {formData.parameters.map(param => (
                      <div key={param.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium">{param.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({param.type})</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {param.type === 'categorical' ? 
                            `Values: ${param.values?.join(', ')}` :
                            `Range: ${param.min} - ${param.max}`
                          }
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeParameter(param.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {/* Add New Parameter */}
                    <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50">
                      <Input
                        placeholder="Parameter name"
                        value={newParameter.name}
                        onChange={(e) => setNewParameter(prev => ({...prev, name: e.target.value}))}
                      />
                      <select
                        value={newParameter.type}
                        onChange={(e) => setNewParameter(prev => ({...prev, type: e.target.value as any}))}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="float">Float</option>
                        <option value="int">Integer</option>
                        <option value="categorical">Categorical</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      {newParameter.type !== 'categorical' && newParameter.type !== 'boolean' && (
                        <>
                          <Input
                            placeholder="Min"
                            type="number"
                            value={newParameter.min || ''}
                            onChange={(e) => setNewParameter(prev => ({...prev, min: parseFloat(e.target.value)}))}
                          />
                          <Input
                            placeholder="Max"
                            type="number"
                            value={newParameter.max || ''}
                            onChange={(e) => setNewParameter(prev => ({...prev, max: parseFloat(e.target.value)}))}
                          />
                        </>
                      )}
                      {newParameter.type === 'categorical' && (
                        <Input
                          placeholder="Values (comma-separated)"
                          value={newParameter.values?.join(',') || ''}
                          onChange={(e) => setNewParameter(prev => ({...prev, values: e.target.value.split(',')}))}
                          className="col-span-2"
                        />
                      )}
                      {newParameter.type === 'boolean' && (
                        <div className="col-span-2 flex items-center text-sm text-gray-600">
                          Boolean (true/false)
                        </div>
                      )}
                      <Button onClick={addParameter} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Objective Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Primary Metric</Label>
                    <select
                      value={formData.primaryMetric}
                      onChange={(e) => handleInputChange('primaryMetric', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {commonMetrics.map(metric => (
                        <option key={metric} value={metric}>{metric}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Secondary Metrics</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.secondaryMetrics.map(metric => (
                        <Badge key={metric} variant="secondary" className="flex items-center gap-1">
                          {metric}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => removeSecondaryMetric(metric)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={newMetric}
                        onChange={(e) => setNewMetric(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select metric</option>
                        {commonMetrics.filter(m => !formData.secondaryMetrics.includes(m) && m !== formData.primaryMetric)
                          .map(metric => (
                            <option key={metric} value={metric}>{metric}</option>
                          ))}
                      </select>
                      <Button onClick={addSecondaryMetric} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Early Stopping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.earlyStopping.enabled}
                      onCheckedChange={(checked) => 
                        handleNestedInputChange('earlyStopping', 'enabled', checked)
                      }
                    />
                    <Label>Enable early stopping</Label>
                  </div>

                  {formData.earlyStopping.enabled && (
                    <div className="grid grid-cols-3 gap-4 pl-6">
                      <div className="space-y-2">
                        <Label>Metric</Label>
                        <Input
                          value={formData.earlyStopping.metric}
                          onChange={(e) => handleNestedInputChange('earlyStopping', 'metric', e.target.value)}
                          placeholder="val_loss"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Patience</Label>
                        <Input
                          type="number"
                          value={formData.earlyStopping.patience}
                          onChange={(e) => handleNestedInputChange('earlyStopping', 'patience', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Delta</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={formData.earlyStopping.minDelta}
                          onChange={(e) => handleNestedInputChange('earlyStopping', 'minDelta', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Configuration */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Training Dataset *</Label>
                    <Input
                      value={formData.trainingDataset}
                      onChange={(e) => handleInputChange('trainingDataset', e.target.value)}
                      placeholder="path/to/train.csv or data source"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Validation Dataset</Label>
                    <Input
                      value={formData.validationDataset}
                      onChange={(e) => handleInputChange('validationDataset', e.target.value)}
                      placeholder="path/to/validation.csv"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Test Dataset</Label>
                    <Input
                      value={formData.testDataset}
                      onChange={(e) => handleInputChange('testDataset', e.target.value)}
                      placeholder="path/to/test.csv"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preprocessing Pipeline</Label>
                    <Input
                      value={formData.preprocessingPipeline}
                      onChange={(e) => handleInputChange('preprocessingPipeline', e.target.value)}
                      placeholder="preprocessing_config.json"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Data Processing Notes</Label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-20"
                    placeholder="Describe any special data preprocessing requirements..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Execution Settings */}
          <TabsContent value="execution">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Execution Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Number of Runs</Label>
                      <Input
                        type="number"
                        value={formData.numberOfRuns}
                        onChange={(e) => handleInputChange('numberOfRuns', parseInt(e.target.value))}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Parallel Runs</Label>
                      <Input
                        type="number"
                        value={formData.parallelRuns}
                        onChange={(e) => handleInputChange('parallelRuns', parseInt(e.target.value))}
                        min="1"
                        max={formData.numberOfRuns}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Environment</Label>
                      <select
                        value={formData.environment}
                        onChange={(e) => handleInputChange('environment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Max Runtime (seconds)</Label>
                      <Input
                        type="number"
                        value={formData.maxRuntime}
                        onChange={(e) => handleInputChange('maxRuntime', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CPU Limit</Label>
                      <Input
                        type="number"
                        value={formData.cpuLimit}
                        onChange={(e) => handleInputChange('cpuLimit', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Memory Limit (GB)</Label>
                      <Input
                        type="number"
                        value={formData.memoryLimit}
                        onChange={(e) => handleInputChange('memoryLimit', parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.notifications.onSuccess}
                      onCheckedChange={(checked) => 
                        handleNestedInputChange('notifications', 'onSuccess', checked)
                      }
                    />
                    <Label>Notify on successful completion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.notifications.onFailure}
                      onCheckedChange={(checked) => 
                        handleNestedInputChange('notifications', 'onFailure', checked)
                      }
                    />
                    <Label>Notify on failure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.notifications.onCompletion}
                      onCheckedChange={(checked) => 
                        handleNestedInputChange('notifications', 'onCompletion', checked)
                      }
                    />
                    <Label>Notify on any completion</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit('template')}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSubmit('validate')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Validate Config
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => handleSubmit('schedule')}
            >
              <Clock className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Button onClick={() => handleSubmit('start')}>
              <Play className="mr-2 h-4 w-4" />
              Start Experiment
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CreateExperimentPage() {
  return (
    <ProtectedRoute>
      <CreateExperimentContent />
    </ProtectedRoute>
  );
}
