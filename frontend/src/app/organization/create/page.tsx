'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import organizationService from '@/lib/organization-service';
import { OrganizationCreateFormData } from '@/types/organization';

const organizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(255),
  description: z.string().max(1000).optional(),
  billing_email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [creating, setCreating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganizationCreateFormData>({
    resolver: zodResolver(organizationSchema),
  });

  const onSubmit = async (data: OrganizationCreateFormData) => {
    try {
      setCreating(true);
      
      const organization = await organizationService.createOrganization({
        name: data.name,
        description: data.description || undefined,
        billing_email: data.billing_email || undefined,
      });

      // Refresh user data to get the new organization
      await refreshUser();
      
      toast.success('Organization created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast.error('Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  // If user already has an organization, redirect to settings
  if (user?.organizationId) {
    router.push('/organization/settings');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Organization
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Set up your organization to start managing ML projects
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Provide basic information about your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Acme Corp"
                  className={errors.name ? 'border-red-300' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of your organization"
                  className={errors.description ? 'border-red-300' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Optional</p>
              </div>

              <div>
                <Label htmlFor="billing_email">Billing Email</Label>
                <Input
                  id="billing_email"
                  type="email"
                  {...register('billing_email')}
                  placeholder="billing@acmecorp.com"
                  className={errors.billing_email ? 'border-red-300' : ''}
                />
                {errors.billing_email && (
                  <p className="text-sm text-red-600 mt-1">{errors.billing_email.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Email for billing and subscription notifications (optional)
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={creating} className="flex-1">
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 mr-2" />
                      Create Organization
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an organization, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}