
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  DollarSign,
  TrendingUp,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Users,
  Database,
  Cpu,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  FileText,
  Receipt,
  CreditCard as CreditCardIcon,
  Building2,
  Globe,
  Shield,
  Target,
  Gauge,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  SubscriptionPlan,
  CurrentSubscription,
  UsageMetrics,
  Invoice,
  PaymentMethod,
  BillingAddress,
  UsageHistory,
  CostBreakdown
} from '@/types/billing';

const billingAddressSchema = z.object({
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
});

function BillingPageContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(billingAddressSchema),
  });

  useEffect(() => {
    const loadBillingData = async () => {
      try {
        setLoading(true);

        // Mock data - in real implementation, these would come from API calls
        const mockSubscription: CurrentSubscription = {
          plan: {
            id: 'pro',
            name: 'Professional',
            price: 49,
            billing_cycle: 'monthly',
            features: [
              'Up to 25 models',
              '10 active deployments',
              '500 GB storage',
              '1000 compute hours/month',
              'Advanced monitoring',
              'Team collaboration',
              'Priority support'
            ],
            limits: {
              max_models: 25,
              max_deployments: 10,
              max_storage_gb: 500,
              max_compute_hours: 1000,
              max_team_members: 10,
            }
          },
          status: 'active',
          current_period_start: '2024-01-01',
          current_period_end: '2024-02-01',
          cancel_at_period_end: false,
        };

        const mockUsageMetrics: UsageMetrics = {
          models: { used: 8, limit: 25 },
          deployments: { used: 4, limit: 10 },
          storage_gb: { used: 120, limit: 500 },
          compute_hours: { used: 350, limit: 1000 },
          team_members: { used: 6, limit: 10 },
          api_calls: { used: 45000, limit: 100000 },
        };

        const mockPlans: SubscriptionPlan[] = [
          {
            id: 'starter',
            name: 'Starter',
            price: 0,
            billing_cycle: 'monthly',
            features: [
              'Up to 3 models',
              '1 active deployment',
              '10 GB storage',
              '100 compute hours/month',
              'Basic monitoring',
              'Community support'
            ],
            limits: {
              max_models: 3,
              max_deployments: 1,
              max_storage_gb: 10,
              max_compute_hours: 100,
              max_team_members: 1,
            }
          },
          {
            id: 'pro',
            name: 'Professional',
            price: 49,
            billing_cycle: 'monthly',
            features: [
              'Up to 25 models',
              '10 active deployments',
              '500 GB storage',
              '1000 compute hours/month',
              'Advanced monitoring',
              'Team collaboration',
              'Priority support'
            ],
            limits: {
              max_models: 25,
              max_deployments: 10,
              max_storage_gb: 500,
              max_compute_hours: 1000,
              max_team_members: 10,
            },
            popular: true
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 199,
            billing_cycle: 'monthly',
            features: [
              'Unlimited models',
              'Unlimited deployments',
              'Unlimited storage',
              'Unlimited compute hours',
              'Advanced analytics',
              'Custom integrations',
              '24/7 dedicated support',
              'SLA guarantees'
            ],
            limits: {
              max_models: -1,
              max_deployments: -1,
              max_storage_gb: -1,
              max_compute_hours: -1,
              max_team_members: -1,
            }
          }
        ];

        const mockInvoices: Invoice[] = [
          {
            id: '1',
            invoice_number: 'INV-2024-001',
            amount: 49.00,
            currency: 'USD',
            status: 'paid',
            created_at: '2024-01-01',
            due_date: '2024-01-15',
            paid_at: '2024-01-02',
            description: 'Professional Plan - January 2024'
          },
          {
            id: '2',
            invoice_number: 'INV-2023-012',
            amount: 49.00,
            currency: 'USD',
            status: 'paid',
            created_at: '2023-12-01',
            due_date: '2023-12-15',
            paid_at: '2023-12-03',
            description: 'Professional Plan - December 2023'
          }
        ];

        const mockPaymentMethods: PaymentMethod[] = [
          {
            id: '1',
            type: 'card',
            last4: '4242',
            brand: 'Visa',
            exp_month: 12,
            exp_year: 2027,
            is_default: true
          }
        ];

        const mockCostBreakdown: CostBreakdown = {
          compute: 28.50,
          storage: 12.00,
          api_calls: 6.50,
          additional_features: 2.00,
          total: 49.00
        };

        setCurrentSubscription(mockSubscription);
        setAvailablePlans(mockPlans);
        setUsageMetrics(mockUsageMetrics);
        setInvoices(mockInvoices);
        setPaymentMethods(mockPaymentMethods);
        setCostBreakdown(mockCostBreakdown);

      } catch (error) {
        console.error('Failed to load billing data:', error);
        toast.error('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, []);

  const handlePlanChange = async (planId: string) => {
    try {
      // API call would go here
      console.log('Changing to plan:', planId);
      toast.success('Plan change scheduled');
    } catch (error) {
      console.error('Failed to change plan:', error);
      toast.error('Failed to change plan');
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      // Payment method collection would happen here
      console.log('Adding payment method');
      toast.success('Payment method added');
    } catch (error) {
      console.error('Failed to add payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      // API call to download invoice PDF
      console.log('Downloading invoice:', invoiceId);
      toast.success('Invoice download started');
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'past_due': return 'text-orange-600 bg-orange-50';
      case 'trialing': return 'text-blue-600 bg-blue-50';
      case 'paid': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Billing', href: '/dashboard/billing' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
                  <p className="text-gray-600">Manage your subscription, usage, and payments</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Usage Report
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Billing Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Usage</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <Receipt className="h-4 w-4" />
              <span>Billing History</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Plans</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Current Plan
                        <Badge className={getStatusColor(currentSubscription?.status || '')}>
                          {currentSubscription?.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold">{currentSubscription?.plan.name}</h3>
                          <p className="text-gray-600">
                            ${currentSubscription?.plan.price}/{currentSubscription?.plan.billing_cycle}
                          </p>
                        </div>
                        <Button>
                          <ArrowUp className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-600">Current Period</p>
                          <p className="font-medium">
                            {new Date(currentSubscription?.current_period_start || '').toLocaleDateString()} - {' '}
                            {new Date(currentSubscription?.current_period_end || '').toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Next Payment</p>
                          <p className="font-medium">
                            ${currentSubscription?.plan.price} on {' '}
                            {new Date(currentSubscription?.current_period_end || '').toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>This Month</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          ${costBreakdown?.total.toFixed(2)}
                        </div>
                        <p className="text-gray-600">Total Usage</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Compute</span>
                          <span>${costBreakdown?.compute.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Storage</span>
                          <span>${costBreakdown?.storage.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>API Calls</span>
                          <span>${costBreakdown?.api_calls.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Features</span>
                          <span>${costBreakdown?.additional_features.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Usage Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Overview</CardTitle>
                  <CardDescription>Current usage against your plan limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Models</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {usageMetrics?.models.used}/{usageMetrics?.models.limit === -1 ? '∞' : usageMetrics?.models.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${getUsagePercentage(usageMetrics?.models.used || 0, usageMetrics?.models.limit || 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Deployments</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {usageMetrics?.deployments.used}/{usageMetrics?.deployments.limit === -1 ? '∞' : usageMetrics?.deployments.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${getUsagePercentage(usageMetrics?.deployments.used || 0, usageMetrics?.deployments.limit || 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">Compute Hours</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {usageMetrics?.compute_hours.used}/{usageMetrics?.compute_hours.limit === -1 ? '∞' : usageMetrics?.compute_hours.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: `${getUsagePercentage(usageMetrics?.compute_hours.used || 0, usageMetrics?.compute_hours.limit || 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Database className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">Storage (GB)</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {usageMetrics?.storage_gb.used}/{usageMetrics?.storage_gb.limit === -1 ? '∞' : usageMetrics?.storage_gb.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${getUsagePercentage(usageMetrics?.storage_gb.used || 0, usageMetrics?.storage_gb.limit || 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-medium">Team Members</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {usageMetrics?.team_members.used}/{usageMetrics?.team_members.limit === -1 ? '∞' : usageMetrics?.team_members.limit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{ width: `${getUsagePercentage(usageMetrics?.team_members.used || 0, usageMetrics?.team_members.limit || 0)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-pink-600" />
                          <span className="text-sm font-medium">API Calls</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {usageMetrics?.api_calls.used.toLocaleString()}/{usageMetrics?.api_calls.limit === -1 ? '∞' : usageMetrics?.api_calls.limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-600 h-2 rounded-full" 
                          style={{ width: `${getUsagePercentage(usageMetrics?.api_calls.used || 0, usageMetrics?.api_calls.limit || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>Detailed usage metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Usage analytics charts</p>
                      <p className="text-sm">Historical usage trends and forecasting</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Optimization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900">Optimize Storage Usage</h4>
                          <p className="text-sm text-blue-700">You can save $8/month by cleaning up unused model artifacts</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Gauge className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900">Right-size Deployments</h4>
                          <p className="text-sm text-green-700">Consider scaling down 2 deployments to save $15/month</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usage Forecast</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Projected monthly cost</span>
                        <span className="font-medium">$52.30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trend</span>
                        <div className="flex items-center text-green-600">
                          <ArrowDown className="h-4 w-4 mr-1" />
                          <span>6% decrease</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next bill estimate</span>
                        <span className="font-medium">$49.00</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Payment Methods
                    <Button size="sm" onClick={handleAddPaymentMethod}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCardIcon className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">
                              {method.brand} ending in {method.last4}
                            </p>
                            {method.exp_month && method.exp_year && (
                              <p className="text-sm text-gray-600">
                                Expires {method.exp_month}/{method.exp_year}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {method.is_default && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Invoice History */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice History</CardTitle>
                  <CardDescription>Download and manage your billing history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="font-medium">{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-600">{invoice.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(invoice.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Plan</CardTitle>
                  <CardDescription>Select the plan that best fits your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {availablePlans.map((plan) => (
                      <div 
                        key={plan.id} 
                        className={`relative p-6 border rounded-lg ${
                          plan.popular ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                        } ${currentSubscription?.plan.id === plan.id ? 'bg-blue-50' : 'bg-white'}`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-blue-600">Most Popular</Badge>
                          </div>
                        )}
                        
                        <div className="text-center mb-6">
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <div className="mt-2">
                            <span className="text-3xl font-bold">${plan.price}</span>
                            <span className="text-gray-600">/{plan.billing_cycle}</span>
                          </div>
                        </div>

                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <Button 
                          className="w-full"
                          variant={currentSubscription?.plan.id === plan.id ? 'secondary' : 'default'}
                          disabled={currentSubscription?.plan.id === plan.id}
                          onClick={() => handlePlanChange(plan.id)}
                        >
                          {currentSubscription?.plan.id === plan.id ? 'Current Plan' : 'Select Plan'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <ProtectedRoute requiredRole="viewer">
      <BillingPageContent />
    </ProtectedRoute>
  );
}
