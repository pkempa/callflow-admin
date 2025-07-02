"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrganizationSelect } from "@/components/ui/OrganizationSelect";
import {
  JobTitleSelect,
  DepartmentSelect,
} from "@/components/ui/DropdownSelect";
import { Organization, adminAPI } from "@/lib/admin-api";
import {
  User,
  Mail,
  Phone,
  Building,
  UserPlus,
  Shield,
  Info,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface CreateUserForm {
  email: string;
  first_name: string;
  last_name: string;
  role: "platform_admin" | "platform_member" | "admin" | "member";
  organization_id?: string;
  organization_name?: string;
  phone_number?: string;
  job_title?: string;
  department?: string;
  team_size?: string;
  industry?: string;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const [formData, setFormData] = useState<CreateUserForm>({
    email: "",
    first_name: "",
    last_name: "",
    role: "platform_member",
    phone_number: "",
    job_title: "",
    department: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.first_name) {
      errors.first_name = "First name is required";
    }

    if (!formData.last_name) {
      errors.last_name = "Last name is required";
    }

    if (!formData.organization_id) {
      errors.organization_id =
        "Please search and select an organization from the dropdown";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createData = {
        ...formData,
        organization_name: selectedOrganization?.name,
      };

      const response = await adminAPI.createPlatformUser(createData);

      if (response.success) {
        // Reset form
        setFormData({
          email: "",
          first_name: "",
          last_name: "",
          role: "platform_member",
          phone_number: "",
          job_title: "",
          department: "",
        });
        setSelectedOrganization(null);
        setFormErrors({});

        onSuccess();
        onClose();
      } else {
        setError(response.error || "Failed to create user");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create user"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form after close
      setTimeout(() => {
        setFormData({
          email: "",
          first_name: "",
          last_name: "",
          role: "platform_member",
          phone_number: "",
          job_title: "",
          department: "",
        });
        setSelectedOrganization(null);
        setFormErrors({});
        setError(null);
      }, 200);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "platform_admin":
        return "Full platform access";
      case "platform_member":
        return "Limited platform access";
      case "admin":
        return "Organization administrator";
      case "member":
        return "Standard member";
      default:
        return "";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "platform_admin":
        return <Shield className="h-4 w-4 text-red-500" />;
      case "platform_member":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "admin":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "member":
        return <User className="h-4 w-4 text-slate-500" />;
      default:
        return <User className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose} size="xl">
      <DialogContent className="!max-w-4xl w-full max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-3 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-indigo-600" />
            Create Platform User
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {/* Organization Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Organization <span className="text-red-500">*</span>
              </label>
              <OrganizationSelect
                value={formData.organization_id}
                onChange={(orgId, org) => {
                  setSelectedOrganization(org);
                  setFormData((prev) => ({
                    ...prev,
                    organization_id: orgId,
                  }));
                  // Clear error when valid selection is made
                  if (orgId && formErrors.organization_id) {
                    setFormErrors((prev) => ({ ...prev, organization_id: "" }));
                  }
                }}
                error={formErrors.organization_id}
                className="h-8"
              />
              {formErrors.organization_id ? (
                <p className="mt-1 text-xs text-red-600">
                  {formErrors.organization_id}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-500">
                  Type to search organizations by name, account number, or ID,
                  then select from results
                </p>
              )}
            </div>

            {/* Personal Information - Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  state={formErrors.email ? "error" : "default"}
                  helperText={formErrors.email}
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone_number: e.target.value,
                    }))
                  }
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Work Information - Grid Layout */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Job Title
                </label>
                <JobTitleSelect
                  value={formData.job_title || ""}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, job_title: value }))
                  }
                  placeholder="Select an option..."
                  className="h-10"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Department
                </label>
                <DepartmentSelect
                  value={formData.department || ""}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, department: value }))
                  }
                  placeholder="Select an option..."
                  className="h-10"
                />
              </div>
            </div>

            {/* Role Selection - Enhanced */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Role & Permissions
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "platform_member",
                    label: "Platform Member",
                    description: "View platform data, manage own profile",
                    icon: <Shield className="h-4 w-4 text-blue-500" />,
                    color: "blue",
                    permissions: [
                      "View platform analytics",
                      "Manage own profile",
                      "Access support",
                    ],
                  },
                  {
                    value: "platform_admin",
                    label: "Platform Administrator",
                    description: "Full platform control, manage all users",
                    icon: <Shield className="h-4 w-4 text-red-500" />,
                    color: "red",
                    permissions: [
                      "Full platform access",
                      "Manage all users",
                      "System administration",
                    ],
                  },
                  {
                    value: "member",
                    label: "Organization Member",
                    description: "Standard org access, basic features",
                    icon: <User className="h-4 w-4 text-slate-500" />,
                    color: "slate",
                    permissions: [
                      "Organization features",
                      "Basic phone access",
                      "View reports",
                    ],
                  },
                  {
                    value: "admin",
                    label: "Organization Admin",
                    description: "Manage org users, settings, billing",
                    icon: <UserPlus className="h-4 w-4 text-green-500" />,
                    color: "green",
                    permissions: [
                      "Manage org users",
                      "Billing control",
                      "Admin settings",
                    ],
                  },
                ].map((role) => {
                  const isSelected = formData.role === role.value;

                  // Define color classes for each role
                  const getColorClasses = (
                    color: string,
                    isSelected: boolean
                  ) => {
                    if (!isSelected) {
                      return {
                        container:
                          "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                        badge: "bg-slate-500",
                        title: "text-slate-700",
                        description: "text-slate-500",
                        dot: "bg-slate-300",
                        permission: "text-slate-400",
                      };
                    }

                    switch (color) {
                      case "blue":
                        return {
                          container:
                            "border-blue-500 bg-blue-50 shadow-lg shadow-blue-200/50 ring-1 ring-blue-500/20",
                          badge: "bg-blue-500",
                          title: "text-blue-700",
                          description: "text-blue-600",
                          dot: "bg-blue-400",
                          permission: "text-blue-600",
                        };
                      case "red":
                        return {
                          container:
                            "border-red-500 bg-red-50 shadow-lg shadow-red-200/50 ring-1 ring-red-500/20",
                          badge: "bg-red-500",
                          title: "text-red-700",
                          description: "text-red-600",
                          dot: "bg-red-400",
                          permission: "text-red-600",
                        };
                      case "green":
                        return {
                          container:
                            "border-green-500 bg-green-50 shadow-lg shadow-green-200/50 ring-1 ring-green-500/20",
                          badge: "bg-green-500",
                          title: "text-green-700",
                          description: "text-green-600",
                          dot: "bg-green-400",
                          permission: "text-green-600",
                        };
                      case "slate":
                        return {
                          container:
                            "border-slate-600 bg-slate-50 shadow-lg shadow-slate-200/50 ring-1 ring-slate-500/20",
                          badge: "bg-slate-600",
                          title: "text-slate-700",
                          description: "text-slate-600",
                          dot: "bg-slate-400",
                          permission: "text-slate-600",
                        };
                      default:
                        return {
                          container:
                            "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
                          badge: "bg-slate-500",
                          title: "text-slate-700",
                          description: "text-slate-500",
                          dot: "bg-slate-300",
                          permission: "text-slate-400",
                        };
                    }
                  };

                  const colors = getColorClasses(role.color, isSelected);

                  return (
                    <label
                      key={role.value}
                      className={`relative flex flex-col p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${colors.container}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={isSelected}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            role: e.target.value as CreateUserForm["role"],
                          }))
                        }
                        className="sr-only"
                      />

                      {/* Selected indicator */}
                      {isSelected && (
                        <div
                          className={`absolute -top-1 -right-1 w-5 h-5 ${colors.badge} text-white rounded-full flex items-center justify-center`}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </div>
                      )}

                      {/* Role header */}
                      <div className="flex items-center gap-2 mb-2">
                        {role.icon}
                        <span
                          className={`text-sm font-semibold ${colors.title}`}
                        >
                          {role.label}
                        </span>
                      </div>

                      {/* Description */}
                      <p className={`text-xs mb-2 ${colors.description}`}>
                        {role.description}
                      </p>

                      {/* Permissions list */}
                      <div className="space-y-1">
                        {role.permissions.map((permission, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <div
                              className={`w-1 h-1 rounded-full ${colors.dot}`}
                            />
                            <span className={`text-xs ${colors.permission}`}>
                              {permission}
                            </span>
                          </div>
                        ))}
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Role info banner */}
              <div className="flex items-start gap-2 p-2 mt-2 bg-amber-50 border border-amber-200 rounded-lg">
                <Info className="h-3 w-3 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-700">
                  <strong>Role Guide:</strong> Platform roles manage the entire
                  system, while Organization roles are limited to specific
                  organizations. Only platform administrators can change user
                  roles.
                </div>
              </div>
            </div>

            {/* User Creation Info */}
            <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <strong>User Creation Process:</strong> All users are created
                with "INVITED" status and will receive a Clerk invitation email
                to set up their account. They become "ACTIVE" after completing
                the setup process.
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-end gap-2 pt-3 pb-6 px-6 border-t border-slate-200 flex-shrink-0 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="h-8 px-3 text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-8 px-4 text-sm"
            >
              {loading ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
