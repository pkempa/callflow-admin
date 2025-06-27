"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Users,
  CreditCard,
  Phone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart3,
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

const recentActivity = [
  {
    id: 1,
    user: "John Doe",
    action: "upgraded to Pro plan",
    time: "2 hours ago",
    type: "upgrade",
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "registered new account",
    time: "4 hours ago",
    type: "registration",
  },
  {
    id: 3,
    user: "Bob Johnson",
    action: "purchased phone number",
    time: "6 hours ago",
    type: "purchase",
  },
  {
    id: 4,
    user: "Alice Brown",
    action: "cancelled subscription",
    time: "8 hours ago",
    type: "cancellation",
  },
];

export default function AdminDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

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
          {stats.map((stat) => {
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
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "upgrade"
                        ? "bg-green-500"
                        : activity.type === "registration"
                        ? "bg-blue-500"
                        : activity.type === "purchase"
                        ? "bg-purple-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
