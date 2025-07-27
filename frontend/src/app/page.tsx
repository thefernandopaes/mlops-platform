'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            MLOps Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive platform for machine learning model lifecycle management. 
            Deploy, monitor, and scale your ML models with confidence.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" size="lg" className="px-8">
                Sign Up
              </Button>
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Model Registry</h3>
              <p className="text-gray-600">
                Version and manage your ML models with comprehensive metadata tracking.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Experiment Tracking</h3>
              <p className="text-gray-600">
                Track experiments, compare results, and optimize your model performance.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Model Deployment</h3>
              <p className="text-gray-600">
                Deploy models to production with one-click deployment and monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}