"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import NewAdminLayout from "@/components/layout/NewAdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  JobTitleSelect,
  DepartmentSelect,
} from "@/components/ui/DropdownSelect";
import { adminAPI } from "@/lib/admin-api";
import {
  ArrowLeft,
  User,
  Phone,
  Building,
  Shield,
  AlertCircle,
  Save,
  CheckCircle,
  Mail,
  AlertTriangle,
} from "lucide-react";

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

interface EditUserForm {
  first_name: string;
  last_name: string;
  phone_number?: string;
  job_title?: string;
  department?: string;
  status: string;
}

export default function EditPlatformUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<PlatformUser | null>(null);

  const [formData, setFormData] = useState<EditUserForm>({
    first_name: "",
    last_name: "",
    phone_number: "",
    job_title: "",
    department: "",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getPlatformUsers();

        if (response.success && response.data) {
          const foundUser = response.data.users.find((u) => u.id === userId);
          if (foundUser) {
            setUser(foundUser);
            setFormData({
              first_name: foundUser.first_name,
              last_name: foundUser.last_name,
              phone_number: foundUser.phone_number || "",
              job_title: foundUser.job_title || "",
              department: foundUser.department || "",
              status: foundUser.status,
            });
          } else {
            setError("User not found");
          }
        } else {
          setError(response.error || "Failed to load user");
        }
      } catch (error) {
        setError("Failed to load user");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await adminAPI.updatePlatformUser(userId, formData);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/platform-users");
        }, 2000);
      } else {
        setError(response.error || "Failed to update user");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResendInvitation = async () => {
    if (!user || user.status !== "invited") return;

    try {
      const response = await adminAPI.resendInvitation(user.id, {
        send_email: true,
        custom_message:
          "Your invitation has been resent. Please check your email for setup instructions.",
      });

      if (response.success) {
        setError(null);
        alert("Invitation resent successfully!");
      } else {
        setError(response.error || "Failed to resend invitation");
      }
    } catch (error) {
      setError("Failed to resend invitation");
    }
  };

  const canEditUser = (user: PlatformUser): boolean => {
    if (user.platform_context.is_platform_admin) {
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <NewAdminLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-slate-600">Loading user...</span>
          </div>
        </div>
      </NewAdminLayout>
    );
  }

  if (error && !user) {
    return (
      <NewAdminLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Error Loading User
            </h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button onClick={() => router.push("/platform-users")}>
              Back to Users
            </Button>
          </div>
        </div>
      </NewAdminLayout>
    );
  }

  if (success) {
    return (
      <NewAdminLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              User Updated Successfully!
            </h1>
            <p className="text-slate-600 mb-6">
              The user profile has been updated with the new information.
            </p>
            <p className="text-sm text-slate-500">
              Redirecting to platform users list...
            </p>
          </div>
        </div>
      </NewAdminLayout>
    );
  }

  if (!user) {
    return null;
  }

  const editAllowed = canEditUser(user);

  return (
    <NewAdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/platform-users")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Button>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
            <User className="h-6 w-6 text-indigo-600" />
            Edit User: {user.first_name} {user.last_name}
          </h1>
          <p className="text-slate-600 mt-2">
            Update user information and account settings.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* User Info Summary */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
              {user.first_name[0]}
              {user.last_name[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">
                {user.email}
              </h2>
              <p className="text-slate-600 text-sm">{user.organization_name}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {user.role}
                </Badge>
                <Badge
                  variant={
                    user.status === "active"
                      ? "success"
                      : user.status === "invited"
                      ? "warning"
                      : "destructive"
                  }
                  className="text-xs capitalize"
                >
                  {user.status}
                </Badge>
              </div>
            </div>
            {user.status === "invited" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendInvitation}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Resend Invitation
              </Button>
            )}
          </div>
        </div>

        {!editAllowed ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="font-medium text-amber-800">Edit Restricted</h3>
            </div>
            <p className="text-amber-700 mt-2">
              This user cannot be edited through this interface. Platform
              administrators require special handling for security reasons.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-medium text-slate-900">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    state={formErrors.first_name ? "error" : "default"}
                    helperText={formErrors.first_name}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    state={formErrors.last_name ? "error" : "default"}
                    helperText={formErrors.last_name}
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel"
                      value={formData.phone_number || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone_number: e.target.value,
                        }))
                      }
                      className="h-10 pl-10"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Building className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-medium text-slate-900">
                  Work Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Job Title
                  </label>
                  <JobTitleSelect
                    value={formData.job_title || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        job_title: value,
                      }))
                    }
                    placeholder="Select job title"
                    className="h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>
                  <DepartmentSelect
                    value={formData.department || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        department: value,
                      }))
                    }
                    placeholder="Select department"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-slate-500" />
                <h2 className="text-lg font-medium text-slate-900">
                  Account Status
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full h-10 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active - Full platform access</option>
                  <option value="suspended">Suspended - Access blocked</option>
                </select>
                <p className="mt-1 text-sm text-slate-500">
                  Suspended status blocks user access while preserving data.
                  Invited status is managed automatically.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/platform-users")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="min-w-[120px]">
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </div>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </NewAdminLayout>
  );
}
