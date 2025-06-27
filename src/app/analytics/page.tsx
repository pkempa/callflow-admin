"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Phone,
  AlertCircle,
} from "lucide-react";

// Sample data
const revenueData = [
  { month: "Jan", revenue: 12000, users: 150, calls: 2500 },
  { month: "Feb", revenue: 15000, users: 180, calls: 3200 },
  { month: "Mar", revenue: 18000, users: 220, calls: 4100 },
  { month: "Apr", revenue: 22000, users: 280, calls: 5300 },
  { month: "May", revenue: 25000, users: 320, calls: 6200 },
  { month: "Jun", revenue: 28000, users: 380, calls: 7100 },
];

const planDistribution = [
  { name: "Free", value: 1250, color: "#8884d8" },
  { name: "Basic", value: 456, color: "#82ca9d" },
  { name: "Pro", value: 189, color: "#ffc658" },
  { name: "Enterprise", value: 45, color: "#ff7300" },
];

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor key metrics and performance indicators
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <div className="text-lg">Loading analytics...</div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-900">$28,000</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="ml-1 text-sm font-medium text-green-600">
                    +12%
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    from last month
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Active Users
                    </p>
                    <p className="text-2xl font-bold text-gray-900">1,940</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="ml-1 text-sm font-medium text-green-600">
                    +8%
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    from last month
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-500">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Calls
                    </p>
                    <p className="text-2xl font-bold text-gray-900">7,100</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="ml-1 text-sm font-medium text-green-600">
                    +15%
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    from last month
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-orange-500">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Support Tickets
                    </p>
                    <p className="text-2xl font-bold text-gray-900">23</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="ml-1 text-sm font-medium text-red-600">
                    -5%
                  </span>
                  <span className="ml-1 text-sm text-gray-500">
                    from last month
                  </span>
                </div>
              </div>
            </div>

            {/* Revenue and User Growth Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Revenue & User Growth
                </h2>
              </div>
              <div className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Revenue ($)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="users"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Plan Distribution */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Plan Distribution
                  </h2>
                </div>
                <div className="p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={planDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {planDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Monthly Calls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Monthly Calls
                  </h2>
                </div>
                <div className="p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="calls" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">John Doe</span> upgraded
                        to Pro plan
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">2 hours ago</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        New user <span className="font-medium">Jane Smith</span>{" "}
                        registered
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">4 hours ago</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        Support ticket #1234 was resolved
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">6 hours ago</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        System maintenance completed
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">1 day ago</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
