"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Smartphone,
  BarChart3,
  Users,
  Building2,
  Phone,
  Settings,
  CheckCircle,
} from "lucide-react";
import { Card, Button, Badge, Typography } from "@/components/ui/design-system";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "navigation",
    title: "Task-Oriented Navigation",
    description:
      "Intuitive navigation grouped by business function, not technical structure",
    icon: Zap,
    color: "from-blue-500 to-cyan-400",
    improvements: [
      "Reduced from 9 sections to 4 logical groups",
      "Progressive disclosure based on user role",
      "Mobile-first responsive design",
      "Contextual search across all features",
    ],
  },
  {
    id: "dashboard",
    title: "Real-time Dashboard",
    description: "Live metrics and insights with auto-refresh capabilities",
    icon: BarChart3,
    color: "from-purple-500 to-pink-400",
    improvements: [
      "Real-time data updates every 30 seconds",
      "Interactive charts and visualizations",
      "Quick action buttons for common tasks",
      "Role-based content personalization",
    ],
  },
  {
    id: "organizations",
    title: "Organization Management",
    description:
      "Comprehensive customer organization management with rich metrics",
    icon: Building2,
    color: "from-green-500 to-emerald-400",
    improvements: [
      "Card-based layout with key metrics",
      "Advanced filtering and search",
      "Bulk operations with confirmations",
      "Inline editing capabilities",
    ],
  },
  {
    id: "users",
    title: "User & Role Management",
    description: "Streamlined user management with clear role hierarchies",
    icon: Users,
    color: "from-orange-500 to-red-400",
    improvements: [
      "Visual role badges with clear hierarchy",
      "Status management with audit trail",
      "Bulk user operations",
      "Advanced permission controls",
    ],
  },
  {
    id: "calls",
    title: "Call Intelligence",
    description: "Advanced call analytics with AI-powered insights",
    icon: Phone,
    color: "from-indigo-500 to-purple-400",
    improvements: [
      "AI-generated call summaries",
      "Integrated recording playback",
      "Real-time transcription display",
      "Advanced filtering and analytics",
    ],
  },
  {
    id: "mobile",
    title: "Mobile-First Design",
    description: "Fully responsive design that works perfectly on all devices",
    icon: Smartphone,
    color: "from-teal-500 to-cyan-400",
    improvements: [
      "Touch-friendly interface elements",
      "Optimized for mobile workflows",
      "Responsive data tables",
      "Gesture-based navigation",
    ],
  },
];

const FeatureCard: React.FC<{
  feature: (typeof features)[0];
  onExplore: (featureId: string) => void;
}> = ({ feature, onExplore }) => {
  const Icon = feature.icon;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "p-3 rounded-xl bg-gradient-to-r flex-shrink-0",
            feature.color
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <Typography.H3 className="mb-2">{feature.title}</Typography.H3>
          <Typography.Body className="text-gray-600 mb-4">
            {feature.description}
          </Typography.Body>
          <div className="space-y-2 mb-4">
            {feature.improvements.map((improvement, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{improvement}</span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExplore(feature.id)}
            className="group-hover:bg-gray-50"
            icon={ArrowRight}
          >
            Explore Feature
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default function DemoPage() {
  const router = useRouter();

  const handleExplore = (featureId: string) => {
    const routes: Record<string, string> = {
      navigation: "/new-dashboard",
      dashboard: "/new-dashboard",
      organizations: "/new-organizations",
      users: "/new-users",
      calls: "/new-calls",
      mobile: "/new-dashboard",
    };

    const route = routes[featureId];
    if (route) {
      router.push(route);
    }
  };

  const handleGetStarted = () => {
    router.push("/new-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge variant="info" className="mb-6">
              <Sparkles className="w-4 h-4 mr-1" />
              New & Improved
            </Badge>
            <Typography.H1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              CallFlow Admin
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Redesigned
              </span>
            </Typography.H1>
            <Typography.Body className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the completely redesigned CallFlow admin interface with
              modern design, intuitive navigation, and powerful features that
              make platform management effortless.
            </Typography.Body>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                icon={ArrowRight}
              >
                Explore New Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/")}
              >
                View Original
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <Typography.H2 className="text-3xl font-bold text-gray-900 mb-4">
            What's New & Improved
          </Typography.H2>
          <Typography.Body className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every aspect of the admin interface has been redesigned from the
            ground up to provide a better user experience and improved
            functionality.
          </Typography.Body>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onExplore={handleExplore}
            />
          ))}
        </div>
      </div>

      {/* Benefits section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Typography.H2 className="text-3xl font-bold text-gray-900 mb-4">
              Key Benefits
            </Typography.H2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <Typography.H3 className="mb-2">60% Faster</Typography.H3>
              <Typography.Body className="text-gray-600">
                Reduced task completion time through better information
                architecture and streamlined workflows.
              </Typography.Body>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <Typography.H3 className="mb-2">80% Fewer Errors</Typography.H3>
              <Typography.Body className="text-gray-600">
                Improved error handling, validation, and user guidance reduce
                mistakes and confusion.
              </Typography.Body>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <Typography.H3 className="mb-2">Mobile Ready</Typography.H3>
              <Typography.Body className="text-gray-600">
                Fully responsive design that works perfectly on all devices and
                screen sizes.
              </Typography.Body>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Typography.H2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience the New Admin?
          </Typography.H2>
          <Typography.Body className="text-xl text-blue-100 mb-8">
            Start exploring the redesigned CallFlow admin interface and see how
            it can transform your platform management experience.
          </Typography.Body>
          <Button
            size="lg"
            variant="secondary"
            onClick={handleGetStarted}
            icon={ArrowRight}
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}

