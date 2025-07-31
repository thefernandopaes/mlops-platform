
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Settings,
  Scale,
  RotateCcw,
  PowerOff,
  ExternalLink,
  Copy,
  Activity,
  Cpu,
  HardDrive,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  Globe,
  Server,
  Monitor,
  FileText,
  History,
  Search,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Database,
  Network,
  Shield,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  AlertCircle,
  Play,
  Pause,
  Square
} from 'lucide-react';
import Link from 'next/link';
import { 
  Deployment, 
  DeploymentMetrics, 
  DeploymentLog, 
  DeploymentAlert, 
  DeploymentHistory,
  DeploymentConfiguration 
} from '@/types/deployment';

function DeploymentDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const deploymentId = params.id as string;
  
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [logSearch, setLogSearch] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [config, setConfig] = useState<DeploymentConfiguration | null>(null);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockDeployment: Deployment = {
        id: deploymentId,
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
      };
      
      setDeployment(mockDeployment);
      setConfig({
        environmentVariables: {
          'MODEL_THRESHOLD': '0.85',
          'MAX_BATCH_SIZE': '100',
          'LOG_LEVEL': 'INFO'
        },
        scalingPolicy: {
          minInstances: 2,
          maxInstances: 10,
          targetCpuUtilization: 70,
          targetMemoryUtilization: 80,
          autoScaling: true
        },
        healthCheck: {
          path: '/health',
          interval: 30,
          timeout: 10,
          retries: 3
        },
        networking: {
          port: 8080,
          protocol: 'HTTP',
          allowedOrigins: ['*']
        },
        resources: {
          cpu: '500m',
          memory: '1Gi'
        }
      });
      setIsLoading(false);
    }, 1000);
  }, [deploymentId]);

  const metrics: DeploymentMetrics = {
    requestRate: 1247,
    errorRate: 0.2,
    avgLatency: 145,
    p95Latency: 320,
    p99Latency: 580,
    throughput: 1180,
    concurrentUsers: 45,
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 34,
    networkIn: 2.4,
    networkOut: 1.8
  };

  const logs: DeploymentLog[] = [
    {
      id: '1',
      timestamp: '2024-01-22T10:30:15Z',
      level: 'info',
      source: 'app',
      message: 'Processing batch prediction request with 50 instances'
    },
    {
      id: '2',
      timestamp: '2024-01-22T10:30:12Z',
      level: 'info',
      source: 'health',
      message: 'Health check passed - all systems operational'
    },
    {
      id: '3',
      timestamp: '2024-01-22T10:29:45Z',
      level: 'warn',
      source: 'app',
      message: 'High latency detected on prediction endpoint (250ms)'
    },
    {
      id: '4',
      timestamp: '2024-01-22T10:29:30Z',
      level: 'error',
      source: 'app',
      message: 'Failed to process request: Invalid input format',
      metadata: { requestId: 'req_123', userId: 'user_456' }
    },
    {
      id: '5',
      timestamp: '2024-01-22T10:29:15Z',
      level: 'info',
      source: 'scaling',
      message: 'Auto-scaling triggered: scaling up to 4 instances'
    }
  ];

  const alerts: DeploymentAlert[] = [
    {
      id: '1',
      type: 'performance',
      severity: 'medium',
      title: 'High Latency Detected',
      description: 'Average response time exceeded 200ms threshold',
      timestamp: '2024-01-22T10:25:00Z',
      status: 'active'
    },
    {
      id: '2',
      type: 'resource',
      severity: 'low',
      title: 'Memory Usage Elevated',
      description: 'Memory usage is at 75% of allocated resources',
      timestamp: '2024-01-22T09:45:00Z',
      status: 'acknowledged',
      acknowledgedBy: 'Sarah Chen'
    }
  ];

  const history: DeploymentHistory[] = [
    {
      id: '1',
      action: 'scale',
      description: 'Scaled from 2 to 3 instances due to increased load',
      timestamp: '2024-01-22T09:15:00Z',
      performedBy: 'Auto-scaling',
      status: 'success'
    },
    {
      id: '2',
      action: 'update',
      description: 'Updated environment variable MODEL_THRESHOLD to 0.85',
      timestamp: '2024-01-22T08:30:00Z',
      performedBy: 'John Doe',
      status: 'success'
    },
    {
      id: '3',
      action: 'deploy',
      description: 'Deployed model version 1.2.3 to production',
      timestamp: '2024-01-20T14:30:00Z',
      performedBy: 'John Doe',
      status: 'success'
    }
  ];

  if (isLoading || !deployment) {
    return (
      <ProtectedRoute>
        <DashboardLayout breadcrumbs={[]}>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Deployments', href: '/dashboard/deployments' },
    { label: deployment.name }
  ];

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
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">Healthy</span>
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-700 font-medium">Warning</span>
          </div>
        );
      case 'critical':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-700 font-medium">Critical</span>
          </div>
        );
      default:
        return <span className="text-gray-500">{health}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.source.toLowerCase().includes(logSearch.toLowerCase());
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
            <div className="flex items-start space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{deployment.name}</h1>
                  {getStatusBadge(deployment.status)}
                  {getHealthBadge(deployment.health)}
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Model: {deployment.model.name} v{deployment.model.version}</span>
                    <span>Environment: {deployment.environment}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4" />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {deployment.endpoint}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(deployment.endpoint)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(deployment.endpoint, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <User className="h-3 w-3" />
                    <span>Deployed by {deployment.deployedBy}</span>
                    <Clock className="h-3 w-3 ml-4" />
                    <span>Last updated: {formatDate(deployment.lastUpdated)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button size="sm" variant="outline">
                <Scale className="h-4 w-4 mr-2" />
                Scale
              </Button>
              <Button size="sm" variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Restart
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                <PowerOff className="h-4 w-4 mr-2" />
                Terminate
              </Button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Request Rate</p>
                    <p className="text-2xl font-bold text-blue-600">{metrics.requestRate}/hr</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% from last hour
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Latency</p>
                    <p className="text-2xl font-bold text-green-600">{metrics.avgLatency}ms</p>
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +5ms from baseline
                    </p>
                  </div>
                  <Gauge className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-2xl font-bold text-yellow-600">{metrics.errorRate}%</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      -0.1% from yesterday
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Instances</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {deployment.instances.current}/{deployment.instances.max}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Auto-scaling enabled</p>
                  </div>
                  <Server className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Monitor className="h-5 w-5" />
                      <span>Resource Usage</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU Usage</span>
                          <span>{metrics.cpuUsage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${metrics.cpuUsage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memory Usage</span>
                          <span>{metrics.memoryUsage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${metrics.memoryUsage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disk Usage</span>
                          <span>{metrics.diskUsage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ width: `${metrics.diskUsage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Active Alerts</span>
                      <Badge variant="secondary" className="ml-auto">
                        {alerts.filter(a => a.status === 'active').length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {alerts.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No active alerts</p>
                    ) : (
                      <div className="space-y-3">
                        {alerts.slice(0, 3).map((alert) => (
                          <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              alert.severity === 'high' ? 'bg-red-500' :
                              alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{alert.title}</h4>
                              <p className="text-xs text-gray-600">{alert.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(alert.timestamp)}
                              </p>
                            </div>
                            <Badge 
                              variant={alert.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {alert.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5" />
                    <span>Performance Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{metrics.throughput}</div>
                      <div className="text-sm text-gray-600">Requests/hr</div>
                      <div className="text-xs text-green-600 mt-1">↑ 8% vs last week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{metrics.p95Latency}ms</div>
                      <div className="text-sm text-gray-600">95th Percentile</div>
                      <div className="text-xs text-yellow-600 mt-1">↑ 15ms vs baseline</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{deployment.uptime}%</div>
                      <div className="text-sm text-gray-600">Uptime</div>
                      <div className="text-xs text-green-600 mt-1">Target: 99.9%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Request Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Request Rate</span>
                        <span className="font-medium">{metrics.requestRate}/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Rate</span>
                        <span className="font-medium">{metrics.errorRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Latency</span>
                        <span className="font-medium">{metrics.avgLatency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>95th Percentile</span>
                        <span className="font-medium">{metrics.p95Latency}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>99th Percentile</span>
                        <span className="font-medium">{metrics.p99Latency}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>CPU Usage</span>
                        <span className="font-medium">{metrics.cpuUsage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Usage</span>
                        <span className="font-medium">{metrics.memoryUsage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disk Usage</span>
                        <span className="font-medium">{metrics.diskUsage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network In</span>
                        <span className="font-medium">{metrics.networkIn} MB/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network Out</span>
                        <span className="font-medium">{metrics.networkOut} MB/s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Metrics placeholder for charts */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Real-time metrics visualization would be displayed here</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <LineChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Charts and graphs would be rendered here</p>
                      <p className="text-sm">showing request rate, latency, errors over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Application Logs</span>
                    </CardTitle>
                    
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search logs..."
                          value={logSearch}
                          onChange={(e) => setLogSearch(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                      <select 
                        className="border rounded-md px-3 py-2 text-sm"
                        value={logLevel}
                        onChange={(e) => setLogLevel(e.target.value)}
                      >
                        <option value="all">All Levels</option>
                        <option value="error">Error</option>
                        <option value="warn">Warning</option>
                        <option value="info">Info</option>
                        <option value="debug">Debug</option>
                      </select>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredLogs.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                        <Badge 
                          variant={
                            log.level === 'error' ? 'destructive' :
                            log.level === 'warn' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-gray-500 text-xs">{formatDate(log.timestamp)}</span>
                        <span className="text-gray-600 text-xs">[{log.source}]</span>
                        <span className="flex-1">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="configuration" className="space-y-6">
              {config && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Environment Variables</CardTitle>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setIsEditingConfig(!isEditingConfig)}
                        >
                          {isEditingConfig ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(config.environmentVariables).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Label className="w-32 text-sm">{key}</Label>
                            {isEditingConfig ? (
                              <Input value={value} className="flex-1" />
                            ) : (
                              <code className="flex-1 bg-gray-100 px-2 py-1 rounded text-sm">{value}</code>
                            )}
                          </div>
                        ))}
                        {isEditingConfig && (
                          <div className="flex space-x-2 pt-3">
                            <Button size="sm">
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setIsEditingConfig(false)}>
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Scaling Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Min Instances</Label>
                            <p className="font-medium">{config.scalingPolicy.minInstances}</p>
                          </div>
                          <div>
                            <Label className="text-sm">Max Instances</Label>
                            <p className="font-medium">{config.scalingPolicy.maxInstances}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">CPU Target</Label>
                            <p className="font-medium">{config.scalingPolicy.targetCpuUtilization}%</p>
                          </div>
                          <div>
                            <Label className="text-sm">Memory Target</Label>
                            <p className="font-medium">{config.scalingPolicy.targetMemoryUtilization}%</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Auto Scaling</Label>
                          <p className="font-medium">{config.scalingPolicy.autoScaling ? 'Enabled' : 'Disabled'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Health Check</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Health Check Path</Label>
                          <code className="block bg-gray-100 px-2 py-1 rounded text-sm mt-1">
                            {config.healthCheck.path}
                          </code>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm">Interval</Label>
                            <p className="font-medium">{config.healthCheck.interval}s</p>
                          </div>
                          <div>
                            <Label className="text-sm">Timeout</Label>
                            <p className="font-medium">{config.healthCheck.timeout}s</p>
                          </div>
                          <div>
                            <Label className="text-sm">Retries</Label>
                            <p className="font-medium">{config.healthCheck.retries}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">CPU</Label>
                          <p className="font-medium">{config.resources.cpu}</p>
                        </div>
                        <div>
                          <Label className="text-sm">Memory</Label>
                          <p className="font-medium">{config.resources.memory}</p>
                        </div>
                        <div>
                          <Label className="text-sm">Network Port</Label>
                          <p className="font-medium">{config.networking.port}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>Deployment History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          item.status === 'success' ? 'bg-green-500' :
                          item.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {item.action.toUpperCase()}
                            </Badge>
                            <Badge 
                              variant={item.status === 'success' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm">{item.description}</h4>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{formatDate(item.timestamp)}</span>
                            <span>by {item.performedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function DeploymentDetailsPage() {
  return <DeploymentDetailsContent />;
}
