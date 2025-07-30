
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Building2, User, Mail, Lock, Check, Star, Shield, Users, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PublicRoute } from '@/components/auth/public-route';
import { useAuth } from '@/contexts/auth-context';

const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
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
  organizationName: z
    .string()
    .min(1, 'Organization name is required')
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  role: z
    .string()
    .min(1, 'Please select your role'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const roleOptions = [
  { value: 'ml_engineer', label: 'ML Engineer' },
  { value: 'data_scientist', label: 'Data Scientist' },
  { value: 'manager', label: 'Manager' },
  { value: 'other', label: 'Other' },
];

const features = [
  {
    icon: Zap,
    title: 'Deploy in Minutes',
    description: 'Go from model to production in minutes, not months'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 compliant with enterprise-grade security'
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Built for teams with role-based access control'
  }
];

const testimonials = [
  {
    quote: "MLOps Platform reduced our deployment time from weeks to minutes.",
    author: "Sarah Chen",
    role: "ML Engineer at TechCorp",
    rating: 5
  },
  {
    quote: "The best platform for managing ML models at scale.",
    author: "David Rodriguez",
    role: "Data Science Manager at DataFlow",
    rating: 5
  }
];

function PasswordStrengthMeter({ password }: { password: string }) {
  const checks = [
    { test: password.length >= 8, label: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
    { test: /[a-z]/.test(password), label: 'One lowercase letter' },
    { test: /[0-9]/.test(password), label: 'One number' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'One special character' },
  ];

  const passedChecks = checks.filter(check => check.test).length;
  const strength = passedChecks / checks.length;
  
  const getStrengthText = () => {
    if (passedChecks === 0) return '';
    if (passedChecks <= 2) return 'Weak';
    if (passedChecks <= 3) return 'Fair';
    if (passedChecks <= 4) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (passedChecks <= 2) return 'bg-red-500';
    if (passedChecks <= 3) return 'bg-yellow-500';
    if (passedChecks <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>Password strength</span>
        <span>{getStrengthText()}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strength * 100}%` }}
        />
      </div>
      <div className="mt-2 space-y-1">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center text-xs">
            <Check className={`h-3 w-3 mr-1 ${check.test ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={check.test ? 'text-green-600' : 'text-gray-500'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegisterPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
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
      acceptTerms: false,
    },
  });

  const password = watch('password') || '';
  const organizationName = watch('organizationName') || '';

  // Auto-generate organization slug preview
  const organizationSlug = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const [firstName, ...lastNameParts] = data.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      await registerUser({
        email: data.email,
        password: data.password,
        firstName,
        lastName,
        organizationName: data.organizationName,
      });
    } catch (error: any) {
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

  // Rotate testimonials every 5 seconds
  useState(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  });

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">ML</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Start your MLOps journey
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join thousands of ML teams building the future
            </p>
          </div>

          {/* OAuth Options */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-3"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-3 py-3"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {errors.root && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.root.message}
              </div>
            )}

            <div>
              <Label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  className={`block w-full pl-10 ${
                    errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="John Doe"
                  {...register('fullName')}
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Work Email
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="john.doe@company.com"
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
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Create a strong password"
                  {...register('password')}
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <PasswordStrengthMeter password={password} />
              </div>
            </div>

            <div>
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
                {organizationSlug && (
                  <p className="mt-1 text-xs text-gray-500">
                    Your workspace URL: mlops-platform.repl.co/{organizationSlug}
                  </p>
                )}
                {errors.organizationName && (
                  <p className="mt-1 text-sm text-red-600">{errors.organizationName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </Label>
              <div className="mt-1">
                <select
                  id="role"
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
                    errors.role ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  {...register('role')}
                >
                  <option value="">Select your role</option>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>

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
                className="w-full flex justify-center items-center py-3"
                disabled={isSubmitting || isLoading}
              >
                {(isSubmitting || isLoading) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
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

      {/* Right Panel - Value Proposition */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/5 to-primary/10 flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Join 500+ ML teams using our platform
            </h3>
            <p className="text-gray-600">
              The most powerful MLOps platform for modern ML teams
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-6 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Testimonials Carousel */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
            <div className="flex items-center mb-4">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-gray-700 mb-4">
              "{testimonials[currentTestimonial].quote}"
            </blockquote>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">
                {testimonials[currentTestimonial].author}
              </div>
              <div className="text-gray-600">
                {testimonials[currentTestimonial].role}
              </div>
            </div>
            
            {/* Testimonial indicators */}
            <div className="flex justify-center mt-4 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Trusted and compliant</p>
            <div className="flex justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">SOC2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">GDPR Compliant</span>
              </div>
            </div>
          </div>
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
