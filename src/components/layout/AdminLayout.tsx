"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Shield,
  FileText,
  Building,
  Sliders,
  ListOrdered,
  MessageSquare,
  Bell,
  Search,
  Brain,
  Phone,
  Users,
  Puzzle,
  Voicemail,
  Tags,
  FlaskConical,
  Activity,
  Palette,
  Webhook,
  Slack,
  PhoneCall,
  Contact,
  TestTube,
  ScrollText,
  Workflow,
  Route,
  Mic,
  UserPlus,
  Archive,
  Target,
  Settings,
  Home,
  Eye,
  Headphones,
  Zap,
  TrendingUp,
  Clock,
  Globe,
  Paintbrush,
  Cog,
  BookOpen,
  Tag,
  Mail,
  Database,
  Code,
  Megaphone,
  PhoneIncoming,
  PhoneOutgoing,
  AudioLines,
  Filter,
  Play,
  Pause,
  Volume2,
  Download,
  Upload,
  MapPin,
  Link,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Rss,
  Briefcase,
  Building2,
  DollarSign,
  PieChart,
  LineChart,
  AreaChart,
  Presentation,
  Server,
  HardDrive,
  Network,
  Cpu,
  UserCheck,
  UserX,
  UserMinus,
  UserCog,
  UserSearch,
  Users2,
  Crown,
  Award,
  Star,
  Heart,
  ThumbsUp,
  Smile,
  Sparkles,
  Flame,
  Sun,
  Moon,
  Cloud,
  Crosshair,
  Compass,
  Map,
  Navigation,
  Locate,
  Milestone,
  Car,
  Plane,
  Ship,
  Timer,
  AlarmClock,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarMinus,
  CalendarPlus,
  CalendarRange,
  CalendarSearch,
  CalendarX,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { adminAPI } from "@/lib/admin-api";
