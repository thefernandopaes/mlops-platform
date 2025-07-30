'use client';

import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Database, 
  GitBranch, 
  LogOut, 
  Settings, 
  User,
  Users,
  Activity,
  TrendingUp,
  Building2,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

function DashboardContent() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">ML</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">MLOps Platform</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span>{user?.firstName} {user?.lastName}</span>
                {user?.organizationName && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{user.organizationName}</span>
                  </>
                )}
              </div>
              
              {/* User Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      {user?.organizationId && (
                        <Link
                          href="/organization/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Organization Settings
                        </Link>
                      )}
                      {!user?.organizationId && (
                        <Link
                          href="/organization/create"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Create Organization
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600">
            Here's an overview of your ML projects and recent activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No projects yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Models</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No models registered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experiments</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No experiments tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                Just you for now
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Get started with your ML workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                <GitBranch className="mr-2 h-4 w-4" />
                Create New Project
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Database className="mr-2 h-4 w-4" />
                Register Model
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Start Experiment
              </Button>
              {user?.organizationId ? (
                <Link href="/organization/settings" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Team Members
                  </Button>
                </Link>
              ) : (
                <Link href="/organization/create" className="w-full">
                  <Button className="w-full justify-start" variant="outline">
                    <Building2 className="mr-2 h-4 w-4" />
                    Create Organization
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-gray-500">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent activity</p>
                  <p className="text-xs text-gray-400">
                    Start by creating your first project
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Follow these steps to set up your ML workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Create your first project</h4>
                  <p className="text-sm text-gray-600">
                    Organize your ML work by creating a project to group related models and experiments.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Register your first model</h4>
                  <p className="text-sm text-gray-600">
                    Upload and version your trained models with metadata and documentation.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Track experiments</h4>
                  <p className="text-sm text-gray-600">
                    Monitor training runs, compare metrics, and optimize your model performance.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Deploy to production</h4>
                  <p className="text-sm text-gray-600">
                    Deploy your best models with monitoring and automatic scaling.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}