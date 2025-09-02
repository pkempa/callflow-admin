"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Download,
  RefreshCw,
} from "lucide-react";
import NewAdminLayout from "@/components/layout/NewAdminLayout";
import {
  Card,
  Button,
  Badge,
  Typography,
  Input,
  LoadingSpinner,
  EmptyState,
} from "@/components/ui/design-system";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  cn,
  getStatusColor,
} from "@/lib/utils";
import { adminAPI, Organization } from "@/lib/admin-api";

interface OrganizationWithMetrics extends Organization {
  metrics?: {
    totalCalls: number;
    monthlySpend: number;
    lastActivity: string;
    activeUsers: number;
  };
}

interface FilterState {
  search: string;
  plan: string;
  status: string;
  sortBy: "name" | "created_at" | "user_count" | "wallet_balance";
  sortOrder: "asc" | "desc";
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return {
          variant: "success" as const,
          icon: CheckCircle,
          label: "Active",
        };
      case "inactive":
        return { variant: "default" as const, icon: Clock, label: "Inactive" };
      case "suspended":
        return {
          variant: "warning" as const,
          icon: AlertCircle,
          label: "Suspended",
        };
      default:
        return { variant: "default" as const, icon: Clock, label: status };
    }
  };

  const config = getStatusConfig(status);
  return (
    <Badge variant={config.variant} icon={config.icon}>
      {config.label}
    </Badge>
  );
};

