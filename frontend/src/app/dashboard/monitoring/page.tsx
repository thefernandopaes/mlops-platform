
'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Server,
  Clock,
  Cpu,
  HardDrive,
  Gauge,
  Search,
  Filter,
  RefreshCw,
  Bell,
  BellOff,
  Eye,
  Settings,
  Download,
  Plus,
  Users,
  Database,
  Zap,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  AlertCircle,
  Info,
  Wifi,
  WifiOff,
  Calendar,
  ExternalLink,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import {
  SystemHealth,
  OverviewMetrics,
  ModelPerformanceCard,
  MonitoringAlert,
  DataQualityMetrics,
  PerformanceAnalytics,
  MonitoringFilters
} from '@/types/monitoring';

function MonitoringDashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetrics | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformanceCard[]>([]);
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [dataQuality, setDataQuality] = useState<DataQualityMetrics | null>(null);
  const [analytics, setAnalytics] = useState<PerformanceAnalytics | null>(null);
  const [filters, setFilters] = useState<MonitoringFilters>({
    timeRange: '24h',
    environment: [],
    status: [],
    severity: [],
    alertType: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Monitoring' }
  ];

  // Mock data - in real app, this would come from API
  useEffect(() => {
    setTimeout(() => {
      setSystemHealth({
        score: 87,
        status: 'healthy',
        lastUpdated: '2024-01-22T10:30:00Z'
      });

      setOverviewMetrics({
        activeDeployments: 12,
        totalAlerts: {
          critical: 1,
          warning: 3,
          info: 5
        },
        overallUptime: 99.7,
        avgResponseTime: 145,
        resourceUtilization: {
          cpu: 67,
          memory: 72,
          storage: 45
        }
      });

      setModelPerformance([
        {
          id: '1',
          name: 'Fraud Detection',
          version: '1.2.3',
          environment: 'production',
          metrics: { accuracy: 94.2, latency: 142, throughput: 1247 },
          status: 'warning',
          trend: 'degrading',
          lastUpdated: '2024-01-22T10:25:00Z'
        },
        {
          id: '2',
          name: 'Credit Scoring',
          version: '2.1.0',
          environment: 'production',
          metrics: { accuracy: 89.7, latency: 98, throughput: 892 },
          status: 'healthy',
          trend: 'stable',
          lastUpdated: '2024-01-22T10:28:00Z'
        },
        {
          id: '3',
          name: 'Price Optimization',
          version: '1.0.4',
          environment: 'staging',
          metrics: { accuracy: 91.5, latency: 203, throughput: 456 },
          status: 'healthy',
          trend: 'improving',
          lastUpdated: '2024-01-22T10:20:00Z'
        }
      ]);

      setAlerts([
        {
          id: '1',
          type: 'performance',
          severity: 'critical',
          title: 'High Error Rate Detected',
          description: 'Fraud Detection model error rate exceeded 5% threshold',
          modelName: 'Fraud Detection',
          deploymentId: 'deploy-1',
          timestamp: '2024-01-22T10:15:00Z',
          status: 'active'
        },
        {
          id: '2',
          type: 'resource',
          severity: 'warning',
          title: 'Memory Usage High',
          description: 'Credit Scoring deployment using 85% of allocated memory',
          modelName: 'Credit Scoring',
          deploymentId: 'deploy-2',
          timestamp: '2024-01-22T09:45:00Z',
          status: 'acknowledged',
          acknowledgedBy: 'Sarah Chen',
          acknowledgedAt: '2024-01-22T09:50:00Z'
        },
        {
          id: '3',
          type: 'drift',
          severity: 'warning',
          title: 'Data Drift Detected',
          description: 'Significant drift in feature distribution for Price Optimization model',
          modelName: 'Price Optimization',
          deploymentId: 'deploy-3',
          timestamp: '2024-01-22T08:30:00Z',
          status: 'active'
        }
      ]);

      setDataQuality({
        driftScore: 0.23,
        qualityScore: 94,
        anomaliesDetected: 12,
        validationErrors: 3,
        featureChanges: 7,
        lastChecked: '2024-01-22T10:25:00Z'
      });

      setIsLoading(false);
    }, 1000);
  }, []);

  const getHealthBadge = (status: string, score?: number) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Healthy {score && `(${score})`}
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning {score && `(${score})`}
          </Badge>
        );
      case 'critical':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Critical {score && `(${score})`}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'degrading':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'warning':
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'low':
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged', acknowledgedBy: 'Current User', acknowledgedAt: new Date().toISOString() }
        : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved', resolvedBy: 'Current User', resolvedAt: new Date().toISOString() }
        : alert
    ));
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout breadcrumbs={breadcrumbs}>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Monitoring Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor your ML models and deployments in real-time</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Alert Rule
              </Button>
            </div>
          </div>

          {/* System Health Score */}
          {systemHealth && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600">{systemHealth.score}</div>
                      <div className="text-sm text-gray-600">Health Score</div>
                    </div>
                    <div className="h-12 w-px bg-gray-200"></div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        {getHealthBadge(systemHealth.status)}
                        <span className="text-sm text-gray-600">System Status</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Last updated: {formatDate(systemHealth.lastUpdated)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Overall System Health</div>
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full" 
                        style={{ width: `${systemHealth.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overview Metrics */}
          {overviewMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Deployments</p>
                      <p className="text-2xl font-bold text-blue-600">{overviewMetrics.activeDeployments}</p>
                    </div>
                    <Server className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Critical Alerts</p>
                      <p className="text-2xl font-bold text-red-600">{overviewMetrics.totalAlerts.critical}</p>
                      <p className="text-xs text-gray-500">
                        {overviewMetrics.totalAlerts.warning} warning, {overviewMetrics.totalAlerts.info} info
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Uptime</p>
                      <p className="text-2xl font-bold text-green-600">{overviewMetrics.overallUptime}%</p>
                    </div>
                    <Wifi className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                      <p className="text-2xl font-bold text-purple-600">{overviewMetrics.avgResponseTime}ms</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">CPU Usage</p>
                      <p className="text-2xl font-bold text-orange-600">{overviewMetrics.resourceUtilization.cpu}%</p>
                      <p className="text-xs text-gray-500">
                        Memory: {overviewMetrics.resourceUtilization.memory}%
                      </p>
                    </div>
                    <Cpu className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Model Performance Grid */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Model Performance</span>
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {modelPerformance.map((model) => (
                  <Card key={model.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-sm">{model.name}</h4>
                          <p className="text-xs text-gray-600">v{model.version} • {model.environment}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getHealthBadge(model.status)}
                          {getTrendIcon(model.trend)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Accuracy</span>
                          <span className="font-medium">{model.metrics.accuracy}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Latency</span>
                          <span className="font-medium">{model.metrics.latency}ms</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Throughput</span>
                          <span className="font-medium">{model.metrics.throughput}/hr</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-gray-500">
                          Updated: {formatDate(model.lastUpdated)}
                        </span>
                        <Button size="sm" variant="ghost">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>Active Alerts</span>
                    <Badge variant="secondary" className="ml-2">
                      {alerts.filter(a => a.status === 'active').length}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.severity === 'critical' ? 'bg-red-500' :
                        alert.severity === 'warning' || alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getSeverityBadge(alert.severity)}
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                          <Badge 
                            variant={alert.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {alert.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs text-gray-600">{alert.description}</p>
                        {alert.modelName && (
                          <p className="text-xs text-blue-600 mt-1">Model: {alert.modelName}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(alert.timestamp)}
                          </span>
                          <div className="flex space-x-1">
                            {alert.status === 'active' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs h-6"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                >
                                  Acknowledge
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-xs h-6"
                                  onClick={() => resolveAlert(alert.id)}
                                >
                                  Resolve
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Quality Monitoring */}
            {dataQuality && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Data Quality</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Drift Score</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{dataQuality.driftScore.toFixed(3)}</span>
                        <div className={`w-3 h-3 rounded-full ${
                          dataQuality.driftScore > 0.2 ? 'bg-red-500' :
                          dataQuality.driftScore > 0.1 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quality Score</span>
                      <span className="font-medium">{dataQuality.qualityScore}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Anomalies Detected</span>
                      <Badge variant={dataQuality.anomaliesDetected > 10 ? 'destructive' : 'secondary'}>
                        {dataQuality.anomaliesDetected}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Validation Errors</span>
                      <Badge variant={dataQuality.validationErrors > 5 ? 'destructive' : 'secondary'}>
                        {dataQuality.validationErrors}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Feature Changes</span>
                      <span className="font-medium">{dataQuality.featureChanges}</span>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Last checked: {formatDate(dataQuality.lastChecked)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Performance Analytics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Analytics</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <select className="border rounded-md px-3 py-1 text-sm">
                    <option value="1h">Last Hour</option>
                    <option value="24h" selected>Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">System Performance Trends</h4>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <LineChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Performance trend charts</p>
                      <p className="text-sm">Response time, throughput, errors</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Resource Utilization</h4>
                  <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PieChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Resource usage charts</p>
                      <p className="text-sm">CPU, Memory, Storage</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

export default function MonitoringDashboardPage() {
  return <MonitoringDashboardContent />;
}
