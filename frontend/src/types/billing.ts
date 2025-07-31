
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: string[];
  limits: {
    max_models: number;
    max_deployments: number;
    max_storage_gb: number;
    max_compute_hours: number;
    max_team_members: number;
  };
  popular?: boolean;
}

export interface CurrentSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
}

export interface UsageMetrics {
  models: {
    used: number;
    limit: number;
  };
  deployments: {
    used: number;
    limit: number;
  };
  storage_gb: {
    used: number;
    limit: number;
  };
  compute_hours: {
    used: number;
    limit: number;
  };
  team_members: {
    used: number;
    limit: number;
  };
  api_calls: {
    used: number;
    limit: number;
  };
}

export interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  created_at: string;
  due_date: string;
  paid_at?: string;
  invoice_pdf?: string;
  description: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface UsageHistory {
  date: string;
  models: number;
  deployments: number;
  storage_gb: number;
  compute_hours: number;
  api_calls: number;
  cost: number;
}

export interface CostBreakdown {
  compute: number;
  storage: number;
  api_calls: number;
  additional_features: number;
  total: number;
}
