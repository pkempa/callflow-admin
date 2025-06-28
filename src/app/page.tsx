"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminAPI } from "@/lib/admin-api";
import {
  Users,
  CreditCard,
  Phone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
  Building,
} from "lucide-react";

const stats = [
  {
    id: 1,
    name: "Total Users",
    value: "1,940",
    change: "+12%",
    changeType: "increase",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Active Subscriptions",
    value: "456",
    change: "+8%",
    changeType: "increase",
    icon: CreditCard,
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "Total Calls Today",
    value: "2,341",
    change: "+15%",
    changeType: "increase",
    icon: Phone,
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Monthly Revenue",
    value: "$28,450",
    change: "-2%",
    changeType: "decrease",
    icon: DollarSign,
    color: "bg-orange-500",
  },
];

// Helper function to format relative time
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

// Helper function to get activity type color
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

  // Fetch analytics data
  const { data: analyticsResponse, isLoading: analyticsLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminAPI.getAnalytics({ period: "30d" }),
    enabled: isLoaded && isSignedIn,
    retry: 1,
    retryDelay: 1000,
  });

  // Fetch recent activity data
  const { data: activitiesResponse, isLoading: activitiesLoading } = useQuery({
    queryKey: ["admin-activities"],
    queryFn: () => adminAPI.getActivities({ limit: 10 }),
    enabled: isLoaded && isSignedIn,
    retry: 1,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Get analytics data or use fallback
  const analytics = analyticsResponse?.success ? analyticsResponse.data : null;

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the CallFlowHQ Admin Panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {analyticsLoading
            ? // Loading state
              Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            : analytics
            ? // Real data
              [
                {
                  name: "Total Organizations",
                  value: analytics.summary.total_organizations.toLocaleString(),
                  change:
                    analytics.growth_metrics.organization_growth_percentage ===
                    0
                      ? "0%"
                      : `${
                          analytics.growth_metrics
                            .organization_growth_percentage >= 0
                            ? "+"
                            : ""
                        }${
                          analytics.growth_metrics
                            .organization_growth_percentage
                        }%`,
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
                  change:
                    analytics.growth_metrics.user_growth_percentage === 0
                      ? "0%"
                      : `${
                          analytics.growth_metrics.user_growth_percentage >= 0
                            ? "+"
                            : ""
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
                  change:
                    ((analytics.growth_metrics as any)
                      .active_users_growth_percentage ?? 0) === 0
                      ? "0%"
                      : `${
                          ((analytics.growth_metrics as any)
                            .active_users_growth_percentage ?? 0) >= 0
                            ? "+"
                            : ""
                        }${
                          (analytics.growth_metrics as any)
                            .active_users_growth_percentage ?? 0
                        }%`,
                  changeType:
                    ((analytics.growth_metrics as any)
                      .active_users_growth_percentage ?? 0) >= 0
                      ? "increase"
                      : "decrease",
                  icon: BarChart3,
                  color: "bg-purple-500",
                },
                {
                  name: "Total Wallet Balance",
                  value: `$${analytics.summary.total_wallet_balance.toLocaleString()}`,
                  change:
                    analytics.growth_metrics.revenue_growth_percentage === 0
                      ? "0%"
                      : `${
                          analytics.growth_metrics.revenue_growth_percentage >=
                          0
                            ? "+"
                            : ""
                        }${
                          analytics.growth_metrics.revenue_growth_percentage
                        }%`,
                  changeType:
                    analytics.growth_metrics.revenue_growth_percentage >= 0
                      ? "increase"
                      : "decrease",
                  icon: DollarSign,
                  color: "bg-orange-500",
                },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
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
              })
            : // Fallback to mock data
              stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.id}
                    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
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
                onClick={() => router.push("/users")}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="ml-3 text-sm font-medium text-blue-900">
                    Manage Users
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
            {activitiesLoading ? (
              // Loading state
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 animate-pulse"
                  >
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : activitiesResponse?.success &&
              activitiesResponse.data?.activities &&
              activitiesResponse.data.activities.length > 0 ? (
              // Real activity data
              <div className="space-y-4">
                {activitiesResponse.data.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3"
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
                    <div className="text-sm text-gray-500">
                      {formatRelativeTime(activity.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty state
              <div className="text-center py-8">
                <div className="text-gray-500">No recent activity found</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
