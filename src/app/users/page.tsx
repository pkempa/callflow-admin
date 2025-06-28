"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminAPI, Organization } from "@/lib/admin-api";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Ban,
  Check,
  Building,
  X,
  RotateCcw,
} from "lucide-react";

interface DisplayUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  isActive: boolean;
  subscription?: {
    plan: string;
    status: string;
  };
  lastLogin?: string;
}

export default function UsersPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch organizations data
  const {
    data: organizationsResponse,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-organizations"],
    queryFn: () => adminAPI.getOrganizations(),
    enabled: isLoaded && isSignedIn,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

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
        refetch();
        alert("Organization deactivated successfully");
      } else {
        alert(
          `Failed to deactivate organization: ${
            response.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error deactivating organization:", error);
      alert("Failed to deactivate organization");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle organization reactivation
  const handleReactivateOrganization = async (
    organizationId: string,
    organizationName: string
  ) => {
    const confirmed = window.confirm(
      `✅ Reactivate Organization\n\n` +
        `Organization: ${organizationName}\n\n` +
        `This action will:\n` +
        `• Restore full access for all users in this organization\n` +
        `• Re-enable all services and API access\n` +
        `• Allow new user registrations\n` +
        `• Resume normal operations\n\n` +
        `Are you sure you want to reactivate this organization?`
    );

    if (!confirmed) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await adminAPI.reactivateOrganization(organizationId);
      if (response.success) {
        refetch();
        alert("Organization reactivated successfully");
      } else {
        alert(
          `Failed to reactivate organization: ${
            response.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error reactivating organization:", error);
      alert("Failed to reactivate organization");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle organization edit
  const handleEditSubmit = async (formData: any) => {
    if (!selectedOrganization) return;

    setIsUpdating(true);
    try {
      const response = await adminAPI.updateOrganization(
        selectedOrganization.id,
        formData
      );
      if (response.success) {
        refetch();
        setEditModalOpen(false);
        setSelectedOrganization(null);
        alert("Organization updated successfully");
      } else {
        alert(
          `Failed to update organization: ${response.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating organization:", error);
      alert("Failed to update organization");
    } finally {
      setIsUpdating(false);
    }
  };

  // Process organizations data for display
  const organizations = organizationsResponse?.success
    ? organizationsResponse.data?.organizations || []
    : [];

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.industry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && org.is_active !== false) ||
      (filterStatus === "inactive" && org.is_active === false);

    return matchesSearch && matchesFilter;
  });

  if (!isLoaded || !isSignedIn) {
    return null;
  }

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
              Manage and monitor all organizations
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {error && `Error: ${error.message}`}
            {!error && `Showing ${filteredOrganizations.length} organizations`}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
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

          {/* Users Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="text-lg">Loading users...</div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet Balance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrganizations.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {org.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created{" "}
                              {new Date(org.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {org.user_count} users
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                          {org.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {org.team_size || "Not specified"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {org.industry || "Not specified"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {org.is_active === false ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Deactivated
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${org.wallet_balance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrganization(org);
                              setEditModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit organization"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {org.is_active === false ? (
                            <button
                              onClick={() =>
                                handleReactivateOrganization(org.id, org.name)
                              }
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Reactivate organization"
                              disabled={isUpdating}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          ) : isPlatformOrganization(org) ? (
                            <button
                              className="text-gray-400 p-1 rounded cursor-not-allowed"
                              title="Platform organization cannot be deactivated"
                              disabled={true}
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleDeactivateOrganization(org.id, org.name)
                              }
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Deactivate organization"
                              disabled={isUpdating}
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-600">
              Total Organizations
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {organizations.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-600">Total Users</div>
            <div className="text-2xl font-bold text-green-600">
              {organizations.reduce((sum, org) => sum + org.user_count, 0)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-600">
              Completed Onboarding
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {
                organizations.filter((org) => org.team_size && org.industry)
                  .length
              }
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Have team size & industry
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="text-sm font-medium text-gray-600">
              Total Wallet Balance
            </div>
            <div className="text-2xl font-bold text-blue-600">
              $
              {organizations
                .reduce((sum, org) => sum + org.wallet_balance, 0)
                .toFixed(2)}
            </div>
          </div>
        </div>

        {/* Onboarding Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Onboarding Insights
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Team Size Distribution */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Team Size Distribution
                </h3>
                <div className="space-y-2">
                  {["Just me", "2-5 people", "6-20 people", "21+ people"].map(
                    (size) => {
                      const count = organizations.filter(
                        (org) => org.team_size === size
                      ).length;
                      const percentage =
                        organizations.length > 0
                          ? ((count / organizations.length) * 100).toFixed(1)
                          : 0;
                      return (
                        <div
                          key={size}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600">{size}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12 text-right">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Industry Distribution */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Industry Distribution
                </h3>
                <div className="space-y-2">
                  {[
                    "Small Business",
                    "Startup",
                    "Agency",
                    "Consultant",
                    "E-commerce",
                    "Other",
                  ].map((industry) => {
                    const count = organizations.filter(
                      (org) => org.industry === industry
                    ).length;
                    const percentage =
                      organizations.length > 0
                        ? ((count / organizations.length) * 100).toFixed(1)
                        : 0;
                    return (
                      <div
                        key={industry}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600">
                          {industry}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {count} ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Organization Modal */}
        {editModalOpen && selectedOrganization && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Organization
                </h3>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedOrganization(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <EditOrganizationForm
                organization={selectedOrganization}
                onSubmit={handleEditSubmit}
                onCancel={() => {
                  setEditModalOpen(false);
                  setSelectedOrganization(null);
                }}
                isSubmitting={isUpdating}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Edit Organization Form Component
interface EditOrganizationFormProps {
  organization: Organization;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function EditOrganizationForm({
  organization,
  onSubmit,
  onCancel,
  isSubmitting,
}: EditOrganizationFormProps) {
  const [formData, setFormData] = useState({
    name: organization.name || "",
    team_size: organization.team_size || "",
    industry: organization.industry || "",
    plan: organization.plan || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Size
          </label>
          <select
            value={formData.team_size}
            onChange={(e) => handleChange("team_size", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select team size</option>
            <option value="Just me">Just me</option>
            <option value="2-5 people">2-5 people</option>
            <option value="6-20 people">6-20 people</option>
            <option value="21+ people">21+ people</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select industry</option>
            <option value="Small Business">Small Business</option>
            <option value="Startup">Startup</option>
            <option value="Agency">Agency</option>
            <option value="Consultant">Consultant</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="Education">Education</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Plan
          </label>
          <select
            value={formData.plan}
            onChange={(e) => handleChange("plan", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Update Organization"}
        </button>
      </div>
    </form>
  );
}
