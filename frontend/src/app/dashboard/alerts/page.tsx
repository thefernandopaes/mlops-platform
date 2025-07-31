
'use client';

import { useState } from 'react';
import { Plus, AlertTriangle, CheckCircle, XCircle, Settings, History, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AlertRule, NotificationChannel, AlertHistory, AlertTemplate } from '@/types/alert';

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock data - replace with real API calls
  const alertRules: AlertRule[] = [
    {
      id: '1',
      name: 'Model Accuracy Drop',
      description: 'Alert when model accuracy falls below 90%',
      status: 'enabled',
      triggerConditions: {
        type: 'metric',
        conditions: [{
          id: '1',
          metric: 'accuracy',
          operator: '<',
          threshold: 0.9,
          duration: 5
        }]
      },
      notificationChannels: ['email-1', 'slack-1'],
      frequency: { cooldown: 30, maxAlertsPerHour: 5 },
      severity: 'high',
      suppressionRules: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      createdBy: 'user-1',
      triggeredCount: 12,
      lastTriggered: '2024-01-16T08:30:00Z'
    },
    {
      id: '2',
      name: 'High Latency Warning',
      description: 'Alert when response time exceeds 500ms',
      status: 'enabled',
      triggerConditions: {
        type: 'system',
        conditions: [{
          id: '2',
          metric: 'response_time',
          operator: '>',
          threshold: 500,
          duration: 2
        }]
      },
      notificationChannels: ['slack-1'],
      frequency: { cooldown: 15, maxAlertsPerHour: 10 },
      severity: 'medium',
      suppressionRules: [],
      createdAt: '2024-01-14T15:30:00Z',
      updatedAt: '2024-01-16T09:15:00Z',
      createdBy: 'user-2',
      triggeredCount: 34,
      lastTriggered: '2024-01-16T11:45:00Z'
    }
  ];

  const notificationChannels: NotificationChannel[] = [
    {
      id: 'email-1',
      name: 'Engineering Team',
      type: 'email',
      config: { recipients: ['eng@company.com', 'alerts@company.com'] },
      status: 'active',
      lastUsed: '2024-01-16T11:45:00Z',
      deliveryRate: 98.5
    },
    {
      id: 'slack-1',
      name: 'ML-Alerts Channel',
      type: 'slack',
      config: { slackChannel: '#ml-alerts' },
      status: 'active',
      lastUsed: '2024-01-16T11:45:00Z',
      deliveryRate: 100
    },
    {
      id: 'webhook-1',
      name: 'PagerDuty Integration',
      type: 'pagerduty',
      config: { pagerdutyIntegrationKey: 'pd_key_123' },
      status: 'active',
      lastUsed: '2024-01-15T22:10:00Z',
      deliveryRate: 95.2
    }
  ];

  const alertHistory: AlertHistory[] = [
    {
      id: '1',
      ruleId: '1',
      ruleName: 'Model Accuracy Drop',
      severity: 'high',
      triggeredAt: '2024-01-16T08:30:00Z',
      resolvedAt: '2024-01-16T09:15:00Z',
      status: 'resolved',
      resolvedBy: 'John Doe',
      message: 'Model accuracy dropped to 87% on production deployment',
      falsePositive: false,
      responseTime: 45
    },
    {
      id: '2',
      ruleId: '2',
      ruleName: 'High Latency Warning',
      severity: 'medium',
      triggeredAt: '2024-01-16T11:45:00Z',
      status: 'acknowledged',
      acknowledgedBy: 'Jane Smith',
      message: 'Response time spiked to 650ms during peak hours',
      falsePositive: false,
      responseTime: 12
    }
  ];

  const alertTemplates: AlertTemplate[] = [
    {
      id: '1',
      name: 'Performance Degradation',
      description: 'Monitor for model performance drops',
      category: 'performance',
      triggerConditions: {
        type: 'metric',
        conditions: [{
          id: 'template-1',
          metric: 'accuracy',
          operator: '<',
          threshold: 0.85,
          duration: 10
        }]
      },
      defaultSeverity: 'high'
    },
    {
      id: '2',
      name: 'Data Drift Detection',
      description: 'Alert on significant data distribution changes',
      category: 'data_quality',
      triggerConditions: {
        type: 'data_quality',
        conditions: [{
          id: 'template-2',
          metric: 'drift_score',
          operator: '>',
          threshold: 0.7,
          duration: 5
        }]
      },
      defaultSeverity: 'medium'
    }
  ];

  const getStatusIcon = (status: AlertRule['status']) => {
    switch (status) {
      case 'enabled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disabled':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'triggered':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelIcon = (type: NotificationChannel['type']) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'slack':
        return '📱';
      case 'webhook':
        return '🔗';
      case 'pagerduty':
        return '📟';
    }
  };

  const filteredRules = alertRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || rule.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || rule.status === selectedStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alert Configuration</h1>
          <p className="text-muted-foreground">
            Configure monitoring alerts and notification rules
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Alert Rule
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts Today</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 critical, 5 medium
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18m</div>
            <p className="text-xs text-muted-foreground">
              -5m from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">False Positives</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3%</div>
            <p className="text-xs text-muted-foreground">
              -0.5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="channels">Notification Channels</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Alert Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="Search alert rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Statuses</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              <option value="triggered">Triggered</option>
            </select>
          </div>

          {/* Alert Rules List */}
          <div className="grid gap-4">
            {filteredRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(rule.status)}
                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                      Triggered {rule.triggeredCount} times
                      {rule.lastTriggered && (
                        <span> • Last: {new Date(rule.lastTriggered).toLocaleString()}</span>
                      )}
                    </div>
                    <div>
                      {rule.notificationChannels.length} notification channel(s)
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notification Channels Tab */}
        <TabsContent value="channels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Notification Channels</h3>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Channel
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notificationChannels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getChannelIcon(channel.type)}</span>
                      <CardTitle className="text-base">{channel.name}</CardTitle>
                    </div>
                    <Badge variant={channel.status === 'active' ? 'default' : 'secondary'}>
                      {channel.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Delivery Rate:</span>
                      <span className="font-medium">{channel.deliveryRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Type:</span>
                      <span className="font-medium capitalize">{channel.type}</span>
                    </div>
                    {channel.lastUsed && (
                      <div className="flex justify-between text-sm">
                        <span>Last Used:</span>
                        <span className="font-medium">
                          {new Date(channel.lastUsed).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Test
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alert History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Alert History</h3>
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          <div className="space-y-4">
            {alertHistory.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{alert.ruleName}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {new Date(alert.triggeredAt).toLocaleString()}
                      </div>
                      <div className="text-muted-foreground">
                        Status: {alert.status}
                        {alert.responseTime && (
                          <span> • Response: {alert.responseTime}m</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Alert Templates</h3>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alertTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{template.category}</Badge>
                    <div className="text-sm text-muted-foreground">
                      Default Severity: <span className="font-medium">{template.defaultSeverity}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
