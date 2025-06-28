// API configuration - using same base URL as main frontend
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ca6ofgmah9.execute-api.us-east-1.amazonaws.com/prod";

// API response types (matching main frontend)
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  plan: string;
  team_size: string;
  industry: string;
  user_count: number;
  subscription_status?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  wallet_balance: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  phone_number?: string;
  job_title?: string;
  department?: string;
  last_active?: string;
  created_at?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_period: string;
  features: string[];
  is_active: boolean;
}

export interface Parameter {
  name: string;
  value?: string;
  value_preview?: string;
  type: "String" | "SecureString" | "StringList";
  version: number;
  last_modified: string;
  description: string;
  tags: Array<{ Key: string; Value: string }>;
  history?: Array<{
    version: number;
    last_modified: string;
    modified_by: string;
    description: string;
    value_changed: boolean;
  }>;
  allowed_pattern?: string;
  tier?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ActivityLog {
  id: string;
  activity_type: string;
  user_id: string;
  organization_id: string;
  description: string;
  metadata: Record<string, any>;
  user_name?: string;
  organization_name?: string;
  created_at: string;
  updated_at: string;
}

// Global auth helper - same pattern as main frontend
let getAuthToken: (() => Promise<string | null>) | null = null;
let signOutUser: (() => Promise<void>) | null = null;

// Set the auth token getter (called from components that have access to useAuth)
export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  getAuthToken = getter;
}

// Set the sign out function (called from components that have access to useAuth)
export function setSignOutFunction(signOut: () => Promise<void>) {
  signOutUser = signOut;
}

// Helper function to check if auth is ready
export function isAuthReady(): boolean {
  return getAuthToken !== null;
}

