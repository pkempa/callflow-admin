"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminAPI, Plan as APIPlan } from "@/lib/admin-api";
import {
  Plus,
  Edit,
  ToggleLeft,
  ToggleRight,
  Users,
  DollarSign,
  Check,
  Brain,
  Crown,
  Gift,
  Calculator,
  Rocket,
  Building,
  Sparkles,
  TrendingUp,
  Star,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  billing_cycle: string;
  features: string[];
  isActive: boolean;
  subscriberCount: number;
  revenue: number;
  description: string;
  target_audience: string;
  gradient: string;
  icon: string;
}

export default function PlansPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // Fetch plans data from API
  const { data: plansResponse, isLoading: loading } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: () => adminAPI.getPlans(),
    enabled: isLoaded && isSignedIn,
  });

  // Revenue Intelligence Plans state
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    // Revenue Intelligence Plans - matching backend plan_manager.py
    const revenueIntelligencePlans: Plan[] = [
      {
        id: "revenue_starter",
        name: "Revenue Starter",
        price: 0,
        billing_cycle: "monthly",
        description:
          "Perfect for solopreneurs starting their revenue intelligence journey",
        target_audience: "Solopreneurs, freelancers, small service businesses",
        gradient: "from-green-500 to-emerald-600",
        icon: "gift",
        features: [
          "1 phone number",
          "500 minutes/month",
          "100 SMS/month",
          "50 AI analysis minutes",
          "AI revenue analysis",
          "Caller intelligence",
          "ROI reporting",
          "Revenue attribution",
          "1 CRM integration",
          "Email support",
        ],
        isActive: true,
        subscriberCount: 1250,
        revenue: 0,
      },
      {
        id: "pay_as_you_go_intelligence",
        name: "Pay-As-You-Go Intelligence",
        price: 0,
        billing_cycle: "usage",
        description:
          "Premium revenue intelligence that scales with your business",
        target_audience: "Variable volume businesses, agencies, consultants",
        gradient: "from-blue-500 to-indigo-600",
        icon: "calculator",
        features: [
          "$15/month per number",
          "Unlimited minutes",
          "Unlimited SMS",
          "$0.08 per AI minute",
          "Advanced AI analysis",
          "Predictive routing",
          "Customer value ID",
          "Real-time insights",
          "3 CRM integrations",
          "Priority support",
        ],
        isActive: true,
        subscriberCount: 89,
        revenue: 2670,
      },
      {
        id: "smart_business",
        name: "Smart Business",
        price: 149,
        billing_cycle: "monthly",
        description: "AI-powered revenue optimization for growing businesses",
        target_audience: "Growing businesses, agencies, professional services",
        gradient: "from-purple-500 to-purple-600",
        icon: "rocket",
        features: [
          "3 phone numbers",
          "Unlimited minutes",
          "Unlimited SMS",
          "Unlimited AI analysis",
          "Revenue optimization routing",
          "Customer value identification",
          "Real-time coaching",
          "Sentiment routing",
          "5 CRM integrations",
          "Priority phone support",
        ],
        isActive: true,
        subscriberCount: 456,
        revenue: 67944,
      },
      {
        id: "revenue_engine",
        name: "Revenue Engine",
        price: 349,
        billing_cycle: "monthly",
        description: "Advanced revenue intelligence for scaling businesses",
        target_audience:
          "Scaling businesses, enterprise teams, high-growth companies",
        gradient: "from-orange-500 to-red-600",
        icon: "crown",
        features: [
          "10 phone numbers",
          "Global unlimited calling",
          "Global messaging",
          "Unlimited AI processing",
          "Customer DNA analysis",
          "Revenue forecasting",
          "Predictive optimization",
          "Custom AI models",
          "Unlimited integrations",
          "Dedicated success manager",
        ],
        isActive: true,
        subscriberCount: 189,
        revenue: 65961,
      },
      {
        id: "enterprise_intelligence",
        name: "Enterprise Intelligence",
        price: 799,
        billing_cycle: "monthly",
        description:
          "Custom AI training and enterprise-grade revenue intelligence",
        target_audience:
          "Large enterprises, Fortune 500, complex organizations",
        gradient: "from-gray-700 to-gray-900",
        icon: "building",
        features: [
          "25+ phone numbers",
          "Enterprise calling",
          "Compliance support",
          "Dedicated compute",
          "Custom AI training",
          "Advanced forecasting",
          "Enterprise automation",
          "White-label options",
          "White-glove integration",
          "24/7 enterprise support",
        ],
        isActive: true,
        subscriberCount: 45,
        revenue: 35955,
      },
    ];

    // Use API data if available, otherwise fall back to Revenue Intelligence data
    if (plansResponse?.success && plansResponse.data?.plans) {
      // Convert API plans to display format (since API structure might be different)
      const apiPlans = plansResponse.data.plans.map((apiPlan: APIPlan) => ({
        id: apiPlan.id,
        name: apiPlan.name,
        price: apiPlan.price || 0,
        billing_cycle: "monthly",
        description: apiPlan.description || "",
        target_audience: "",
        gradient: "from-blue-500 to-blue-600",
        icon: "star",
        features: apiPlan.features || [],
        isActive: apiPlan.is_active,
        subscriberCount: 0, // We'd need additional API for this
        revenue: 0, // We'd need additional API for this
      }));
      setPlans(apiPlans);
    } else {
      // Fallback to Revenue Intelligence plans
      setPlans(revenueIntelligencePlans);
    }
  }, [plansResponse]);

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

  const getIconComponent = (iconName: string) => {
    const icons = {
      gift: Gift,
      calculator: Calculator,
      rocket: Rocket,
      crown: Crown,
      building: Building,
      star: Star,
    };
    return icons[iconName as keyof typeof icons] || Star;
  };

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
              Revenue Intelligence Plans
            </h1>
            <p className="text-gray-600">
              Manage Revenue Communication Intelligence subscription plans
            </p>
          </div>
          <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </button>
        </div>

        {/* Revenue Intelligence Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Revenue Communication Intelligence Platform
              </h3>
              <p className="text-gray-600">
                Transform phone systems from cost centers into revenue engines
                with AI-powered intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600">
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
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
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
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  AI Intelligence Plans
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {plans.filter((p) => p.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600">
                <TrendingUp className="h-6 w-6 text-white" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const IconComponent = getIconComponent(plan.icon);
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                  plan.isActive ? "border-green-200" : "border-gray-200"
                }`}
              >
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${plan.gradient} rounded-lg flex items-center justify-center`}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {plan.billing_cycle === "usage"
                          ? "Usage-based"
                          : `$${plan.price}/month`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePlanStatus(plan.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      plan.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {plan.isActive ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Plan Description */}
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>

                {/* Plan Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">
                      {plan.subscriberCount}
                    </p>
                    <p className="text-xs text-gray-600">Subscribers</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-bold text-gray-900">
                      ${plan.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                </div>

                {/* Plan Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Key Features
                  </h4>
                  <div className="space-y-1">
                    {plan.features.slice(0, 5).map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center text-sm text-gray-600"
                      >
                        <Check className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                    {plan.features.length > 5 && (
                      <p className="text-xs text-gray-500">
                        +{plan.features.length - 5} more features
                      </p>
                    )}
                  </div>
                </div>

                {/* Target Audience */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Target Audience
                  </h4>
                  <p className="text-xs text-gray-600">
                    {plan.target_audience}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                    <Edit className="w-4 h-4 mr-1 inline" />
                    Edit
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Plan Performance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Plan Performance Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Subscribers
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Revenue
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const IconComponent = getIconComponent(plan.icon);
                  return (
                    <tr key={plan.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${plan.gradient} rounded-lg flex items-center justify-center`}
                          >
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {plan.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {plan.billing_cycle === "usage"
                          ? "Usage-based"
                          : `$${plan.price}/month`}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {plan.subscriberCount}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        ${plan.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            plan.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {plan.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
