
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled' | 'triggered';
  triggerConditions: {
    type: 'metric' | 'system' | 'data_quality' | 'custom';
    conditions: AlertCondition[];
  };
  notificationChannels: string[];
  frequency: {
    cooldown: number; // minutes
    maxAlertsPerHour: number;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  suppressionRules: SuppressionRule[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  triggeredCount: number;
  lastTriggered?: string;
}

export interface AlertCondition {
  id: string;
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  duration: number; // minutes
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'pagerduty';
  config: {
    recipients?: string[];
    webhookUrl?: string;
    slackChannel?: string;
    pagerdutyIntegrationKey?: string;
  };
  status: 'active' | 'inactive' | 'error';
  lastUsed?: string;
  deliveryRate: number; // success percentage
}

export interface SuppressionRule {
  id: string;
  name: string;
  conditions: AlertCondition[];
  duration: number; // minutes
}

export interface AlertHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  triggeredAt: string;
  resolvedAt?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  resolvedBy?: string;
  message: string;
  falsePositive: boolean;
  responseTime?: number; // minutes
}

export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'data_quality' | 'system' | 'security';
  triggerConditions: AlertRule['triggerConditions'];
  defaultSeverity: AlertRule['severity'];
}
