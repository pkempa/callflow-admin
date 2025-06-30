"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
// Removed useQuery import - using local state management
import AdminLayout from "@/components/layout/AdminLayout";
import {
  adminAPI,
  Organization,
  isAuthReady,
  waitForAuth,
  PaginationInfo,
} from "@/lib/admin-api";
import {
  Search,
  Filter,
  Building,
  Ban,
  RotateCcw,
  Users,
  Eye,
  DollarSign,
  Crown,
  BarChart3,
  AlertCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Removed dropdown imports - now using direct action buttons
import { Card, CardContent } from "@/components/ui/card";

export default function OrganizationsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUpdating, setIsUpdating] = useState(false);
  const [orgList, setOrgList] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });
  const [loading, setLoading] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debouncing for API calls
  const lastApiCallRef = useRef<number>(0);

  // Protected state updates to prevent data clearing unexpectedly
  const setOrgListProtected = (newOrgList: Organization[]) => {
    if (newOrgList.length === 0 && orgList.length > 0) {
      return; // Don't clear existing data
    }
    setOrgList(newOrgList);
  };

  // Memoize fetchUsers to prevent recreation on every render
  const fetchUsers = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (hasAttemptedFetch && loading) {
      return;
    }

    try {
      setLoading(true);
      setHasAttemptedFetch(true);
      setError(null);

      // Wait for auth to be ready
      if (!isAuthReady()) {
        const authReady = await waitForAuth(5000);
        if (!authReady) {
          setError("Authentication timeout. Some features may be limited.");
          setLoading(false);
          return;
        }
      }

      const params = {
        page: pagination?.page || 1,
        limit: pagination?.limit || 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== "all" && { plan: filterStatus }),
      };

      const response = await adminAPI.getOrganizations(params);

      if (response.success && response.data) {
        const data = response.data;
        setOrgListProtected(data.organizations);
        setPagination(data.pagination);
        setError(null); // Clear any previous errors
      } else {
        setError(response.error || "Failed to load organizations");
        // Don't clear existing data on API failure
      }
    } catch {
      setError("Failed to load organizations");
      // Don't clear existing data on error
    } finally {
      setLoading(false);
    }
  }, [
    hasAttemptedFetch,
    loading,
    pagination?.page,
    pagination?.limit,
    searchTerm,
    filterStatus,
    orgList,
    setOrgListProtected,
  ]);

  // Memoize resetAndFetch to prevent recreation on every render
  const resetAndFetch = useCallback(async () => {
    // Add delay to prevent rapid successive calls
    const now = Date.now();
    if (lastApiCallRef.current && now - lastApiCallRef.current < 1000) {
      return;
    }
    lastApiCallRef.current = now;

    setHasAttemptedFetch(false);
    setLoading(true);

    await fetchUsers();
  }, [fetchUsers]);

  // Filter change protection
  useEffect(() => {
    if (hasAttemptedFetch) {
      resetAndFetch();
    }
  }, [filterStatus, hasAttemptedFetch, resetAndFetch]);

  // Note: Using local state management with fetchUsers() instead of useQuery

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Load current admin user info

  // Fetch organizations on page load with comprehensive race condition protection
  useEffect(() => {
    if (isLoaded && isSignedIn && !hasAttemptedFetch) {
      // Prevent multiple simultaneous loads
      let isCancelled = false;

      const initializeData = async () => {
        if (!isCancelled) {
          await fetchUsers();
        }
      };

      initializeData();

      return () => {
        isCancelled = true;
      };
    }
  }, [isLoaded, isSignedIn, hasAttemptedFetch, fetchUsers]);

  // Check if organization is the platform organization
  const isPlatformOrganization = (org: Organization) => {
    return (
      org.id === "platform-admin-org" || org.name === "Platform Administration"
    );
  };

  // Handle organization deactivation
  const handleDeactivateOrganization = async (
    organizationId: string,
    organizationName: string
  ) => {
    const confirmed = window.confirm(
      `⚠️ Deactivate Organization\n\n` +
        `Organization: ${organizationName}\n\n` +
        `This action will:\n` +
        `• Immediately disable access for all users in this organization\n` +
        `• Suspend all services and API access\n` +
        `• Prevent new user registrations\n` +
        `• Maintain all data for potential reactivation\n\n` +
        `This action can be reversed by reactivating the organization.\n\n` +
        `Are you sure you want to proceed?`
    );

    if (!confirmed) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await adminAPI.deactivateOrganization(organizationId);
      if (response.success) {
        alert(`✅ Organization "${organizationName}" has been deactivated.`);

        // Add delay before refresh to ensure operation completed
        await new Promise((resolve) => setTimeout(resolve, 500));
        await resetAndFetch(); // Refresh the data
      } else {
        alert(`❌ Failed to deactivate organization: ${response.error}`);
      }
    } catch {
      alert("❌ An error occurred while deactivating the organization.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivateOrganization = async (
    organizationId: string,
    organizationName: string
  ) => {
    const confirmed = window.confirm(
      `✅ Reactivate Organization\n\n` +
        `Organization: ${organizationName}\n\n` +
        `This action will:\n` +
        `• Restore access for all users in this organization\n` +
        `• Re-enable all services and API access\n` +
        `• Allow new user registrations\n` +
        `• Resume normal operations\n\n` +
        `Are you sure you want to proceed?`
    );

    if (!confirmed) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await adminAPI.reactivateOrganization(organizationId);
      if (response.success) {
        alert(`✅ Organization "${organizationName}" has been reactivated.`);

        // Add delay before refresh to ensure operation completed
        await new Promise((resolve) => setTimeout(resolve, 500));
        await resetAndFetch(); // Refresh the data
      } else {
        alert(`❌ Failed to reactivate organization: ${response.error}`);
      }
    } catch {
      alert("❌ An error occurred while reactivating the organization.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle notes functionality

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  // Filter organizations based on search and status
  const filteredOrganizations = orgList.filter((org) => {
    const accountNumber = org.account_number || org.id.slice(-8).toUpperCase();
    const matchesSearch = searchTerm
      ? org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.id.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? org.is_active !== false
        : org.is_active === false;

    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Organization Management
            </h1>
            <p className="text-gray-600">
              Monitor account health, usage, and revenue
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {`Showing ${filteredOrganizations.length} organizations`}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-900">
                  Limited Access Mode
                </h3>
                <p className="text-sm text-yellow-700">{error}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Some features may be unavailable. Try refreshing the page if
                  issues persist.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Organizations
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orgList.length}
                  </p>
                </div>
                <Building className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Organizations
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {orgList.filter((org) => org.is_active !== false).length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Wallet Balance
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    $
                    {orgList
                      .reduce((sum, org) => sum + (org.wallet_balance || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Enterprise Plans
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {orgList.filter((org) => org.plan === "enterprise").length}
                  </p>
                </div>
                <Crown className="h-8 w-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search organizations by name or account number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Deactivated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Organizations Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-lg">Loading organizations...</div>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan & Users
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity & Status
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue Data
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk Indicators
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrganizations.map((org) => (
                    <TableRow key={org.id} className="hover:bg-gray-50">
                      {/* Organization Info */}
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            <Building className="h-5 w-5 text-gray-400 mr-3" />
                            {isPlatformOrganization(org) && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {org.name}
                            </div>
                            <div className="text-xs text-gray-500 space-y-0.5">
                              <div className="font-mono text-blue-600">
                                {org.account_number ||
                                  `#${org.id.slice(-8).toUpperCase()}`}
                              </div>
                              <div>
                                Created:{" "}
                                {org.created_at
                                  ? new Date(
                                      org.created_at
                                    ).toLocaleDateString()
                                  : "Unknown"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Plan & Users */}
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <Badge
                            className={`${
                              org.plan === "enterprise"
                                ? "bg-purple-100 text-purple-800"
                                : org.plan === "professional"
                                ? "bg-blue-100 text-blue-800"
                                : org.plan === "starter"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {org.plan || "free"}
                          </Badge>
                          <div className="flex items-center text-xs text-gray-600">
                            <Users className="h-3 w-3 mr-1" />
                            {org.user_count || 0} users
                          </div>
                        </div>
                      </TableCell>

                      {/* Activity & Status */}
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <Badge
                            className={`${
                              org.is_active !== false
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {org.is_active !== false ? "Active" : "Inactive"}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            Last activity: No data
                          </div>
                        </div>
                      </TableCell>

                      {/* Revenue Data */}
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            ${(org.wallet_balance || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Monthly usage: $0.00
                          </div>
                        </div>
                      </TableCell>

                      {/* Risk Indicators */}
                      <TableCell className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          {(org.wallet_balance || 0) < 10 && (
                            <div
                              className="w-2 h-2 bg-yellow-400 rounded-full"
                              title="Low balance"
                            ></div>
                          )}
                          {org.is_active === false && (
                            <div
                              className="w-2 h-2 bg-red-400 rounded-full"
                              title="Inactive account"
                            ></div>
                          )}
                          {(org.user_count || 0) === 0 && (
                            <div
                              className="w-2 h-2 bg-orange-400 rounded-full"
                              title="No users"
                            ></div>
                          )}
                          {(org.wallet_balance || 0) < 10 ||
                          org.is_active === false ||
                          (org.user_count || 0) === 0 ? (
                            <span className="text-xs text-yellow-600">
                              Attention needed
                            </span>
                          ) : (
                            <span className="text-xs text-green-600">
                              Healthy
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {/* Admin Actions */}
                      <TableCell className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Analytics Button */}
                          <button
                            onClick={() => {
                              // Navigate to detailed analytics
                              window.open(`/analytics?org=${org.id}`, "_blank");
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1"
                            title="View Analytics"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>

                          {/* Detail Button - View Organization Details */}
                          <button
                            onClick={() =>
                              router.push(`/organizations/${org.id}`)
                            }
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                            title="View Organization Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Deactivate/Reactivate Button - Only for non-platform orgs */}
                          {!isPlatformOrganization(org) && (
                            <>
                              {org.is_active !== false ? (
                                <button
                                  onClick={() =>
                                    handleDeactivateOrganization(
                                      org.id,
                                      org.name
                                    )
                                  }
                                  className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                  title="Deactivate Organization"
                                >
                                  <Ban className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    handleReactivateOrganization(
                                      org.id,
                                      org.name
                                    )
                                  }
                                  className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                                  title="Reactivate Organization"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
