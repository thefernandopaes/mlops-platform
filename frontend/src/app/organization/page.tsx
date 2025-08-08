'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Building2, Plus, Loader2, ExternalLink } from 'lucide-react';
import organizationService from '@/lib/organization-service';
import { Organization, OrganizationListResponse } from '@/types/organization';
import Link from 'next/link';

export default function OrganizationListPage() {
  const [items, setItems] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res: OrganizationListResponse = await organizationService.listOrganizations(
          (page - 1) * pageSize,
          pageSize
        );
        setItems(res.organizations);
        setTotal(res.total);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [page, pageSize]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (o) => o.name.toLowerCase().includes(q) || (o.slug || '').toLowerCase().includes(q)
    );
  }, [query, items]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
              <p className="text-gray-600">Browse and manage your organizations</p>
            </div>
            <Link href="/organization/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Organization
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Search organizations by name or slug"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-10">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-gray-600 text-sm">Loading organizations...</span>
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No organizations found</CardTitle>
                <CardDescription>Create a new organization to get started.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/organization/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((org) => (
                <Card key={org.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{org.name}</CardTitle>
                          <CardDescription>{org.slug}</CardDescription>
                        </div>
                      </div>
                      <Link href={`/organization/settings?orgId=${org.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                          <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Plan</span>
                        <div className="font-medium">{org.subscription_plan}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Status</span>
                        <div className="font-medium">{org.subscription_status}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Created</span>
                        <div className="font-medium">{new Date(org.created_at).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Active</span>
                        <div className="font-medium">{org.is_active ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <div className="space-x-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