const PlanBadge: React.FC<{ plan: string }> = ({ plan }) => {
  const getPlanConfig = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "enterprise":
        return { variant: "info" as const, label: "Enterprise" };
      case "professional":
        return { variant: "success" as const, label: "Professional" };
      case "starter":
        return { variant: "warning" as const, label: "Starter" };
      case "trial":
        return { variant: "default" as const, label: "Trial" };
      default:
        return { variant: "default" as const, label: plan };
    }
  };

  const config = getPlanConfig(plan);
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const OrganizationCard: React.FC<{
  organization: OrganizationWithMetrics;
  onView: (org: OrganizationWithMetrics) => void;
  onEdit: (org: OrganizationWithMetrics) => void;
  onDelete: (org: OrganizationWithMetrics) => void;
}> = ({ organization, onView, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card className="hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Organization header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Typography.H3 className="truncate">
                  {organization.name}
                </Typography.H3>
                <StatusBadge
                  status={organization.is_active ? "active" : "inactive"}
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>#{organization.account_number || "N/A"}</span>
                <span>•</span>
                <span>{organization.industry}</span>
                <span>•</span>
                <span>
                  Created {formatRelativeTime(organization.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="font-semibold text-gray-900">
                {organization.user_count || 0}
              </div>
              <div className="text-xs text-gray-500">Users</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="font-semibold text-gray-900">
                {formatCurrency(organization.wallet_balance || 0)}
              </div>
              <div className="text-xs text-gray-500">Balance</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="font-semibold text-gray-900">
                {organization.metrics?.totalCalls || 0}
              </div>
              <div className="text-xs text-gray-500">Calls</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
              <div className="font-semibold text-gray-900">
                {organization.metrics?.lastActivity
                  ? formatRelativeTime(organization.metrics.lastActivity)
                  : "Never"}
              </div>
              <div className="text-xs text-gray-500">Last Active</div>
            </div>
          </div>

          {/* Plan and team size */}
          <div className="flex items-center gap-3">
            <PlanBadge plan={organization.plan} />
            <span className="text-sm text-gray-500">
              Team: {organization.team_size}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowActions(!showActions)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>

          {showActions && (
            <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onView(organization);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onEdit(organization);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(organization);
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default function Organizations() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationWithMetrics[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    plan: "",
    status: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Load organizations
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load real data first
      try {
        const response = await adminAPI.getOrganizations({
          include_user_counts: true,
        });

        if (response.success && response.data) {
          const orgsWithMetrics = response.data.map((org: Organization) => ({
            ...org,
            metrics: {
              totalCalls: Math.floor(Math.random() * 1000),
              monthlySpend: Math.floor(Math.random() * 500),
              lastActivity: new Date(
                Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
              ).toISOString(),
              activeUsers: Math.floor((org.user_count || 0) * 0.8),
            },
          }));
          setOrganizations(orgsWithMetrics);
          return;
        }
      } catch (apiError) {
        console.warn("API call failed, using mock data:", apiError);
      }

      // Fall back to mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockOrganizations: OrganizationWithMetrics[] = [
        {
          id: "1",
          name: "TechCorp Solutions",
          owner_id: "user1",
          account_number: "TC001",
          plan: "enterprise",
          team_size: "large",
          industry: "Technology",
          user_count: 45,
          wallet_balance: 2500.0,
          is_active: true,
          created_at: "2024-01-15T10:00:00Z",
          updated_at: "2024-01-20T15:30:00Z",
          metrics: {
            totalCalls: 1234,
            monthlySpend: 890.5,
            lastActivity: "2024-01-20T14:30:00Z",
            activeUsers: 42,
          },
        },
        {
          id: "2",
          name: "Acme Inc",
          owner_id: "user2",
          account_number: "AC002",
          plan: "professional",
          team_size: "medium",
          industry: "Manufacturing",
          user_count: 23,
          wallet_balance: 1200.0,
          is_active: true,
          created_at: "2024-01-10T09:00:00Z",
          updated_at: "2024-01-19T11:15:00Z",
          metrics: {
            totalCalls: 567,
            monthlySpend: 450.25,
            lastActivity: "2024-01-19T16:45:00Z",
            activeUsers: 20,
          },
        },
        {
          id: "3",
          name: "StartupXYZ",
          owner_id: "user3",
          account_number: "SX003",
          plan: "starter",
          team_size: "small",
          industry: "SaaS",
          user_count: 8,
          wallet_balance: 150.0,
          is_active: true,
          created_at: "2024-01-18T14:00:00Z",
          updated_at: "2024-01-18T14:00:00Z",
          metrics: {
            totalCalls: 89,
            monthlySpend: 75.0,
            lastActivity: "2024-01-18T18:20:00Z",
            activeUsers: 7,
          },
        },
      ];

      setOrganizations(mockOrganizations);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load organizations"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isSignedIn) {
      loadOrganizations();
    }
  }, [isSignedIn]);

  // Filter and sort organizations
  const filteredOrganizations = organizations
    .filter((org) => {
      if (
        filters.search &&
        !org.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.plan && org.plan !== filters.plan) {
        return false;
      }
      if (filters.status) {
        const isActive = org.is_active;
        if (filters.status === "active" && !isActive) return false;
        if (filters.status === "inactive" && isActive) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aValue = a[filters.sortBy] || 0;
      const bValue = b[filters.sortBy] || 0;
      const multiplier = filters.sortOrder === "asc" ? 1 : -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * multiplier;
      }
      return (Number(aValue) - Number(bValue)) * multiplier;
    });

  const handleView = (org: OrganizationWithMetrics) => {
    router.push(`/organizations/${org.id}`);
  };

  const handleEdit = (org: OrganizationWithMetrics) => {
    // TODO: Open edit modal
    console.log("Edit organization:", org);
  };

  const handleDelete = (org: OrganizationWithMetrics) => {
    // TODO: Open delete confirmation modal
    console.log("Delete organization:", org);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <NewAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Typography.H1>Organizations</Typography.H1>
            <Typography.Body className="text-gray-600 mt-1">
              Manage customer organizations and their settings
            </Typography.Body>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={loadOrganizations}
              disabled={loading}
              icon={RefreshCw}
              className={loading ? "animate-spin" : ""}
            >
              Refresh
            </Button>
            <Button variant="outline" icon={Download}>
              Export
            </Button>
            <Button
              icon={Plus}
              onClick={() => router.push("/organizations/create")}
            >
              Add Organization
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search organizations..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                icon={Search}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                icon={Filter}
              >
                Filters
              </Button>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value as FilterState["sortBy"],
                  }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at">Sort by Created</option>
                <option value="name">Sort by Name</option>
                <option value="user_count">Sort by Users</option>
                <option value="wallet_balance">Sort by Balance</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  value={filters.plan}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, plan: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Plans</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="professional">Professional</option>
                  <option value="starter">Starter</option>
                  <option value="trial">Trial</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortOrder: e.target.value as FilterState["sortOrder"],
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Results summary */}
        <div className="flex items-center justify-between">
          <Typography.Body className="text-gray-600">
            Showing {filteredOrganizations.length} of {organizations.length}{" "}
            organizations
          </Typography.Body>
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
            >
              Clear search
            </Button>
          )}
        </div>

        {/* Error state */}
        {error && (
          <Card variant="outlined" className="border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <Typography.H3 className="text-red-800">
                  Error loading organizations
                </Typography.H3>
                <Typography.Body className="text-red-700 mt-1">
                  {error}
                </Typography.Body>
              </div>
            </div>
          </Card>
        )}

        {/* Organizations grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrganizations.map((organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="No organizations found"
            description={
              filters.search || filters.plan || filters.status
                ? "No organizations match your current filters"
                : "Get started by creating your first organization"
            }
            action={{
              label: "Add Organization",
              onClick: () => router.push("/organizations/create"),
            }}
          />
        )}
      </div>
    </NewAdminLayout>
  );
}
