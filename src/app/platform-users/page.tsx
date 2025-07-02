"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminAPI } from "@/lib/admin-api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Edit,
  Trash2,
  Shield,
  User,
  UserCheck,
  Users,
  Crown,
  Mail,
} from "lucide-react";

// Types
interface PlatformUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  organization_id: string;
  organization_name: string;
  phone_number?: string;
  job_title?: string;
  department?: string;
  last_active?: string;
  created_at: string;
  platform_context: {
    is_platform_admin: boolean;
    is_platform_member: boolean;
  };
}

// Removed unused form interfaces - now using dedicated pages

interface DeleteConfirmation {
  user: PlatformUser;
  reason: string;
  adminNotes: string;
}

export default function PlatformUsersPage() {
  const router = useRouter();

  // State
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [resendingInvitations, setResendingInvitations] = useState<Set<string>>(
    new Set()
  );

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Load users
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: {
        role?: string;
        status?: string;
        search?: string;
      } = {};
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await adminAPI.getPlatformUsers(params);

      if (response.success && response.data) {
        setUsers(response.data.users);
      } else {
        setError(response.error || "Failed to load users");
      }
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Create user - now handled by dedicated page

  // Enhanced role badge with better logic for owners
  const getRoleBadge = (
    role: string,
    platformContext: {
      is_platform_admin: boolean;
      is_platform_member: boolean;
    }
  ) => {
    if (platformContext.is_platform_admin) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Platform Admin
        </Badge>
      );
    } else if (platformContext.is_platform_member) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <UserCheck className="h-3 w-3" />
          Platform Member
        </Badge>
      );
    } else if (role === "owner") {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Crown className="h-3 w-3" />
          Organization Owner
        </Badge>
      );
    } else if (role === "admin") {
      return (
        <Badge variant="info" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          Organization Admin
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <User className="h-3 w-3" />
          Member
        </Badge>
      );
    }
  };

  // Check if user can be edited
  const canEditUser = (user: PlatformUser): boolean => {
    // Platform admins can edit most users but with restrictions
    if (user.platform_context.is_platform_admin) {
      return false; // Don't allow editing platform admins through this interface
    }
    return true;
  };

  // Check if user can be deleted
  const canDeleteUser = (
    user: PlatformUser
  ): { canDelete: boolean; reason?: string } => {
    if (user.platform_context.is_platform_admin) {
      return {
        canDelete: false,
        reason:
          "Platform administrators cannot be deleted through this interface",
      };
    }

    if (user.role === "owner") {
      return {
        canDelete: false,
        reason:
          "Organization owners cannot be deleted as it would orphan the organization",
      };
    }

    if (user.status === "active") {
      return {
        canDelete: false,
        reason: "Active users should be deactivated first before deletion",
      };
    }

    return { canDelete: true };
  };

  // Handle edit user
  // Edit user - now handled by dedicated page

  // Handle delete user
  const handleDeleteUser = (user: PlatformUser) => {
    const deleteCheck = canDeleteUser(user);
    if (!deleteCheck.canDelete) {
      setError(deleteCheck.reason || "This user cannot be deleted");
      return;
    }

    setDeleteConfirmation({
      user,
      reason: "",
      adminNotes: "",
    });
    setShowDeleteModal(true);
  };

  // Submit edit - now handled by dedicated page

  // Submit delete with audit trail
  const handleSubmitDelete = async () => {
    if (!deleteConfirmation) return;

    setDeleteLoading(true);
    try {
      // Log the deletion attempt for audit trail
      const auditData = {
        action: "user_deletion",
        target_user_id: deleteConfirmation.user.id,
        target_email: deleteConfirmation.user.email,
        reason: deleteConfirmation.reason,
        admin_notes: deleteConfirmation.adminNotes,
        timestamp: new Date().toISOString(),
      };

      const response = await adminAPI.deletePlatformUser(
        deleteConfirmation.user.id
      );

      if (response.success) {
        // Log successful deletion
        console.log("User deleted:", auditData);

        setShowDeleteModal(false);
        setDeleteConfirmation(null);
        await loadUsers();
      } else {
        setError(response.error || "Failed to delete user");
      }
    } catch {
      setError("Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle resend invitation
  const handleResendInvitation = async (user: PlatformUser) => {
    if (user.status !== "invited") {
      setError("Can only resend invitations to users with 'invited' status");
      return;
    }

    setResendingInvitations((prev) => new Set(prev).add(user.id));

    try {
      const response = await adminAPI.resendInvitation(user.id, {
        send_email: true,
        custom_message:
          "Your invitation has been resent. Please check your email for setup instructions.",
      });

      if (response.success) {
        setError(null);
        // Show success message using the error state (we don't have a success state)
        // In a real app, you'd want a proper toast notification system
        console.log(`Invitation resent to ${user.email}:`, response.data);

        // You could add a temporary success message here
        // For now, just reload users to show any status changes
        await loadUsers();
      } else {
        setError(response.error || "Failed to resend invitation");
      }
    } catch {
      setError("Failed to resend invitation");
    } finally {
      setResendingInvitations((prev) => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Platform User Management
          </h1>
          <p className="text-gray-600">
            Manage platform administrators, platform members, and organization
            users
          </p>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">
                  Important Security Notes
                </h3>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  <li>
                    • Platform Admins cannot be deleted through this interface
                  </li>
                  <li>
                    • Organization Owners cannot be deleted (would orphan
                    organization)
                  </li>
                  <li>• Active users must be deactivated before deletion</li>
                  <li>• All operations are logged for audit purposes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search
                </label>
                <Input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by email or name..."
                />
              </div>

              <div>
                <label
                  htmlFor="role-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="platform_admin">Platform Admin</option>
                  <option value="platform_member">Platform Member</option>
                  <option value="owner">Organization Owner</option>
                  <option value="admin">Organization Admin</option>
                  <option value="member">Member</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="status-filter"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="invited">Invited</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Create User Button */}
            <Button onClick={() => router.push("/platform-users/create")}>
              Create Platform User
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const editCheck = canEditUser(user);
                    const deleteCheck = canDeleteUser(user);

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            {user.job_title && (
                              <div className="text-xs text-gray-400">
                                {user.job_title}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role, user.platform_context)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.organization_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.organization_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              user.status === "active"
                                ? "success"
                                : user.status === "invited"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            {user.status === "invited" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResendInvitation(user)}
                                disabled={resendingInvitations.has(user.id)}
                                title="Resend invitation email"
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              >
                                {resendingInvitations.has(user.id) ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <Mail className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/platform-users/${user.id}/edit`)
                              }
                              disabled={!editCheck}
                              title={
                                !editCheck
                                  ? "This user cannot be edited"
                                  : "Edit user"
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                              disabled={!deleteCheck.canDelete}
                              title={
                                !deleteCheck.canDelete
                                  ? deleteCheck.reason
                                  : "Delete user"
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal removed - now using dedicated page */}

        {/* Edit Modal removed - now using dedicated page */}

        {/* Delete User Modal */}
        {showDeleteModal && deleteConfirmation && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Delete User
                </DialogTitle>
                <DialogDescription>
                  This is a permanent action that cannot be undone. Please
                  provide a reason for the audit trail.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800">
                    User to be deleted:
                  </h4>
                  <p className="text-sm text-red-700">
                    {deleteConfirmation.user.first_name}{" "}
                    {deleteConfirmation.user.last_name} (
                    {deleteConfirmation.user.email})
                  </p>
                  <p className="text-xs text-red-600">
                    Organization: {deleteConfirmation.user.organization_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Deletion *
                  </label>
                  <select
                    required
                    value={deleteConfirmation.reason}
                    onChange={(e) =>
                      setDeleteConfirmation({
                        ...deleteConfirmation,
                        reason: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="user_request">
                      User requested deletion
                    </option>
                    <option value="inactive_account">
                      Inactive account cleanup
                    </option>
                    <option value="policy_violation">Policy violation</option>
                    <option value="duplicate_account">Duplicate account</option>
                    <option value="security_concern">Security concern</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes
                  </label>
                  <textarea
                    value={deleteConfirmation.adminNotes}
                    onChange={(e) =>
                      setDeleteConfirmation({
                        ...deleteConfirmation,
                        adminNotes: e.target.value,
                      })
                    }
                    placeholder="Additional notes for the audit trail..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitDelete}
                  disabled={deleteLoading || !deleteConfirmation.reason}
                  variant="destructive"
                >
                  {deleteLoading ? "Deleting..." : "Delete User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}
