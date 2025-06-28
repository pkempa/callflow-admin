"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Shield,
  FileText,
  Building,
  Bug,
  Sliders,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { adminAPI } from "@/lib/admin-api";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface BackendUserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  phone_number?: string;
  job_title?: string;
  department?: string;
  avatar_gradient?: string;
  last_active?: string;
  created_at: string;
  organization?: {
    id: string;
    name: string;
    plan: string;
    team_size: number;
    industry: string;
  };
}

const navigationSections = [
  {
    name: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    name: "User Management",
    items: [
      { name: "Organizations", href: "/users", icon: Building },
      { name: "Platform Users", href: "/platform-users", icon: Shield },
    ],
  },
  {
    name: "Business",
    items: [{ name: "Plans", href: "/plans", icon: CreditCard }],
  },
  {
    name: "System & Debug",
    items: [
      { name: "System Logs", href: "/logs", icon: FileText },
      { name: "Debug Tools", href: "/debug", icon: Bug },
      { name: "Settings", href: "/settings", icon: Sliders },
    ],
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [backendUser, setBackendUser] = useState<BackendUserProfile | null>(
    null
  );
  const [loadingProfile, setLoadingProfile] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isSignedIn) return;

      try {
        setLoadingProfile(true);
        const response = await adminAPI.getUserProfile();
        if (response.success && response.data) {
          setBackendUser(response.data);
        } else {
          console.error("Failed to load user profile:", response.error);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [isSignedIn]);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!isSignedIn) {
    return null;
  }

  // Use backend user data if available, fallback to Clerk data
  const displayUser = backendUser || {
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.emailAddresses[0]?.emailAddress || "",
  };

  const userInitials =
    `${displayUser.first_name?.charAt(0) || ""}${
      displayUser.last_name?.charAt(0) || ""
    }`.toUpperCase() || "AD";

  const displayName =
    displayUser.first_name && displayUser.last_name
      ? `${displayUser.first_name} ${displayUser.last_name}`
      : displayUser.first_name || user?.firstName || "Admin";

  // Note: Removed getPageTitle function as it was redundant with page titles

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">CallFlowHQ Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6">
          <div className="px-3">
            {navigationSections.map((section, sectionIndex) => (
              <div
                key={section.name}
                className={sectionIndex > 0 ? "mt-6" : ""}
              >
                {/* Section Header */}
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.name}
                </h3>

                {/* Section Items */}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md mb-1 flex items-center transition-colors ${
                        isActive
                          ? "text-blue-700 bg-blue-100"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              {/* Page title is shown in the page content, no need to duplicate here */}
            </div>

            {/* Custom User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {userInitials}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {displayName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {backendUser?.role
                      ? backendUser.role === "admin"
                        ? "Administrator"
                        : backendUser.role === "platform_admin"
                        ? "Platform Administrator"
                        : backendUser.role === "platform_member"
                        ? "Platform Member"
                        : "Member"
                      : "Administrator"}
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {userInitials}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {displayUser.email}
                        </div>
                        <div className="flex items-center text-xs text-green-600 mt-1">
                          <Shield className="h-3 w-3 mr-1" />
                          {backendUser?.role
                            ? backendUser.role === "admin"
                              ? "Administrator"
                              : backendUser.role === "platform_admin"
                              ? "Platform Administrator"
                              : backendUser.role === "platform_member"
                              ? "Platform Member"
                              : "Member"
                            : "Administrator"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        router.push("/profile");
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <User className="h-4 w-4 mr-3 text-gray-400" />
                      My Profile
                    </button>

                    <div className="border-t border-gray-100 my-2"></div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
