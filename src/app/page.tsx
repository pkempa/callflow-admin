"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Phone,
  Activity,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Clock,
  Target,
  Zap,
} from "lucide-react";
import NewAdminLayout from "@/components/layout/NewAdminLayout";
import {
  Card,
  Button,
  Badge,
  Typography,
  LoadingSpinner,
  EmptyState,
} from "@/components/ui/design-system";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  cn,
} from "@/lib/utils";
import { adminAPI } from "@/lib/admin-api";
import { useAdminStatusMonitor } from "@/hooks/useAdminStatusMonitor";
import { useAdminAuthorization } from "@/hooks/useAdminAuthorization";

interface DashboardMetrics {
  organizations: {
    total: number;
    active: number;
    growth: number;
  };
  users: {
    total: number;
    active: number;
    growth: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
  };
  calls: {
    total: number;
    today: number;
    growth: number;
  };
}

interface RecentActivity {
  id: string;
  type:
    | "user_registered"
    | "organization_created"
    | "plan_upgraded"
    | "call_completed";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface SystemHealth {
  status: "healthy" | "warning" | "error";
  uptime: number;
  responseTime: number;
  errorRate: number;
}

const MetricCard: React.FC<{
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  loading?: boolean;
}> = ({ title, value, change, icon: Icon, color, loading }) => {
  const isPositive = change >= 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <Typography.Caption className="text-gray-500 mb-1">
            {title}
          </Typography.Caption>
          {loading ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : (
            <Typography.H2 className="text-2xl font-bold text-gray-900 mb-2">
              {value}
            </Typography.H2>
          )}
          <div className="flex items-center gap-1">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span
              className={cn(
                "text-sm font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {formatPercentage(Math.abs(change))}
            </span>
            <Typography.Caption>vs last month</Typography.Caption>
          </div>
        </div>
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

const ActivityItem: React.FC<{ activity: RecentActivity }> = ({ activity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
        return Users;
      case "organization_created":
        return Building2;
      case "plan_upgraded":
        return TrendingUp;
      case "call_completed":
        return Phone;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_registered":
        return "bg-blue-500";
      case "organization_created":
        return "bg-green-500";
      case "plan_upgraded":
        return "bg-purple-500";
      case "call_completed":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const ActivityIcon = getActivityIcon(activity.type);

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={cn("p-2 rounded-lg", getActivityColor(activity.type))}>
        <ActivityIcon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{activity.title}</p>
        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          {formatRelativeTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Check admin authorization - will redirect to /unauthorized if not authorized
  const {
    isLoading: authLoading,
    isAuthorized,
    userProfile,
    error: authError,
  } = useAdminAuthorization();

  // User status monitoring - check for user/organization deactivation
  useAdminStatusMonitor({
    checkInterval: 60 * 1000, // Check every 60 seconds
    enabled: isSignedIn && isAuthorized, // Only monitor when signed in and authorized
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load real data first
      try {
        const analyticsRes = await adminAPI.getAnalytics({ period: "30d" });
        if (analyticsRes.success && analyticsRes.data) {
          const data = analyticsRes.data;
          setMetrics({
            organizations: {
              total: data.summary.total_organizations,
              active: data.summary.total_organizations, // Assuming all are active for now
              growth: data.growth_metrics.organization_growth_percentage,
            },
            users: {
              total: data.summary.total_users,
              active: data.summary.active_users,
              growth: data.growth_metrics.user_growth_percentage,
            },
            revenue: {
              total: data.summary.total_wallet_balance,
              monthly: data.summary.total_wallet_balance, // Using total as monthly for now
              growth: data.growth_metrics.revenue_growth_percentage,
            },
            calls: {
              total: 0, // Not available in current API
              today: 0,
              growth: 0,
            },
          });
        } else {
          throw new Error("No analytics data available");
        }
      } catch (apiError) {
        // Fall back to mock data
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setMetrics({
          organizations: {
            total: 1247,
            active: 1198,
            growth: 12.5,
          },
          users: {
            total: 8934,
            active: 7821,
            growth: 8.3,
          },
          revenue: {
            total: 284750,
            monthly: 23890,
            growth: 15.2,
          },
          calls: {
            total: 45678,
            today: 234,
            growth: 22.1,
          },
        });
      }

      // Load activities (mock data for now)
      setActivities([
        {
          id: "1",
          type: "user_registered",
          title: "New user registered",
          description: "John Doe joined TechCorp organization",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          type: "plan_upgraded",
          title: "Plan upgraded",
          description: "Acme Inc upgraded to Professional plan",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          type: "organization_created",
          title: "New organization",
          description: "StartupXYZ created their account",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: "4",
          type: "call_completed",
          title: "High volume calls",
          description: "500+ calls processed in the last hour",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
      ]);

      setSystemHealth({
        status: "healthy",
        uptime: 99.9,
        responseTime: 145,
        errorRate: 0.02,
      });

      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isSignedIn && isAuthorized) {
      loadDashboardData();
    }
  }, [isSignedIn, isAuthorized]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isSignedIn || !isAuthorized) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [isSignedIn, isAuthorized]);

  // Show loading while checking authentication and authorization
  if (!isLoaded || !isSignedIn || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-sm text-gray-600 font-medium">
            {!isLoaded
              ? "Loading authentication..."
              : !isSignedIn
              ? "Checking sign-in status..."
              : "Verifying admin access..."}
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authorized (useAdminAuthorization will handle redirect)
  if (!isAuthorized) {
    return null;
  }

  return (
    <NewAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Typography.H1>Dashboard</Typography.H1>
            <Typography.Body className="text-gray-600 mt-1">
              Welcome to your CallFlow admin dashboard
            </Typography.Body>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              onClick={loadDashboardData}
              disabled={loading}
              icon={RefreshCw}
              className={loading ? "animate-spin" : ""}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Card variant="outlined" className="border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <Typography.H3 className="text-red-800">
                  Error loading dashboard
                </Typography.H3>
                <Typography.Body className="text-red-700 mt-1">
                  {error}
                </Typography.Body>
              </div>
            </div>
          </Card>
        )}

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Organizations"
            value={metrics ? formatNumber(metrics.organizations.total) : "—"}
            change={metrics?.organizations.growth || 0}
            icon={Building2}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            loading={loading}
          />
          <MetricCard
            title="Active Users"
            value={metrics ? formatNumber(metrics.users.active) : "—"}
            change={metrics?.users.growth || 0}
            icon={Users}
            color="bg-gradient-to-r from-green-500 to-green-600"
            loading={loading}
          />
          <MetricCard
            title="Monthly Revenue"
            value={metrics ? formatCurrency(metrics.revenue.monthly) : "—"}
            change={metrics?.revenue.growth || 0}
            icon={DollarSign}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            loading={loading}
          />
          <MetricCard
            title="Calls Today"
            value={metrics ? formatNumber(metrics.calls.today) : "—"}
            change={metrics?.calls.growth || 0}
            icon={Phone}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System health */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <Typography.H3>System Health</Typography.H3>
              <Badge
                variant={
                  systemHealth?.status === "healthy" ? "success" : "warning"
                }
                icon={systemHealth?.status === "healthy" ? Target : AlertCircle}
              >
                {systemHealth?.status || "Unknown"}
              </Badge>
            </div>
            {systemHealth ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">
                    {formatPercentage(systemHealth.uptime, 2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-medium">
                    {systemHealth.responseTime}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Error Rate</span>
                  <span className="font-medium">
                    {formatPercentage(systemHealth.errorRate, 3)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <Card>
            <Typography.H3 className="mb-4">Quick Actions</Typography.H3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/organizations")}
                icon={Building2}
              >
                Manage Organizations
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/users")}
                icon={Users}
              >
                User Management
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/support-tickets")}
                icon={Activity}
              >
                Support Tickets
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/analytics")}
                icon={TrendingUp}
              >
                Revenue Analytics
              </Button>
            </div>
          </Card>

          {/* Recent activity */}
          <Card>
            <Typography.H3 className="mb-4">Recent Activity</Typography.H3>
            {activities.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="No recent activity"
                description="Activity will appear here as users interact with the system"
              />
            )}
          </Card>
        </div>

        {/* Performance charts placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <Typography.H3 className="mb-4">Revenue Trends</Typography.H3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <Typography.Body className="text-gray-500">
                  Revenue chart will be implemented here
                </Typography.Body>
              </div>
            </div>
          </Card>

          <Card>
            <Typography.H3 className="mb-4">User Growth</Typography.H3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <Typography.Body className="text-gray-500">
                  User growth chart will be implemented here
                </Typography.Body>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </NewAdminLayout>
  );
}
