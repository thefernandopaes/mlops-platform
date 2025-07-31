
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PublicRoute } from '@/components/auth/public-route';
import { useAuth } from '@/contexts/auth-context';

const signinSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type SigninFormData = z.infer<typeof signinSchema>;

interface Organization {
  id: string;
  name: string;
  role: string;
}

function SigninPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [showOrgSelection, setShowOrgSelection] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string>('');
  const { login, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      // Handle specific error types
      if (error?.message?.includes('Multiple organizations')) {
        // Mock organizations - in real implementation, get from API
        setOrganizations([
          { id: '1', name: 'Acme Corp', role: 'admin' },
          { id: '2', name: 'Tech Startup', role: 'developer' },
        ]);
        setUserFirstName(data.email.split('@')[0]);
        setShowOrgSelection(true);
      } else if (error?.message?.includes('Invalid credentials')) {
        setError('email', { message: 'Invalid email or password' });
        setError('password', { message: 'Invalid email or password' });
      } else if (error?.message?.includes('email')) {
        setError('email', { message: error.message });
      } else if (error?.message?.includes('password')) {
        setError('password', { message: error.message });
      } else {
        setError('root', { message: 'Sign in failed. Please try again.' });
      }
    }
  };

  const handleOAuthSignin = (provider: 'google' | 'microsoft' | 'github') => {
    // OAuth integration would be implemented here
    console.log(`Signing in with ${provider}`);
  };

  const handleOrgSelection = (orgId: string) => {
    setSelectedOrg(orgId);
    // In real implementation, complete login with selected organization
    console.log('Selected organization:', orgId);
  };

  if (showOrgSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">ML</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {userFirstName}!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Choose your workspace to continue
            </p>
          </div>
          
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div className="space-y-4">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleOrgSelection(org.id)}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{org.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{org.role}</p>
                    </div>
                    <div className="text-primary">→</div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowOrgSelection(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">ML</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your workspace
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back! Please enter your details.
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => handleOAuthSignin('google')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => handleOAuthSignin('microsoft')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#F25022" d="M0 0h11.377v11.372H0z"/>
                <path fill="#00A4EF" d="M12.623 0H24v11.372H12.623z"/>
                <path fill="#7FBA00" d="M0 12.628h11.377V24H0z"/>
                <path fill="#FFB900" d="M12.623 12.628H24V24H12.623z"/>
              </svg>
              <span>Continue with Microsoft</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => handleOAuthSignin('github')}
            >
              <Github className="w-5 h-5" />
              <span>Continue with GitHub</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.root.message}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter your email"
                  {...register('email')}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`block w-full pr-10 ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter your password"
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  {...register('rememberMe')}
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-700">
                  Remember me
                </Label>
              </div>
              
              <div className="text-sm">
                <Link 
                  href="/auth/forgot-password" 
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center items-center"
                disabled={isSubmitting || isLoading}
              >
                {(isSubmitting || isLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in to your workspace'
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                New to MLOps Platform?{' '}
                <Link 
                  href="/auth/register" 
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Create account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <PublicRoute>
      <SigninPageContent />
    </PublicRoute>
  );
}
