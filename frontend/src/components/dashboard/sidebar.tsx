'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Folder,
  Bot,
  FlaskConical,
  Rocket,
  TrendingUp,
  AlertTriangle,
  Users,
  Settings,
  CreditCard,
  Plus,
  Upload,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  { href: '/dashboard', icon: BarChart3, label: 'Overview', description: 'Dashboard home' },
  { href: '/dashboard/projects', icon: Folder, label: 'Projects', description: 'Manage projects' },
  { href: '/dashboard/models', icon: Bot, label: 'Models', description: 'Model registry' },
  { href: '/dashboard/experiments', icon: FlaskConical, label: 'Experiments', description: 'Track experiments' },
  { href: '/dashboard/deployments', icon: Rocket, label: 'Deployments', description: 'Deployed models' },
  { href: '/dashboard/monitoring', icon: TrendingUp, label: 'Monitoring', description: 'Performance metrics' },
  { href: '/dashboard/alerts', icon: AlertTriangle, label: 'Alerts', description: 'System alerts' },
];

const bottomItems = [
  { href: '/dashboard/team', icon: Users, label: 'Team', description: 'Team management', requiresPro: true },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', description: 'Account settings' },
  { href: '/dashboard/billing', icon: CreditCard, label: 'Billing', description: 'Subscription & billing' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Organization Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 truncate">
                {user?.organizationName || 'Personal'}
              </h2>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-2 hover:bg-gray-100"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-10',
                  collapsed ? 'px-2' : 'px-3',
                  isActive(item.href) && 'bg-primary/10 text-primary border-primary/20'
                )}
              >
                <Icon className={cn('w-5 h-5', collapsed ? 'mx-auto' : 'mr-3')} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-200">
          <div className="space-y-2">
            <Button
              size="sm"
              className="w-full justify-start bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full justify-start"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Model
            </Button>
          </div>
        </div>
      )}

      {/* Plan Indicator */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-900">Professional Plan</span>
              <span className="text-xs text-gray-500">80%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">8/10 projects used</p>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-2 border-t border-gray-200 space-y-1">
        {bottomItems.map((item) => {
          if (item.requiresPro && !user?.organizationId) return null;

          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-10',
                  collapsed ? 'px-2' : 'px-3',
                  isActive(item.href) && 'bg-primary/10 text-primary border-primary/20'
                )}
              >
                <Icon className={cn('w-5 h-5', collapsed ? 'mx-auto' : 'mr-3')} />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}