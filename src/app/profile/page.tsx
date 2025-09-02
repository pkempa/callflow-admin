"use client";

import React, { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import NewAdminLayout from "@/components/layout/NewAdminLayout";
import { adminAPI } from "@/lib/admin-api";
import { useAdminAuthorization } from "@/hooks/useAdminAuthorization";
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
} from "lucide-react";
import {
  JobTitleSelect,
  DepartmentSelect,
} from "@/components/ui/DropdownSelect";

interface BackendUserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  phone_number?: string;
  job_title?: string;
  department?: string;
  avatar_gradient?: string;
  last_active?: string;
  created_at: string;
  organization?: {
    id: string;
    name: string;
    plan: string;
    team_size: number;
    industry: string;
  };
}

export default function ProfilePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [backendUser, setBackendUser] = useState<BackendUserProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check admin authorization - will redirect to /unauthorized if not authorized
  const {
    isLoading: authLoading,
    isAuthorized,
    userProfile: authorizedProfile,
    error: authError,
  } = useAdminAuthorization();
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    jobTitle: "",
    department: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load user profile from backend - only if authorized
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!isLoaded || !isSignedIn || !isAuthorized || authLoading) return;

      // If we have authorized profile data, use it directly
      if (authorizedProfile) {
        setBackendUser(authorizedProfile);
        setEditForm({
          firstName: authorizedProfile.first_name || "",
          lastName: authorizedProfile.last_name || "",
          phoneNumber: authorizedProfile.phone_number || "",
          jobTitle: authorizedProfile.job_title || "",
          department: authorizedProfile.department || "",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await adminAPI.getUserProfile();

        if (response.success && response.data) {
          setBackendUser(response.data);
          setEditForm({
            firstName: response.data.first_name || "",
            lastName: response.data.last_name || "",
            phoneNumber: response.data.phone_number || "",
            jobTitle: response.data.job_title || "",
            department: response.data.department || "",
          });
        } else {
          setError(response.error || "Failed to load profile");
        }
      } catch {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [isLoaded, isSignedIn, isAuthorized, authLoading, authorizedProfile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSave = async () => {
    if (!backendUser) return;

    setIsSaving(true);
    setError(null);

    try {
      // Update profile via backend API
      const response = await adminAPI.updateUserProfile({
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        phone_number: editForm.phoneNumber,
        job_title: editForm.jobTitle,
        department: editForm.department,
      });

      if (response.success && response.data) {
        setBackendUser(response.data);
        setIsEditing(false);

        // Also update Clerk user if possible (for name display consistency)
        if (user) {
          try {
            await user.update({
              firstName: editForm.firstName,
              lastName: editForm.lastName,
            });
          } catch {
            // Silently handle Clerk update errors
          }
        }
      } else {
        setError(response.error || "Failed to update profile");
      }
    } catch {
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (backendUser) {
      setEditForm({
        firstName: backendUser.first_name || "",
        lastName: backendUser.last_name || "",
        phoneNumber: backendUser.phone_number || "",
        jobTitle: backendUser.job_title || "",
        department: backendUser.department || "",
      });
    }
    setIsEditing(false);
    setError(null);
  };

  // Show loading while checking authorization or loading profile
  if (!isLoaded || authLoading || (isAuthorized && loading)) {
    return (
      <NewAdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-lg">Loading profile...</div>
          </div>
        </div>
      </NewAdminLayout>
    );
  }

  // Don't render anything if not signed in (redirect will happen)
  if (!isSignedIn) {
    return null;
  }

  // Don't render anything if not authorized (redirect to /unauthorized will happen)
  if (!isAuthorized) {
    return null;
  }

  if (error && !backendUser) {
    return (
      <NewAdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </NewAdminLayout>
    );
  }

  const userInitials =
    `${backendUser?.first_name?.charAt(0) || ""}${
      backendUser?.last_name?.charAt(0) || ""
    }`.toUpperCase() || "AD";

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "platform_admin":
        return "Platform Administrator";
      case "platform_member":
        return "Platform Member";
      case "admin":
        return "Administrator";
      case "member":
        return "Member";
      default:
        return role || "Member";
    }
  };

  return (
    <NewAdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-800 border-2 border-gray-300 rounded-lg font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-400 hover:text-blue-700 hover:shadow-lg hover:scale-[1.02] transform transition-all duration-300 disabled:opacity-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Profile Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="h-24 w-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userInitials}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {backendUser?.first_name} {backendUser?.last_name}
                  </h2>
                  <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <Shield className="h-4 w-4 mr-1" />
                    {getRoleDisplay(backendUser?.role || "")}
                  </div>
                </div>
                <p className="text-gray-600 text-lg">{backendUser?.email}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Member since{" "}
                  {backendUser?.created_at
                    ? new Date(backendUser.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : "Unknown"}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            firstName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {backendUser?.first_name || "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) =>
                          setEditForm({ ...editForm, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {backendUser?.last_name || "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{backendUser?.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="e.g., +1-555-123-4567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{backendUser?.phone_number || "—"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Work Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    {isEditing ? (
                      <JobTitleSelect
                        value={editForm.jobTitle}
                        onChange={(value) =>
                          setEditForm({ ...editForm, jobTitle: value })
                        }
                        placeholder="Select job title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {backendUser?.job_title || "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    {isEditing ? (
                      <DepartmentSelect
                        value={editForm.department}
                        onChange={(value) =>
                          setEditForm({
                            ...editForm,
                            department: value,
                          })
                        }
                        placeholder="Select department"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {backendUser?.department || "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <div className="flex items-center text-gray-600">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>{getRoleDisplay(backendUser?.role || "")}</span>
                    </div>
                  </div>

                  {backendUser?.organization && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization
                      </label>
                      <div className="flex items-center text-gray-600">
                        <Building className="h-4 w-4 mr-2" />
                        <span>{backendUser.organization.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <Calendar className="h-5 w-5 mr-2" />
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Account Created:</span>
                <p className="font-medium">
                  {backendUser?.created_at
                    ? new Date(backendUser.created_at).toLocaleDateString()
                    : "Unknown"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium capitalize">
                  {backendUser?.status || "Active"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">User ID:</span>
                <p className="font-mono text-xs bg-white px-2 py-1 rounded border">
                  {backendUser?.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NewAdminLayout>
  );
}
