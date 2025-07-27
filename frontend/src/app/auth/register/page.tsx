'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Building2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PublicRoute } from '@/components/auth/public-route';
import { useAuth } from '@/contexts/auth-context';

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  organizationName: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 2, {
      message: 'Organization name must be at least 2 characters if provided',
    }),
  createOrganization: z.boolean().default(false),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => !data.createOrganization || data.organizationName, {
  message: 'Organization name is required when creating a new organization',
  path: ['organizationName'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      createOrganization: false,
      acceptTerms: false,
    },
  });

  const createOrganization = watch('createOrganization');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        organizationName: data.createOrganization ? data.organizationName : undefined,
      });
    } catch (error: any) {
      // Handle specific error types
      if (error?.message?.includes('email')) {
        setError('email', { message: error.message });
      } else if (error?.message?.includes('password')) {
        setError('password', { message: error.message });
      } else if (error?.message?.includes('organization')) {
        setError('organizationName', { message: error.message });
      } else {
        setError('root', { message: 'Registration failed. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">ML</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the MLOps Platform and start managing your ML workflows
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.root.message}
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <div className="mt-1">
                  <Input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={`block w-full ${
                      errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="John"
                    {...register('firstName')}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <div className="mt-1">
                  <Input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className={`block w-full ${
                      errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="Doe"
                    {...register('lastName')}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="john.doe@example.com"
                  {...register('email')}
                />
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
                  autoComplete="new-password"
                  className={`block w-full pr-10 ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Create a strong password"
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

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full pr-10 ${
                    errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Organization Section */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createOrganization"
                  {...register('createOrganization')}
                />
                <Label htmlFor="createOrganization" className="text-sm font-medium text-gray-700">
                  Create a new organization
                </Label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                You can join an existing organization later if you prefer
              </p>

              {createOrganization && (
                <div className="mt-4">
                  <Label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                    Organization Name
                  </Label>
                  <div className="mt-1 relative">
                    <Input
                      id="organizationName"
                      type="text"
                      className={`block w-full pl-10 ${
                        errors.organizationName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                      }`}
                      placeholder="Acme Corp"
                      {...register('organizationName')}
                    />
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {errors.organizationName && (
                      <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                {...register('acceptTerms')}
                className="mt-1"
              />
              <div className="text-sm">
                <Label htmlFor="acceptTerms" className="text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:text-primary/80 underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary/80 underline">
                    Privacy Policy
                  </Link>
                </Label>
                {errors.acceptTerms && (
                  <p className="mt-1 text-red-600">{errors.acceptTerms.message}</p>
                )}
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
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/auth/login" 
                  className="font-medium text-primary hover:text-primary/80"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <PublicRoute>
      <RegisterPageContent />
    </PublicRoute>
  );
}