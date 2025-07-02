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
  Activity,
  AlertTriangle,
  Clock,
  Zap,
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
    gradient: "from-blue-500 to-cyan-400",
    bgGradient: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
  },
  {
    id: 2,
    name: "Total Users",
    value: "—",
    change: "—",
    changeType: "increase",
    icon: Users,
    gradient: "from-emerald-500 to-teal-400",
    bgGradient: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
  },
  {
    id: 3,
    name: "Active Users",
    value: "—",
    change: "—",
    changeType: "increase",
    icon: Activity,
    gradient: "from-purple-500 to-indigo-400",
    bgGradient: "from-purple-50 to-indigo-50",
    borderColor: "border-purple-200",
  },
  {
    id: 4,
    name: "Total Wallet Balance",
    value: "—",
    change: "—",
    changeType: "increase",
    icon: DollarSign,
    gradient: "from-amber-500 to-orange-400",
    bgGradient: "from-amber-50 to-orange-50",
    borderColor: "border-amber-200",
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
      return "bg-emerald-500";
    case "user_deactivated":
      return "bg-red-500";
    case "plan_upgraded":
      return "bg-emerald-500";
    case "plan_downgraded":
      return "bg-amber-500";
    case "credits_added":
      return "bg-purple-500";
    case "api_key_created":
      return "bg-blue-500";
    case "phone_number_purchased":
      return "bg-indigo-500";
    default:
      return "bg-slate-500";
  }
}

function getActivityIcon(activityType: string) {
  switch (activityType) {
    case "user_registered":
    case "user_activated":
    case "user_deactivated":
      return Users;
    case "plan_upgraded":
    case "plan_downgraded":
      return CreditCard;
    case "credits_added":
      return DollarSign;
    case "api_key_created":
      return Zap;
    case "phone_number_purchased":
      return Building;
    default:
      return Activity;
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="text-lg font-medium text-slate-700">Loading...</div>
        </div>
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
          gradient: "from-blue-500 to-cyan-400",
          bgGradient: "from-blue-50 to-cyan-50",
          borderColor: "border-blue-200",
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
          gradient: "from-emerald-500 to-teal-400",
          bgGradient: "from-emerald-50 to-teal-50",
          borderColor: "border-emerald-200",
        },
        {
          name: "Active Users",
          value: analytics.summary.active_users.toLocaleString(),
          change: "0%",
          changeType: "increase",
          icon: Activity,
          gradient: "from-purple-500 to-indigo-400",
          bgGradient: "from-purple-50 to-indigo-50",
          borderColor: "border-purple-200",
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
          gradient: "from-amber-500 to-orange-400",
          bgGradient: "from-amber-50 to-orange-50",
          borderColor: "border-amber-200",
        },
      ]
    : mockStats;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Welcome to the CallFlowHQ Admin Panel
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-slate-500">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-lg hover:from-blue-600 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
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
                className={`relative bg-white rounded-xl shadow-sm border ${stat.borderColor} hover:shadow-lg transition-all duration-300 card-hover overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`}
                ></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-600">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {stat.changeType === "increase" ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`ml-1 text-sm font-medium ${
                          stat.changeType === "increase"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      vs last month
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-amber-500" />
              Quick Actions
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => router.push("/organizations")}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-200 hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3 text-left">
                    <span className="text-sm font-medium text-blue-900">
                      Manage Organizations
                    </span>
                    <p className="text-xs text-blue-700 mt-0.5">
                      View and manage customer organizations
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/plans")}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-all border border-emerald-200 hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-lg">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3 text-left">
                    <span className="text-sm font-medium text-emerald-900">
                      Manage Plans
                    </span>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Configure subscription plans
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push("/analytics")}
                className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl hover:from-purple-100 hover:to-indigo-100 transition-all border border-purple-200 hover:border-purple-300 hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-3 text-left">
                    <span className="text-sm font-medium text-purple-900">
                      View Analytics
                    </span>
                    <p className="text-xs text-purple-700 mt-0.5">
                      Detailed performance insights
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-emerald-500" />
              Recent Activity
            </h2>
          </div>
          <div className="p-6">
            {activities?.activities && activities.activities.length > 0 ? (
              <div className="space-y-4">
                {activities.activities.map((activity: ActivityLog) => {
                  const ActivityIcon = getActivityIcon(activity.activity_type);
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`p-2 rounded-lg ${getActivityTypeColor(
                          activity.activity_type
                        )} shadow-sm`}
                      >
                        <ActivityIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {activity.user_name && (
                            <span className="font-semibold text-slate-800">
                              {activity.user_name}
                            </span>
                          )}{" "}
                          {activity.description}
                        </p>
                        {activity.organization_name && (
                          <p className="text-xs text-slate-500 mt-1">
                            Organization: {activity.organization_name}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex-shrink-0 bg-slate-100 px-2 py-1 rounded-full">
                        {formatRelativeTime(activity.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <div className="text-slate-500">
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