// Generic API request function with automatic authentication and first-user setup
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    // Automatically add authentication if available and required
    if (requireAuth) {
      if (!getAuthToken) {
        console.error(
          "🚨 Admin API request requires auth but no auth token getter available"
        );
        console.log("🔍 Debug: endpoint =", endpoint);
        return {
          success: false,
          error: "Authentication not available - please try again",
        };
      }

      try {
        console.log("🔑 Getting auth token for admin API request:", endpoint);
        const token = await getAuthToken();
        if (token) {
          console.log("✅ Admin auth token obtained, length:", token.length);
          headers.Authorization = `Bearer ${token}`;

          // Extract user ID from JWT token and add as header for backend
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.sub;
            if (userId) {
              headers["X-Clerk-User-Id"] = userId;
              console.log("✅ Added Clerk User ID to headers:", userId);
            }
          } catch (jwtError) {
            console.warn("⚠️ Could not extract user ID from JWT:", jwtError);
          }
        } else {
          console.error("❌ No admin auth token available");
          return {
            success: false,
            error: "No authentication token available",
          };
        }
      } catch (error) {
        console.error("❌ Failed to get admin auth token:", error);
        return {
          success: false,
          error: "Failed to get authentication token",
        };
      }
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    // Handle authentication errors with auto-setup retry
    if (response.status === 401 || response.status === 403) {
      console.warn(
        `🚨 Admin authentication failed with status ${response.status}`
      );

      // If this is not the setup endpoint itself, try auto-setup first
      if (!endpoint.includes("/setup-first-user")) {
        console.log("🔄 Attempting auto-setup for new admin user...");

        try {
          const setupResponse = await adminAPI.setupFirstUser();
          if (setupResponse.success && setupResponse.data?.user_created) {
            console.log(
              "✅ Auto-setup successful, retrying original request..."
            );

            // Retry the original request
            const retryResponse = await fetch(url, {
              headers,
              ...options,
            });

            if (retryResponse.ok) {
              const retryData: ApiResponse<T> = await retryResponse.json();
              return retryData;
            }
          }
        } catch (setupError) {
          console.error("❌ Auto-setup failed:", setupError);
        }
      }

      return {
        success: false,
        error: `Authentication failed (${response.status})`,
      };
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
    console.error("Admin API request failed:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Admin API functions
export const adminAPI = {
  // Organizations API
  getOrganizations: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      plan?: string;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.plan) queryParams.append("plan", params.plan);

    const response = await apiRequest<{
      organizations: Organization[];
      pagination: PaginationInfo;
      filters: { search: string; plan: string };
    }>(`/admin/organizations?${queryParams}`);

    return response;
  },

  // Organization Management API - for platform admins only
  updateOrganization: async (
    organizationId: string,
    data: {
      name?: string;
      team_size?: string;
      industry?: string;
      plan?: string;
    }
  ) => {
    const response = await apiRequest<{
      id: string;
      name: string;
      plan: string;
      team_size: string;
      industry: string;
      is_active: boolean;
      updated_at: string;
    }>(`/admin/organizations/${organizationId}`, {
      method: "PUT",
      body: JSON.stringify({
        action: "edit",
        ...data,
      }),
    });

    return response;
  },

  deactivateOrganization: async (organizationId: string) => {
    const response = await apiRequest<{
      id: string;
      name: string;
      is_active: boolean;
      updated_at: string;
    }>(`/admin/organizations/${organizationId}`, {
      method: "PUT",
      body: JSON.stringify({
        action: "deactivate",
      }),
    });

    return response;
  },

  reactivateOrganization: async (organizationId: string) => {
    const response = await apiRequest<{
      id: string;
      name: string;
      is_active: boolean;
      updated_at: string;
    }>(`/admin/organizations/${organizationId}`, {
      method: "PUT",
      body: JSON.stringify({
        action: "reactivate",
      }),
    });

    return response;
  },

  // Users API - for admin users (new endpoint)
  getAdminUsers: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      organization_id?: string;
      status?: string;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.organization_id)
      queryParams.append("organization_id", params.organization_id);
    if (params.status) queryParams.append("status", params.status);

    const response = await apiRequest<{
      users: User[];
      pagination: PaginationInfo;
      filters: { search: string; organization_id: string; status: string };
      admin_context: {
        is_platform_admin: boolean;
        user_organization_id: string;
      };
    }>(`/admin/users?${queryParams}`);

    return response;
  },

  // Legacy Users API - for specific organization
  getUsers: async (organizationId: string) => {
    const response = await apiRequest<{ users: User[] }>(
      `/users?organization_id=${organizationId}`
    );
    return response;
  },

  // Analytics API - for admin dashboard
  getAnalytics: async (
    params: {
      period?: "7d" | "30d" | "90d" | "1y";
      organization_id?: string;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.append("period", params.period);
    if (params.organization_id)
      queryParams.append("organization_id", params.organization_id);

    const response = await apiRequest<{
      summary: {
        total_organizations: number;
        total_users: number;
        active_users: number;
        total_wallet_balance: number;
        recent_registrations: number;
        period: string;
        date_range: { start: string; end: string };
      };
      growth_metrics: {
        user_growth_percentage: number;
        organization_growth_percentage: number;
        revenue_growth_percentage: number;
      };
      distributions: {
        plans: Record<string, number>;
        user_roles: Record<string, number>;
        top_plans: [string, number][];
      };
      admin_context: {
        is_platform_admin: boolean;
        user_organization_id: string;
        organizations_analyzed: number;
      };
    }>(`/admin/analytics?${queryParams}`);

    return response;
  },

  // Plans API
  getPlans: async (
    params: {
      include_inactive?: boolean;
      paid_only?: boolean;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.include_inactive) queryParams.append("include_inactive", "true");
    if (params.paid_only) queryParams.append("paid_only", "true");

    const response = await apiRequest<{ plans: Plan[] }>(
      `/plans?${queryParams}`
    );
    return response;
  },

  // Parameter Management API - for platform admins
  getParameters: async (
    params: {
      prefix?: string;
      include_values?: boolean;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.prefix) queryParams.append("prefix", params.prefix);
    if (params.include_values) queryParams.append("include_values", "true");

    const response = await apiRequest<{
      parameters: Parameter[];
      categories: Record<string, Parameter[]>;
      total_count: number;
      prefix: string;
      include_values: boolean;
    }>(`/admin/parameters?${queryParams}`);

    return response;
  },

  getParameter: async (parameterName: string) => {
    const response = await apiRequest<{
      parameter: Parameter;
    }>(`/admin/parameters/${encodeURIComponent(parameterName)}`);

    return response;
  },

  updateParameter: async (
    parameterName: string,
    data: {
      value: string;
      description?: string;
      type?: "String" | "SecureString" | "StringList";
      overwrite?: boolean;
      tags?: Array<{ Key: string; Value: string }>;
    }
  ) => {
    const response = await apiRequest<{
      parameter_name: string;
      version: number;
      tier: string;
    }>(`/admin/parameters/${encodeURIComponent(parameterName)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response;
  },

  createParameter: async (data: {
    name: string;
    value: string;
    description?: string;
    type?: "String" | "SecureString" | "StringList";
    tags?: Array<{ Key: string; Value: string }>;
  }) => {
    const response = await apiRequest<{
      parameter_name: string;
      version: number;
      tier: string;
    }>(`/admin/parameters`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response;
  },

  deleteParameter: async (parameterName: string) => {
    const response = await apiRequest<{
      parameter_name: string;
    }>(`/admin/parameters/${encodeURIComponent(parameterName)}`, {
      method: "DELETE",
    });

    return response;
  },

  // Platform User Management API - for platform admins only
  createPlatformUser: async (data: {
    email: string;
    first_name: string;
    last_name: string;
    role: "platform_admin" | "platform_member" | "admin" | "member";
    organization_id?: string;
    organization_name?: string;
    clerk_user_id?: string;
    phone_number?: string;
    job_title?: string;
    department?: string;
    send_invitation?: boolean;
    team_size?: string;
    industry?: string;
    plan?: string;
  }) => {
    const response = await apiRequest<{
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        status: string;
        created_at: string;
      };
      organization: {
        id: string;
        name: string;
        plan: string;
      };
      platform_context: {
        is_platform_admin: boolean;
        is_platform_member: boolean;
        invitation_sent: boolean;
        requires_clerk_setup: boolean;
      };
    }>("/admin/platform-users", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response;
  },

  getPlatformUsers: async (
    params: {
      role?: string;
      organization_id?: string;
      status?: string;
      search?: string;
      page?: number;
      page_size?: number;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.role) queryParams.append("role", params.role);
    if (params.organization_id)
      queryParams.append("organization_id", params.organization_id);
    if (params.status) queryParams.append("status", params.status);
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.page_size)
      queryParams.append("page_size", params.page_size.toString());

    const response = await apiRequest<{
      users: Array<{
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
      }>;
      pagination: PaginationInfo;
      filters: {
        role?: string;
        organization_id?: string;
        status?: string;
        search?: string;
      };
    }>(`/admin/platform-users?${queryParams}`);

    return response;
  },

  updatePlatformUser: async (
    userId: string,
    data: {
      first_name?: string;
      last_name?: string;
      role?: string;
      status?: string;
      phone_number?: string;
      job_title?: string;
      department?: string;
    }
  ) => {
    const response = await apiRequest<{
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        status: string;
        updated_at: string;
      };
    }>(`/admin/platform-users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response;
  },

  deletePlatformUser: async (userId: string) => {
    const response = await apiRequest<{
      message: string;
      user_id: string;
    }>(`/admin/platform-users/${userId}`, {
      method: "DELETE",
    });

    return response;
  },

  // User Profile API
  getUserProfile: async () => {
    const response = await apiRequest<{
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
    }>("/auth/profile");

    return response;
  },

  updateUserProfile: async (data: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    job_title?: string;
    department?: string;
  }) => {
    const response = await apiRequest<{
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
    }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response;
  },

  // First-time admin setup
  setupFirstUser: async (options?: {
    setupKey?: string;
    role?: "platform_admin" | "platform_member";
  }) => {
    const body: any = {};
    if (options?.setupKey) body.setup_key = options.setupKey;
    if (options?.role) body.role = options.role;

    const response = await apiRequest<{
      user_created: boolean;
      user_exists: boolean;
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        status: string;
        organization_id: string;
        created_at: string;
      };
      organization: {
        id: string;
        name: string;
        plan: string;
      };
      platform_context: {
        is_platform_admin: boolean;
        is_platform_member: boolean;
        first_user_setup?: boolean;
        role_determination?: {
          method: string;
          assigned_role: string;
        };
      };
    }>("/admin/setup-first-user", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return response;
  },

  // Activity Logs API
  getActivities: async (
    params: {
      organization_id?: string;
      user_id?: string;
      activity_type?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.organization_id)
      queryParams.append("organization_id", params.organization_id);
    if (params.user_id) queryParams.append("user_id", params.user_id);
    if (params.activity_type)
      queryParams.append("activity_type", params.activity_type);
    if (params.start_date) queryParams.append("start_date", params.start_date);
    if (params.end_date) queryParams.append("end_date", params.end_date);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await apiRequest<{
      activities: ActivityLog[];
      pagination: PaginationInfo;
    }>(`/admin/activities?${queryParams}`);

    return response;
  },
};
