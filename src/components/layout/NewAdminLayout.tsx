"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Phone,
  MessageSquare,
  Brain,
  HeadphonesIcon,
  TrendingUp,
  BarChart3,
  Activity,
  FileText,
  Settings,
  Puzzle,
  Shield,
  Wrench,
  Menu,
  X,
  ChevronDown,
  Search,
  Bell,
  User,
  LogOut,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Badge, Typography } from "@/components/ui/design-system";
import { useAdminStatusMonitor } from "@/hooks/useAdminStatusMonitor";
import { useAdminAuthorization } from "@/hooks/useAdminAuthorization";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationSection {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: NavigationItem[];
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const navigationSections: NavigationSection[] = [
  {
    id: "core",
    name: "Core Management",
    icon: Home,
    color: "text-blue-600 bg-blue-50",
    items: [
      {
        id: "dashboard",
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        description: "Overview, KPIs & recent activity",
      },
      {
        id: "organizations",
        name: "Organizations",
        href: "/organizations",
        icon: Building2,
        description: "Customer management & billing",
      },
      {
        id: "users",
        name: "Users & Roles",
        href: "/users",
        icon: Users,
        description: "Access control & permissions",
      },
      {
        id: "plans",
        name: "Plans & Billing",
        href: "/plans",
        icon: CreditCard,
        description: "Revenue management & subscriptions",
      },
    ],
  },
  {
    id: "operations",
    name: "Operations Center",
    icon: Phone,
    color: "text-purple-600 bg-purple-50",
    items: [
      {
        id: "calls",
        name: "Call Intelligence",
        href: "/calls",
        icon: Phone,
        description: "Call logs & analytics",
      },
      {
        id: "phone-numbers",
        name: "Phone Numbers",
        href: "/phone-numbers",
        icon: MessageSquare,
        description: "Number management & routing",
      },
      {
        id: "templates",
        name: "AI Templates",
        href: "/templates",
        icon: Brain,
        description: "Conversation flows & templates",
      },
      {
        id: "support",
        name: "Support Center",
        href: "/support-tickets",
        icon: HeadphonesIcon,
        description: "Ticket management",
        badge: "3",
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics Hub",
    icon: TrendingUp,
    color: "text-pink-600 bg-pink-50",
    items: [
      {
        id: "revenue-analytics",
        name: "Revenue Analytics",
        href: "/analytics/revenue",
        icon: TrendingUp,
        description: "Financial insights & growth",
      },
      {
        id: "performance",
        name: "Performance Metrics",
        href: "/analytics/performance",
        icon: BarChart3,
        description: "System health & uptime",
      },
      {
        id: "usage",
        name: "Usage Analytics",
        href: "/analytics/usage",
        icon: Activity,
        description: "Resource tracking & capacity",
      },
      {
        id: "audit",
        name: "Audit Logs",
        href: "/audit-logs",
        icon: FileText,
        description: "Activity tracking & compliance",
      },
    ],
  },
  {
    id: "system",
    name: "System Control",
    icon: Settings,
    color: "text-orange-600 bg-orange-50",
    items: [
      {
        id: "settings",
        name: "System Settings",
        href: "/settings",
        icon: Settings,
        description: "Global configuration",
      },
      {
        id: "integrations",
        name: "Integrations",
        href: "/integrations",
        icon: Puzzle,
        description: "Third-party connections",
      },
      {
        id: "security",
        name: "Security Center",
        href: "/security",
        icon: Shield,
        description: "Access control & policies",
      },
      {
        id: "tools",
        name: "Developer Tools",
        href: "/tools",
        icon: Wrench,
        description: "Testing & debugging",
      },
    ],
  },
];

export default function NewAdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("core");
  const [searchQuery, setSearchQuery] = useState("");

  // Check admin authorization - but don't redirect (let pages handle that)
  const { isAuthorized } = useAdminAuthorization({
    redirectOnUnauthorized: false,
  });

  // User status monitoring - check for user/organization deactivation
  useAdminStatusMonitor({
    checkInterval: 60 * 1000, // Check every 60 seconds
    enabled: isSignedIn && isAuthorized, // Only monitor when signed in and authorized
  });

  // Auto-expand section based on current path
  useEffect(() => {
    for (const section of navigationSections) {
      if (
        section.items.some(
          (item) => pathname.startsWith(item.href) && item.href !== "/"
        )
      ) {
        setExpandedSection(section.id);
        break;
      }
    }
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  const userInitials = `${user?.firstName?.charAt(0) || ""}${
    user?.lastName?.charAt(0) || ""
  }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <Typography.H3 className="text-gray-900">
              CallFlow Admin
            </Typography.H3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search admin features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navigationSections.map((section) => {
            const isExpanded = expandedSection === section.id;
            const SectionIcon = section.icon;

            return (
              <div key={section.id} className="space-y-1">
                {/* Section header */}
                <button
                  onClick={() =>
                    setExpandedSection(isExpanded ? null : section.id)
                  }
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors",
                    "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    isExpanded && "bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-1.5 rounded-md", section.color)}>
                      <SectionIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-900">
                      {section.name}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {/* Section items */}
                {isExpanded && (
                  <div className="ml-4 space-y-1">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            router.push(item.href);
                            setSidebarOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                            isActive &&
                              "bg-blue-50 text-blue-700 border border-blue-200"
                          )}
                        >
                          <ItemIcon
                            className={cn(
                              "w-4 h-4",
                              isActive ? "text-blue-600" : "text-gray-400"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "font-medium truncate",
                                  isActive ? "text-blue-700" : "text-gray-700"
                                )}
                              >
                                {item.name}
                              </span>
                              {item.badge && (
                                <Badge variant="danger" size="sm">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User menu */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer group">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userInitials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-80">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-500">Admin</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-medium">
                {navigationSections
                  .flatMap((s) => s.items)
                  .find(
                    (item) =>
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href))
                  )?.name || "Dashboard"}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>

            {/* User avatar */}
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userInitials}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
