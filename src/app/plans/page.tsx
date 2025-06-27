"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  Users,
  DollarSign,
  Check,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  isActive: boolean;
  subscriberCount: number;
  revenue: number;
}

export default function PlansPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockPlans: Plan[] = [
      {
        id: "1",
        name: "Free",
        price: 0,
        credits: 100,
        features: [
          "Basic calling",
          "SMS support",
          "Community support",
          "1 phone number",
        ],
        isActive: true,
        subscriberCount: 1250,
        revenue: 0,
      },
      {
        id: "2",
        name: "Basic",
        price: 29,
        credits: 1000,
        features: [
          "Everything in Free",
          "Advanced routing",
          "Email support",
          "Call recording",
          "3 phone numbers",
        ],
        isActive: true,
        subscriberCount: 456,
        revenue: 13224,
      },
      {
        id: "3",
        name: "Pro",
        price: 99,
        credits: 5000,
        features: [
          "Everything in Basic",
          "AI assistant",
          "Priority support",
          "Advanced analytics",
          "10 phone numbers",
        ],
        isActive: true,
        subscriberCount: 189,
        revenue: 18711,
      },
      {
        id: "4",
        name: "Enterprise",
        price: 299,
        credits: 20000,
        features: [
          "Everything in Pro",
          "Custom integrations",
          "Dedicated support",
          "SLA guarantee",
          "Unlimited phone numbers",
        ],
        isActive: true,
        subscriberCount: 45,
        revenue: 13455,
      },
    ];

    setTimeout(() => {
      setPlans(mockPlans);
      setLoading(false);
    }, 1000);
  }, []);

  const togglePlanStatus = (planId: string) => {
    setPlans(
      plans.map((plan) =>
        plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
      )
    );
  };

  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalSubscribers = plans.reduce(
    (sum, plan) => sum + plan.subscriberCount,
    0
  );

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Plan Management
            </h1>
            <p className="text-gray-600">
              Manage subscription plans and pricing
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Subscribers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalSubscribers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Plans
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter((p) => p.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Avg Revenue/User
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  $
                  {totalSubscribers > 0
                    ? Math.round(totalRevenue / totalSubscribers)
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
            <div className="text-lg">Loading plans...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  {/* Plan Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                    <button
                      onClick={() => togglePlanStatus(plan.id)}
                      className="flex items-center"
                    >
                      {plan.isActive ? (
                        <ToggleRight className="h-6 w-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      ${plan.price}
                      <span className="text-lg font-normal text-gray-500">
                        /month
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.credits.toLocaleString()} credits included
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Features:
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-gray-500">
                          +{plan.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Stats */}
                  <div className="border-t pt-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {plan.subscriberCount}
                        </div>
                        <div className="text-xs text-gray-500">Subscribers</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          ${plan.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Revenue</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Plan Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Plan Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {plan.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${plan.price}/month
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {plan.credits.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {plan.subscriberCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${plan.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
