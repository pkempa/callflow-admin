// API configuration - using environment variable
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.pkempa.com";

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
  account_number?: string;
  plan: string;
  team_size: string;
  industry: string;
  user_count: number;
  subscription_status?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  wallet_balance: number;
  is_active?: boolean;
  admin_notes?: string;
  has_notes?: boolean;
  support_priority?: string;
  created_at: string;
  updated_at: string;
}

// Dropdown option type
export interface DropdownOption {
  id?: string;
  value: string;
  label: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

// Support Ticket Interfaces
export interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  user_id: string;
  organization_id: string;
  organization_account_number?: string;
  organization_name?: string;
  assigned_to?: string;
  admin_notes?: string;
  responses: SupportTicketResponse[];
  attachments?: AttachmentMetadata[];
  metadata?: Record<string, unknown>;
  last_response_at?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AttachmentMetadata {
  original_filename: string;
  file_type: string;
  file_size: number;
  s3_key: string;
  bucket: string;
}

export interface SupportTicketResponse {
  id: string;
  message: string;
  is_internal: boolean;
  admin_user_id?: string;
  created_at: string;
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

// Company information types
export interface CompanyInfo {
  name: string;
  legal_name: string;
  description: string;
  contact: {
    support_email: string;
    sales_email: string;
    general_email: string;
    phone: string;
    toll_free: string;
  };
  address: {
    street: string;
    suite: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    formatted?: string;
  };
  business_hours: {
    timezone: string;
    schedule?: {
      monday: { enabled: boolean; start: string; end: string };
      tuesday: { enabled: boolean; start: string; end: string };
      wednesday: { enabled: boolean; start: string; end: string };
      thursday: { enabled: boolean; start: string; end: string };
      friday: { enabled: boolean; start: string; end: string };
      saturday: { enabled: boolean; start: string; end: string };
      sunday: { enabled: boolean; start: string; end: string };
    };
    formatted: {
      weekdays: string;
      weekends: string;
    };
  };
  support?: {
    live_chat: {
      available: boolean;
      hours: string;
      description: string;
    };
    phone_support: {
      available: boolean;
      hours: string;
      description: string;
    };
    email_support: {
      available: boolean;
      hours: string;
      response_time: string;
      description: string;
    };
  };
  legal: {
    privacy_email: string;
    legal_email: string;
    dpo_email: string;
    registered_year: string;
    tax_id?: string;
    registration_state: string;
  };
  social: {
    website: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    blog?: string;
    status_page?: string;
    help_center?: string;
    community?: string;
  };
  about: {
    founded: string;
    mission: string;
    vision: string;
    headquarters: string;
    team_size: string;
    funding_stage: string;
  };
  emergency?: {
    phone: string;
    email: string;
    description: string;
  };
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
  metadata: Record<string, unknown>;
  user_name?: string;
  organization_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ImpersonationSession {
  id: string;
  actor_user_id: string;
  target_user_id: string;
  target_organization_id: string;
  actor_token_id: string;
  reason: string;
  start_time: string;
  end_time?: string;
  is_active: boolean;
  actions_performed?: string[];
  created_at: string;
  updated_at: string;
}

export interface StartImpersonationRequest {
  target_user_id: string;
  reason: string;
  expires_in_minutes?: number;
}

export interface StartImpersonationResponse {
  session_id: string;
  actor_token: string;
  impersonation_url?: string;
  target_user: {
    id: string;
    name: string;
    email: string;
    organization_id: string;
  };
  expires_at: string;
  reason: string;
}

// Global auth helper - will be set when user is authenticated
let getAuthToken: (() => Promise<string | null>) | null = null;
let signOutUser: (() => Promise<void>) | null = null;
let authSystemInitialized = false;

// Set the auth token getter (called from components that have access to useAuth)
export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  getAuthToken = getter;
  authSystemInitialized = true;
}

// Set the sign out function (called from components that have access to useAuth)
export function setSignOutFunction(signOut: () => Promise<void>) {
  signOutUser = signOut;
}

// Reset auth system (useful for cleanup/re-initialization)
export function resetAuthSystem() {
  getAuthToken = null;
  signOutUser = null;
  authSystemInitialized = false;
}

// Helper function to check if auth is ready
export function isAuthReady(): boolean {
  return getAuthToken !== null && authSystemInitialized;
}

// Helper function to wait for auth to be ready
export async function waitForAuth(maxWaitMs: number = 3000): Promise<boolean> {
  const startTime = Date.now();

  while (!isAuthReady() && Date.now() - startTime < maxWaitMs) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const isReady = isAuthReady();
  const waitTime = Date.now() - startTime;

  if (isReady) {
    // Auth system ready
  } else {
    console.error("Auth functions not ready within timeout", {
      wait_time_ms: waitTime,
      max_wait_ms: maxWaitMs,
    });
  }

  return isReady;
}

// Race condition prevention utilities
export const raceConditionUtils = {
  /**
   * Initialize auth with delays to prevent race conditions
   * Use this pattern in useEffect for any page that makes immediate API calls
   */
  async initializeAuth(
    isLoaded: boolean,
    isSignedIn: boolean
  ): Promise<boolean> {
    if (!isLoaded || !isSignedIn) {
      return false;
    }

    // No delay needed - proceed immediately when auth is ready

    // Wait for auth to be ready
    if (!isAuthReady()) {
      const ready = await waitForAuth(3000);
      return ready;
    }

    return true;
  },

  /**
   * Add delay between API calls to prevent overwhelming the backend
   */
  async delayBetweenCalls(ms: number = 100): Promise<void> {
    // No delay needed - modern systems can handle concurrent requests
  },

  /**
   * Create a cancellable async operation for useEffect cleanup
   */
  createCancellableOperation<T>(operation: () => Promise<T>): {
    execute: () => Promise<T | null>;
    cancel: () => void;
  } {
    let cancelled = false;

    return {
      execute: async () => {
        if (cancelled) return null;
        return await operation();
      },
      cancel: () => {
        cancelled = true;
      },
    };
  },
};

// Generic API request function with automatic authentication
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = true,
  disableAutoLogout = false
): Promise<ApiResponse<T>> {
  const startTime = performance.now();

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
          "❌ API request requires auth but no auth token getter available"
        );

