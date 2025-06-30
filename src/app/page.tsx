"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  adminAPI,
  isAuthReady,
  waitForAuth,
  PaginationInfo,
  ActivityLog,
} from "@/lib/admin-api";
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Building,
  RefreshCw,
} from "lucide-react";

// Analytics interface to match the API response
interface AnalyticsData {
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
}

// Activities interface to match the API response
interface ActivitiesData {
  activities: ActivityLog[];
  pagination: PaginationInfo;
}

const mockStats = [
  {
    id: 1,
    name: "Total Organizations",
    value: "—",
    change: "—",
    changeType: "increase",
    icon: Building,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Total Users",
    value: "—",
    change: "—",
    changeType: "increase",
    icon: Users,
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "Active Users",
    value: "—",
    change: "—",
    changeType: "increase",
    icon: BarChart3,
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Total Wallet Balance",
    value: "—",
    change: "—",
    changeType: "increase",
    icon: DollarSign,
    color: "bg-orange-500",
  },
];

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;

  return date.toLocaleDateString();
}

function getActivityTypeColor(activityType: string): string {
  switch (activityType) {
    case "user_registered":
      return "bg-blue-500";
    case "user_activated":
      return "bg-green-500";
    case "user_deactivated":
      return "bg-red-500";
    case "plan_upgraded":
      return "bg-green-500";
    case "plan_downgraded":
      return "bg-yellow-500";
    case "credits_added":
      return "bg-purple-500";
    case "api_key_created":
      return "bg-blue-500";
    case "phone_number_purchased":
      return "bg-indigo-500";
    default:
      return "bg-gray-500";
  }
}

export default function AdminDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activities, setActivities] = useState<ActivitiesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const loadData = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      // Wait for auth to be ready
      if (!isAuthReady()) {
        const authReady = await waitForAuth(5000);
        if (!authReady) {
          throw new Error("Authentication not ready");
        }
      }

      // Add delay to ensure auth stability
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Load analytics
      const analyticsRes = await adminAPI.getAnalytics({ period: "30d" });
      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }

      // Load activities
      try {
        const activitiesRes = await adminAPI.getActivities({ limit: 10 });
        if (activitiesRes?.success && activitiesRes.data) {
          setActivities(activitiesRes.data);
        } else {
          setActivities({
            activities: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              total_pages: 0,
              has_next: false,
              has_prev: false,
            },
          });
        }
      } catch {
        // Activities failure is not critical for dashboard
        setActivities({
          activities: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data";
      setError(errorMessage);
    }

    setLoading(false);
  }, [loading]);

  // Auto-load on mount when auth is ready
  useEffect(() => {
    if (isLoaded && isSignedIn && !analytics && !activities && !loading) {
      const timer = setTimeout(() => {
        loadData();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isLoaded, isSignedIn, analytics, activities, loading, loadData]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const displayStats = analytics
    ? [
        {
          name: "Total Organizations",
          value: analytics.summary.total_organizations.toLocaleString(),
          change: `${
            analytics.growth_metrics.organization_growth_percentage >= 0
              ? "+"
              : ""
          }${analytics.growth_metrics.organization_growth_percentage}%`,
          changeType:
            analytics.growth_metrics.organization_growth_percentage >= 0
              ? "increase"
              : "decrease",
          icon: Building,
          color: "bg-blue-500",
        },
        {
          name: "Total Users",
          value: analytics.summary.total_users.toLocaleString(),
          change: `${
            analytics.growth_metrics.user_growth_percentage >= 0 ? "+" : ""
          }${analytics.growth_metrics.user_growth_percentage}%`,
          changeType:
            analytics.growth_metrics.user_growth_percentage >= 0
              ? "increase"
              : "decrease",
          icon: Users,
          color: "bg-green-500",
        },
        {
          name: "Active Users",
          value: analytics.summary.active_users.toLocaleString(),
          change: "0%",
          changeType: "increase",
          icon: BarChart3,
          color: "bg-purple-500",
        },
        {
          name: "Total Wallet Balance",
          value: `$${analytics.summary.total_wallet_balance.toLocaleString()}`,
          change: `${
            analytics.growth_metrics.revenue_growth_percentage >= 0 ? "+" : ""
          }${analytics.growth_metrics.revenue_growth_percentage}%`,
          changeType:
            analytics.growth_metrics.revenue_growth_percentage >= 0
              ? "increase"
              : "decrease",
          icon: DollarSign,
          color: "bg-orange-500",
        },
      ]
    : mockStats;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">
              Welcome to the CallFlowHQ Admin Panel
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading dashboard data
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  {stat.changeType === "increase" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`ml-1 text-sm font-medium ${
                      stat.changeType === "increase"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    from last month
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => router.push("/organizations")}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span className="ml-3 text-sm font-medium text-blue-900">
                    Manage Organizations
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600" />
              </button>

              <button
                onClick={() => router.push("/plans")}
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span className="ml-3 text-sm font-medium text-green-900">
                    Manage Plans
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-green-600" />
              </button>

              <button
                onClick={() => router.push("/analytics")}
                className="flex items-center justify-between p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="ml-3 text-sm font-medium text-purple-900">
                    View Analytics
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-purple-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            {activities?.activities && activities.activities.length > 0 ? (
              <div className="space-y-4">
                {activities.activities.map((activity: ActivityLog) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 py-2"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${getActivityTypeColor(
                        activity.activity_type
                      )}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {activity.user_name && (
                          <span className="font-medium">
                            {activity.user_name}
                          </span>
                        )}{" "}
                        {activity.description}
                        {activity.organization_name && (
                          <span className="text-gray-600">
                            {" "}
                            • {activity.organization_name}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 flex-shrink-0">
                      {formatRelativeTime(activity.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  {loading
                    ? "Loading activities..."
                    : "No recent activity found"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