import { useAdminStatusMonitor } from "@/hooks/useAdminStatusMonitor";

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
    name: "Dashboard",
    items: [
      {
        name: "Overview",
        href: "/",
        icon: Home,
        description: "Calls, usage, revenue & recent activity",
      },
      {
        name: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        description: "Performance insights & metrics",
      },
    ],
  },
  {
    name: "Call Flow Templates",
    items: [
      {
        name: "Templates",
        href: "/templates",
        icon: Brain,
        description: "Create & edit call flow templates",
      },
      {
        name: "Preview & Test",
        href: "/templates/preview",
        icon: Eye,
        description: "Preview flows & test scenarios",
      },
      {
        name: "Assignments",
        href: "/templates/assignments",
        icon: Route,
        description: "Assign templates to numbers or orgs",
      },
    ],
  },
  {
    name: "Communications",
    items: [
      {
        name: "Phone Numbers",
        href: "/phone-numbers",
        icon: Phone,
        description: "Purchase, assign & configure numbers",
      },
      {
        name: "Call Logs",
        href: "/call-logs",
        icon: PhoneCall,
        description: "All call records & outcomes",
      },
      {
        name: "Voicemail Inbox",
        href: "/voicemail",
        icon: Voicemail,
        description: "Voicemail playback & transcription",
      },
    ],
  },
  {
    name: "Organizations & Users",
    items: [
      {
        name: "Organizations",
        href: "/organizations",
        icon: Building,
        description: "Manage client organizations",
      },
      {
        name: "Users & Roles",
        href: "/users",
        icon: Users,
        description: "Manage users & permissions",
      },
      {
        name: "Platform Users",
        href: "/platform-users",
        icon: Shield,
        description: "Admin and platform users",
      },
    ],
  },
  {
    name: "Data & Analytics",
    items: [
      {
        name: "Leads & Contacts",
        href: "/leads",
        icon: Contact,
        description: "View captured contacts & exports",
      },
      {
        name: "Campaigns & Tags",
        href: "/campaigns",
        icon: Tags,
        description: "Manage campaigns & reporting",
      },
      {
        name: "Revenue Analytics",
        href: "/revenue",
        icon: TrendingUp,
        description: "Revenue tracking & insights",
      },
    ],
  },
  {
    name: "Integrations",
    items: [
      {
        name: "CRM Integrations",
        href: "/integrations/crm",
        icon: Puzzle,
        description: "HubSpot, Salesforce & more",
      },
      {
        name: "Notifications",
        href: "/integrations/notifications",
        icon: Slack,
        description: "Slack notifications & alerts",
      },
      {
        name: "Webhooks",
        href: "/integrations/webhooks",
        icon: Webhook,
        description: "Webhook setup & logs",
      },
    ],
  },
  {
    name: "Testing & Development",
    items: [
      {
        name: "Testing Tools",
        href: "/testing",
        icon: FlaskConical,
        description: "Sandbox mode & flow simulator",
      },
      {
        name: "Prompt Debugger",
        href: "/testing/debugger",
        icon: Code,
        description: "Debug AI prompts & responses",
      },
    ],
  },
  {
    name: "System Management",
    items: [
      {
        name: "Plans & Billing",
        href: "/plans",
        icon: CreditCard,
        description: "Subscription plans and pricing",
      },
      {
        name: "Audit Logs",
        href: "/audit-logs",
        icon: ScrollText,
        description: "Track all admin changes",
      },
      {
        name: "System Logs",
        href: "/logs",
        icon: FileText,
        description: "Application logs and errors",
      },
      {
        name: "Support Tickets",
        href: "/support-tickets",
        icon: MessageSquare,
        description: "Customer support requests",
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        description: "System configuration & AI models",
      },
    ],
  },
  {
    name: "Branding (Optional)",
    items: [
      {
        name: "Branding",
        href: "/branding",
        icon: Palette,
        description: "Custom logos & themes per org",
      },
      {
        name: "Domain Management",
        href: "/domains",
        icon: Globe,
        description: "Domain & white-label options",
      },
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
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isSignedIn) return;

      try {
        const response = await adminAPI.getUserProfile();
        if (response.success && response.data) {
          setBackendUser(response.data);
        }
      } catch {
        // Silently handle profile loading errors
      }
    };

    fetchUserProfile();
  }, [isSignedIn]);

  // Admin status monitoring - check for admin user/organization deactivation
  useAdminStatusMonitor({
    checkInterval: 60 * 1000, // Check every 60 seconds
    enabled: true, // Always enabled for admin panel
  });

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
    } catch {
      // Silently handle sign out errors
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CallFlowHQ</h1>
              <p className="text-xs text-slate-300">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-300 hover:bg-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.name} className="space-y-3">
              {/* Section Header */}
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.name}
              </h3>

              {/* Section Items */}
              <div className="space-y-1">
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
                      className={`group w-full text-left px-3 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 shadow-sm border border-blue-200"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-md ${
                          isActive
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                System Status
              </p>
              <p className="text-xs text-green-600">All systems operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search admin panel..."
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {userInitials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-900">
                      {displayName}
                    </div>
                    <div className="text-xs text-slate-500">
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
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-scaleIn">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white font-semibold">
                          {userInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900">
                            {displayName}
                          </div>
                          <div className="text-sm text-slate-500 truncate">
                            {displayUser.email}
                          </div>
                          <div className="flex items-center mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-xs text-green-600 font-medium">
                              {backendUser?.role
                                ? backendUser.role === "admin"
                                  ? "Administrator"
                                  : backendUser.role === "platform_admin"
                                  ? "Platform Administrator"
                                  : backendUser.role === "platform_member"
                                  ? "Platform Member"
                                  : "Member"
                                : "Administrator"}
                            </span>
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
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-3 transition-colors"
                      >
                        <div className="p-1.5 bg-slate-100 rounded-md">
                          <User className="h-4 w-4 text-slate-600" />
                        </div>
                        <span>My Profile</span>
                      </button>

                      <div className="border-t border-slate-100 my-2"></div>

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                      >
                        <div className="p-1.5 bg-red-100 rounded-md">
                          <LogOut className="h-4 w-4 text-red-600" />
                        </div>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <div className="animate-fadeIn">{children}</div>
        </main>
      </div>
    </div>
  );
}