        // Wait a bit and retry once for initialization timing issues
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!getAuthToken) {
          console.error("❌ API request still requires auth after retry");
          return {
            success: false,
            error:
              "Authentication system not ready. Please wait and try again.",
          };
        }
      }

      try {
        const token = await getAuthToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;

          // Extract user ID from JWT token and add as header for backend
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.sub;
            if (userId) {
              headers["X-Clerk-User-Id"] = userId;
            }
          } catch {
            // Silently handle JWT parsing errors
          }
        } else {
          console.warn("No auth token available", { endpoint });
          return {
            success: false,
            error: "No authentication token available",
          };
        }
      } catch (error) {
        console.error("Failed to get auth token", error as Error, { endpoint });
        return {
          success: false,
          error: "Failed to get authentication token",
        };
      }
    }

    let response: Response;

    try {
      response = await fetch(url, {
        headers,
        ...options,
      });
    } catch (networkError) {
      const duration = performance.now() - startTime;

      // Handle network errors that might be CORS-related authentication failures
      console.error("Network error during API request", networkError as Error, {
        endpoint,
        method: options.method || "GET",
        require_auth: requireAuth,
        duration_ms: duration,
      });

      // Handle network errors properly - DON'T treat as authentication failures
      if (
        requireAuth &&
        networkError instanceof TypeError &&
        networkError.message.includes("Failed to fetch")
      ) {
        console.log(
          `🌐 NETWORK ERROR - This should NOT cause logout: ${networkError.message}`
        );

        // For admin endpoints, treat network errors as potential authorization issues
        if (endpoint.startsWith("/admin/")) {
          return {
            success: false,
            error: "Access denied - Unable to verify admin privileges",
          };
        }

        return {
          success: false,
          error:
            "Network error occurred. Please check your connection and try again.",
        };
      }

      // For other network errors, re-throw
      throw networkError;
    }

    // Handle ONLY actual authentication errors (401/403) - Auto-logout for auth failures
    if (response.status === 401 || response.status === 403) {
      console.log(
        `🚨 AUTHENTICATION FAILURE - ${response.status} response for ${endpoint}`
      );

      // For admin endpoints, treat 403 as access denied rather than auth failure
      if (endpoint.startsWith("/admin/") && response.status === 403) {
        console.log(
          `🚫 ACCESS DENIED - User lacks platform admin privileges for ${endpoint}`
        );
        return {
          success: false,
          error: "Access denied - Platform admin privileges required",
        };
      }

      console.log(
        `🚨 Auto-logout triggered for ${response.status} - forcing redirect to sign-in`
      );

      // Only trigger auto-logout if not disabled
      if (!disableAutoLogout) {
        // CRITICAL: Only auto-logout for actual authentication failures
        // NEVER logout on 500 errors or other server errors

        // Force redirect to sign-in page for authentication failures
        // Don't use the default signOut function as it may redirect to homepage
        try {
          // Clear any local storage or session data
          localStorage.removeItem("lastActivity");
          localStorage.removeItem("callflow-remember-me");
          localStorage.removeItem("callflow-session-start");
          sessionStorage.clear();

          // Force redirect to sign-in page with error parameter
          window.location.href = "/sign-in?error=auth_expired";
        } catch (redirectError) {
          console.error(
            "Failed to redirect after auth failure",
            redirectError as Error,
            {
              endpoint,
              original_status: response.status,
            }
          );
          // Fallback: try the signOut function as last resort
          if (signOutUser) {
            try {
              await signOutUser();
            } catch (signOutError) {
              console.error(
                "Failed to sign out user after auth failure",
                signOutError as Error,
                {
                  endpoint,
                  original_status: response.status,
                }
              );
            }
          }
        }
      } else {
        console.log(
          `🚨 AUTHENTICATION FAILURE - Auto-logout disabled for ${response.status} during registration`
        );
      }

      return {
        success: false,
        error: `Authentication failed (${response.status})`,
      };
    }

    if (!response.ok) {
      // Try to parse error response for better error messages
      try {
        const errorData: ApiResponse<T> = await response.json();
        return {
          success: false,
          error: errorData.error || `HTTP error! status: ${response.status}`,
        };
      } catch {
        // If JSON parsing fails, return generic error
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
        };
      }
    }

    const data: ApiResponse<T> = await response.json();
    return data;
  } catch (error) {
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
      include_user_counts?: boolean;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.plan) queryParams.append("plan", params.plan);
    if (params.include_user_counts)
      queryParams.append("include_user_counts", "true");

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

  // Dropdown Options Management API
  getDropdownOptions: async () => {
    const response = await apiRequest<{
      team_sizes: DropdownOption[];
      industries: DropdownOption[];
      use_cases: DropdownOption[];
      job_titles: DropdownOption[];
      departments: DropdownOption[];
    }>("/admin/dropdown-options");

    return response;
  },

  createDropdownOption: async (
    type: string,
    option: Omit<DropdownOption, "id" | "created_at" | "updated_at">
  ) => {
    const response = await apiRequest<DropdownOption>(
      "/admin/dropdown-options",
      {
        method: "POST",
        body: JSON.stringify({
          type,
          option,
        }),
      }
    );

    return response;
  },

  updateDropdownOption: async (
    type: string,
    id: string,
    option: Omit<DropdownOption, "id" | "created_at" | "updated_at">
  ) => {
    const response = await apiRequest<DropdownOption>(
      "/admin/dropdown-options",
      {
        method: "PUT",
        body: JSON.stringify({
          type,
          id,
          option,
        }),
      }
    );

    return response;
  },

  deleteDropdownOption: async (type: string, id: string) => {
    const response = await apiRequest<{ deleted_option: DropdownOption }>(
      `/admin/dropdown-options/${type}/${id}`,
      {
        method: "DELETE",
      }
    );

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

  // Company Information Management API
  getCompanyInfo: async () => {
    const response = await apiRequest<{
      company_info: CompanyInfo;
      created_at?: string;
      updated_at?: string;
      updated_by?: string;
    }>("/admin/company-info");

    return response;
  },

  updateCompanyInfo: async (companyInfo: CompanyInfo) => {
    const response = await apiRequest<{
      company_info: CompanyInfo;
      updated_at: string;
      updated_by: string;
    }>("/admin/company-info", {
      method: "PUT",
      body: JSON.stringify(companyInfo),
    });

    return response;
  },

  // Organization Notes API
  getOrganizationNotes: async (organizationId: string) => {
    const response = await apiRequest<{
      organization_id: string;
      organization_name: string;
      admin_notes: string;
      has_notes: boolean;
      last_updated: string;
    }>(`/admin/organizations/${organizationId}/notes`);

    return response;
  },

  saveOrganizationNotes: async (organizationId: string, notes: string) => {
    const response = await apiRequest<{
      organization_id: string;
      organization_name: string;
      admin_notes: string;
      has_notes: boolean;
      updated_at: string;
    }>(`/admin/organizations/${organizationId}/notes`, {
      method: "PUT",
      body: JSON.stringify({
        notes,
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

    // Try admin endpoint first, fallback to public endpoint
    try {
      const response = await apiRequest<{ plans: Plan[] }>(
        `/admin/plans?${queryParams}`
      );
      return response;
    } catch (error) {
      console.log(
        "Admin plans endpoint not available, falling back to public endpoint"
      );
      const response = await apiRequest<{ plans: Plan[] }>(
        `/plans?${queryParams}`
      );
      return response;
    }
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

  resendInvitation: async (
    userId: string,
    options?: {
      send_email?: boolean;
      custom_message?: string;
    }
  ) => {
    const response = await apiRequest<{
      message: string;
      user: {
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        status: string;
        role: string;
      };
      organization: {
        id: string;
        name: string;
      };
      invitation_result: {
        email_sent: boolean;
        email_error?: string;
        custom_message_included: boolean;
      };
    }>(`/admin/platform-users/${userId}/resend-invitation`, {
      method: "POST",
      body: JSON.stringify(options || {}),
    });

    return response;
  },

  // Admin Profile API - platform admin only
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
      is_platform_admin?: boolean;
      platform_permissions?: {
        can_view_all_organizations: boolean;
        can_manage_platform_users: boolean;
        can_access_system_settings: boolean;
      };
    }>("/admin/profile");

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
        is_active?: boolean;
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
    const body: {
      setup_key?: string;
      role?: "platform_admin" | "platform_member";
    } = {};
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

  // Support Tickets API - for platform admins
  getSupportTickets: async (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      category?: string;
      priority?: string;
      organization_id?: string;
      user_id?: string;
      search?: string;
    } = {}
  ) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.category) queryParams.append("category", params.category);
    if (params.priority) queryParams.append("priority", params.priority);
    if (params.organization_id)
      queryParams.append("organization_id", params.organization_id);
    if (params.user_id) queryParams.append("user_id", params.user_id);
    if (params.search) queryParams.append("search", params.search);

    const response = await apiRequest<{
      tickets: SupportTicket[];
      pagination: PaginationInfo;
      filters: {
        status?: string;
        category?: string;
        priority?: string;
        organization_id?: string;
        user_id?: string;
        search?: string;
      };
      statistics: {
        total_open: number;
        total_in_progress: number;
        total_resolved: number;
        total_closed: number;
      };
    }>(`/admin/support-tickets?${queryParams}`);

    return response;
  },

  getSupportTicket: async (ticketId: string) => {
    const response = await apiRequest<{
      ticket: SupportTicket;
    }>(`/admin/support-tickets/${ticketId}`);

    return response;
  },

  updateSupportTicket: async (
    ticketId: string,
    data: {
      status?: string;
      priority?: string;
      admin_notes?: string;
      assigned_to?: string;
    }
  ) => {
    const response = await apiRequest<{
      ticket: SupportTicket;
      message: string;
    }>(`/admin/support-tickets/${ticketId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    return response;
  },

  deleteSupportTicket: async (ticketId: string) => {
    const response = await apiRequest<{
      message: string;
    }>(`/admin/support-tickets/${ticketId}`, {
      method: "DELETE",
    });

    return response;
  },

  addSupportTicketResponse: async (
    ticketId: string,
    data: {
      response: string;
      is_internal?: boolean;
    }
  ) => {
    const response = await apiRequest<{
      ticket: SupportTicket;
      message: string;
    }>(`/admin/support-tickets/${ticketId}/response`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response;
  },

  // Download attachment
  downloadAttachment: async (s3Key: string) =>
    apiRequest<{
      download_url: string;
      expires_in: number;
    }>(`/storage/download-attachment/${encodeURIComponent(s3Key)}`),
};

// Impersonation API endpoints
export const impersonationApi = {
  // Start impersonating a user
  startImpersonation: async (
    data: StartImpersonationRequest
  ): Promise<ApiResponse<StartImpersonationResponse>> => {
    return apiRequest<StartImpersonationResponse>("/admin/impersonate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // End an impersonation session
  endImpersonation: async (
    sessionId: string
  ): Promise<
    ApiResponse<{
      session_id: string;
      duration_minutes: number;
      actions_performed: string[];
    }>
  > => {
    return apiRequest(`/admin/impersonate/${sessionId}`, {
      method: "DELETE",
    });
  },

  // Get impersonation sessions
  getImpersonationSessions: async (params?: {
    page?: number;
    limit?: number;
    active_only?: boolean;
    actor_user_id?: string;
    target_user_id?: string;
  }): Promise<
    ApiResponse<{
      sessions: ImpersonationSession[];
      pagination: PaginationInfo;
    }>
  > => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.active_only)
      queryParams.append("active_only", params.active_only.toString());
    if (params?.actor_user_id)
      queryParams.append("actor_user_id", params.actor_user_id);
    if (params?.target_user_id)
      queryParams.append("target_user_id", params.target_user_id);

    const url = `/admin/impersonate/sessions${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiRequest(url);
  },

  // Revoke an actor token
  revokeActorToken: async (
    actorTokenId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest("/admin/impersonate/revoke-token", {
      method: "POST",
      body: JSON.stringify({ actor_token_id: actorTokenId }),
    });
  },
};
