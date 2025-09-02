"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  Building,
  UserCheck,
  UserX,
  Crown,
  User,
} from "lucide-react";
import NewAdminLayout from "@/components/layout/NewAdminLayout";
import {
  Card,
  Button,
  Badge,
  Input,
  LoadingSpinner,
  EmptyState,
  StatusIndicator,
} from "@/components/ui/design-system";
import { formatDate, formatRelativeTime, getInitials } from "@/lib/utils";

interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: "admin" | "user" | "manager" | "support";
  status: "active" | "inactive" | "suspended" | "pending";
  organizationId: string;
  organizationName: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  permissions: string[];
  avatar?: string;
  isVerified: boolean;
  loginCount: number;
}

// Mock data for demonstration
const mockUsers: UserRecord[] = [
  {
    id: "user_1",
    email: "john.smith@acmecorp.com",
    firstName: "John",
    lastName: "Smith",
    phone: "+1 (555) 123-4567",
    role: "admin",
    status: "active",
    organizationId: "org_1",
    organizationName: "Acme Corp",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T08:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    permissions: ["read", "write", "delete", "admin"],
    isVerified: true,
    loginCount: 45,
  },
  {
    id: "user_2",
    email: "sarah.johnson@techstart.com",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "+1 (555) 987-6543",
    role: "manager",
    status: "active",
    organizationId: "org_2",
    organizationName: "TechStart Inc",
    lastLogin: "2024-01-14T16:45:00Z",
    createdAt: "2024-01-05T09:15:00Z",
    updatedAt: "2024-01-14T16:45:00Z",
    permissions: ["read", "write"],
    isVerified: true,
    loginCount: 23,
  },
  {
    id: "user_3",
    email: "mike.wilson@example.com",
    firstName: "Mike",
    lastName: "Wilson",
    role: "user",
    status: "pending",
    organizationId: "org_1",
    organizationName: "Acme Corp",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-14T14:20:00Z",
    permissions: ["read"],
    isVerified: false,
    loginCount: 0,
  },
  {
    id: "user_4",
    email: "lisa.brown@support.com",
    firstName: "Lisa",
    lastName: "Brown",
    phone: "+1 (555) 456-7890",
    role: "support",
    status: "active",
    organizationId: "org_3",
    organizationName: "Support Solutions",
    lastLogin: "2024-01-15T09:20:00Z",
    createdAt: "2023-12-15T10:00:00Z",
    updatedAt: "2024-01-15T09:20:00Z",
    permissions: ["read", "write"],
    isVerified: true,
    loginCount: 78,
  },
  {
    id: "user_5",
    email: "david.lee@inactive.com",
    firstName: "David",
    lastName: "Lee",
    role: "user",
    status: "suspended",
    organizationId: "org_2",
    organizationName: "TechStart Inc",
    lastLogin: "2023-12-20T11:30:00Z",
    createdAt: "2023-11-01T12:00:00Z",
    updatedAt: "2024-01-10T15:00:00Z",
    permissions: ["read"],
    isVerified: true,
    loginCount: 12,
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate API call
    const loadUsers = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUsers(mockUsers);
      setLoading(false);
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.organizationName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesOrganization =
      organizationFilter === "all" ||
      user.organizationId === organizationFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesOrganization;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "neutral";
      case "suspended":
        return "error";
      case "pending":
        return "warning";
      default:
        return "neutral";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-600 bg-red-50";
      case "manager":
        return "text-purple-600 bg-purple-50";
      case "support":
        return "text-blue-600 bg-blue-50";
      case "user":
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return Crown;
      case "manager":
        return Shield;
      case "support":
        return UserCheck;
      case "user":
        return User;
      default:
        return User;
    }
  };

  const uniqueOrganizations = Array.from(
    new Set(users.map((u) => u.organizationId))
  );

  if (loading) {
    return (
      <NewAdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </NewAdminLayout>
    );
  }

  return (
    <NewAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-gray-600 ml-2">vs last month</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.status === "active").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">+5%</span>
                <span className="text-gray-600 ml-2">vs last month</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.status === "pending").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <UserX className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-yellow-600 font-medium">2 new</span>
                <span className="text-gray-600 ml-2">this week</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.role === "admin").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-600">Privileged accounts</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name, email, or organization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="support">Support</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={organizationFilter}
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Organizations</option>
                  {uniqueOrganizations.map((orgId) => {
                    const org = users.find((u) => u.organizationId === orgId);
                    return (
                      <option key={orgId} value={orgId}>
                        {org?.organizationName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* User List */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Users ({filteredUsers.length})
            </h2>
            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No users found"
                description="No users match your current filters."
              />
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {getInitials(
                                    `${user.firstName} ${user.lastName}`
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </h3>
                              <Badge variant={getStatusColor(user.status)}>
                                {user.status}
                              </Badge>
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                                  user.role
                                )}`}
                              >
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {user.role}
                              </div>
                              {user.isVerified && (
                                <Badge variant="success" size="sm">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center">
                                <Mail className="w-4 h-4 mr-1" />
                                {user.email}
                              </span>
                              {user.phone && (
                                <span className="flex items-center">
                                  <Phone className="w-4 h-4 mr-1" />
                                  {user.phone}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Building className="w-4 h-4 mr-1" />
                                {user.organizationName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Joined {formatRelativeTime(user.createdAt)}
                              </span>
                              {user.lastLogin && (
                                <span>
                                  Last login{" "}
                                  {formatRelativeTime(user.lastLogin)}
                                </span>
                              )}
                              <span>{user.loginCount} logins</span>
                            </div>
                            {user.permissions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {user.permissions.map((permission, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                  >
                                    {permission}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </NewAdminLayout>
  );
}
