"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import AdminLayout from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building,
  Users,
  Activity,
  NotebookPen,
  DollarSign,
  Settings,
  Save,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  adminAPI,
  type Organization,
  type User,
  type ActivityLog,
} from "@/lib/admin-api";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const organizationId = params.id as string;

  // Get tab from query parameter
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  // State
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  // API call timing control
  const lastApiCallRef = useRef<number>(0);

  // Use refs to get current state values without causing re-renders
  const organizationRef = useRef(organization);
  const usersRef = useRef(users);
  const activitiesRef = useRef(activities);

  // Update refs when state changes
  useEffect(() => {
    organizationRef.current = organization;
  }, [organization]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    activitiesRef.current = activities;
  }, [activities]);

  // Protected state updates to prevent data clearing unexpectedly (now stable)
  const setOrganizationProtected = useCallback(
    (newOrg: Organization | null) => {
      if (!newOrg && organizationRef.current) {
        return; // Don't clear existing data
      }
      setOrganization(newOrg);
    },
    []
  );

  const setUsersProtected = useCallback((newUsers: User[]) => {
    if (newUsers.length === 0 && usersRef.current.length > 0) {
      return; // Don't clear existing data
    }
    setUsers(newUsers);
  }, []);

  const setActivitiesProtected = useCallback((newActivities: ActivityLog[]) => {
    if (newActivities.length === 0 && activitiesRef.current.length > 0) {
      return; // Don't clear existing data
    }
    setActivities(newActivities);
  }, []);

  // On-demand loading states for activities and users
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // Add state for dynamic user count
  const [dynamicUserCount, setDynamicUserCount] = useState<number | null>(null);

  const loadActivitiesOnDemand = useCallback(() => {
    if (!organization || activitiesLoading) return;

    setActivitiesLoading(true);
    setActivitiesLoaded(true);

    adminAPI
      .getActivities({ limit: 10 })
      .then((result) => {
        if (result.success && result.data?.activities) {
          setActivitiesProtected(result.data.activities);
        } else {
          setActivitiesProtected([]);
        }
      })
      .catch(() => {
        setActivitiesProtected([]);
        setActivitiesLoaded(false); // Allow retry
      })
      .finally(() => {
        setActivitiesLoading(false);
      });
  }, [organization]);

  const loadUsersOnDemand = useCallback(async () => {
    if (!organization || usersLoading) return;

    setUsersLoading(true);
    setUsersLoaded(true);

    let usersLoadedSuccessfully = false;
    let loadedUsers: User[] = [];

    try {
      // Try the new admin users API first
      const usersResponse = await adminAPI.getAdminUsers({
        organization_id: organization.id,
        limit: 100,
      });

      if (usersResponse.success && usersResponse.data?.users) {
        loadedUsers = usersResponse.data.users;
        setUsersProtected(loadedUsers);
        usersLoadedSuccessfully = true;
      }
    } catch {
      // Admin users API failed, will try legacy API
    }

    // Try legacy API if admin API failed
    if (!usersLoadedSuccessfully) {
      try {
        const legacyUsersResponse = await adminAPI.getUsers(organization.id);

        if (legacyUsersResponse.success && legacyUsersResponse.data?.users) {
          loadedUsers = legacyUsersResponse.data.users;
          setUsersProtected(loadedUsers);
          usersLoadedSuccessfully = true;
        }
      } catch {
        // Legacy users API also failed
      }
    }

    if (!usersLoadedSuccessfully) {
      setUsersProtected([]);
      setUsersLoaded(false); // Allow retry
    } else {
      // Update dynamic user count with actual loaded count
      setDynamicUserCount(loadedUsers.length);
    }

    setUsersLoading(false);
  }, [organization]);

  // Function to load just the user count (lightweight)
  const loadUserCount = useCallback(async () => {
    if (!organization || dynamicUserCount !== null) return;

    try {
      // Use the admin users API to get user count
      const usersResponse = await adminAPI.getAdminUsers({
        organization_id: organization.id,
        limit: 1, // We only need the count, so limit to 1 for efficiency
      });

      if (usersResponse.success && usersResponse.data?.pagination) {
        // Use the total count from pagination
        setDynamicUserCount(usersResponse.data.pagination.total);
      } else {
        // Fallback: try legacy API
        const legacyResponse = await adminAPI.getUsers(organization.id);
        if (legacyResponse.success && legacyResponse.data?.users) {
          setDynamicUserCount(legacyResponse.data.users.length);
        }
      }
    } catch (error) {
      console.error("Failed to load user count:", error);
      // Don't set an error state for this, just keep the stored count
    }
  }, [organization, dynamicUserCount]);

  // Handle tab changes and trigger on-demand loading
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (newTab === "activity") {
      loadActivitiesOnDemand();
    } else if (newTab === "users") {
      loadUsersOnDemand();
    }
  };

  // Load data if user starts on Activity or Users tab
  useEffect(() => {
    if (organization && !loading) {
      if (activeTab === "activity") {
        loadActivitiesOnDemand();
      } else if (activeTab === "users") {
        loadUsersOnDemand();
      }

      // Always load user count for accurate display
      loadUserCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, organization]);

  // Reset and refetch function for manual refresh
  const resetAndFetch = async () => {
    // Reset all state first
    setOrganizationProtected(null);
    setUsersProtected([]);
    setActivitiesProtected([]);
    setError(null);
    setLoading(false);
    setHasAttemptedFetch(false);
    setActivitiesLoaded(false);
    setActivitiesLoading(false);
    setUsersLoaded(false);
    setUsersLoading(false);

    // Reset auth system
    const { resetAuthSystem } = await import("@/lib/admin-api");
    resetAuthSystem();

    // Allow state updates to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Load fresh data
    await loadOrganizationData();
  };

  // Notes state
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [currentAdminUser, setCurrentAdminUser] =
    useState<string>("[Loading...]");

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
  }, [isLoaded, isSignedIn, router]);

  const loadCurrentUser = async () => {
    try {
      const profile = await adminAPI.getUserProfile();
      if (profile.success && profile.data) {
        setCurrentAdminUser(
          `${profile.data.first_name} ${profile.data.last_name}`
        );
      }
    } catch {
      setCurrentAdminUser("[Admin User]");
    }
  };

  const loadOrganizationData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (hasAttemptedFetch && loading) {
      return;
    }

    // Prevent rapid successive calls
    const now = Date.now();
    if (lastApiCallRef.current && now - lastApiCallRef.current < 1000) {
      return;
    }
    lastApiCallRef.current = now;

    try {
      setLoading(true);
      setHasAttemptedFetch(true);
      setError(null);

      // Check auth status
      const { waitForAuth, isAuthReady } = await import("@/lib/admin-api");

      if (!isAuthReady()) {
        const authReady = await waitForAuth(5000);
        if (!authReady) {
          setError("Authentication timeout. Please refresh the page.");
          setLoading(false);
          return;
        }
      }

      // Brief pause for auth stability
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Load all organizations and find the specific one
      const orgResponse = await adminAPI.getOrganizations({
        limit: 100,
      });

      if (orgResponse.success && orgResponse.data?.organizations) {
        const org = orgResponse.data.organizations.find(
          (o) => o.id === organizationId
        );
        if (org) {
          setOrganizationProtected(org);
        } else {
          // If not found in first batch, try a search
          const searchResponse = await adminAPI.getOrganizations({
            search: organizationId.slice(-8),
            limit: 50,
          });

          if (searchResponse.success && searchResponse.data?.organizations) {
            const searchedOrg = searchResponse.data.organizations.find(
              (o) => o.id === organizationId
            );
            if (searchedOrg) {
              setOrganizationProtected(searchedOrg);
            } else {
              setError("Organization not found");
              return;
            }
          } else {
            setError("Organization not found");
            return;
          }
        }
      } else {
        setError("Failed to load organizations");
        return;
      }

      // Clear any previous errors if we got this far
      setError(null);
    } catch {
      setError(
        "Failed to load organization data. Please try refreshing the page."
      );
    } finally {
      setLoading(false);
    }
  }, [hasAttemptedFetch, organizationId, setOrganizationProtected]);

  // Initialize organization data loading
  useEffect(() => {
    if (isLoaded && isSignedIn && organizationId && !hasAttemptedFetch) {
      // Prevent multiple simultaneous loads
      let isCancelled = false;

      const initializeData = async () => {
        // Ensure auth system is ready
        const delay =
          typeof window !== "undefined" &&
          window.performance?.navigation?.type === 1
            ? 800
            : 500;

        await new Promise((resolve) => setTimeout(resolve, delay));

        if (!isCancelled) {
          await loadCurrentUser();
          await loadOrganizationData();
        }
      };

      initializeData();

      return () => {
        isCancelled = true;
      };
    }
  }, [
    isLoaded,
    isSignedIn,
    organizationId,
    hasAttemptedFetch,
    loadOrganizationData,
  ]);

  const handleSaveNote = async () => {
    if (!organization || !newNote.trim() || savingNote) {
      return;
    }

    try {
      setSavingNote(true);

      const timestamp = new Date().toLocaleString();
      const existingNotes = organization.admin_notes || "";
      const formattedNote = existingNotes
        ? `${existingNotes}\n\n--- Added ${timestamp} by ${currentAdminUser} ---\n${newNote.trim()}`
        : `--- Added ${timestamp} by ${currentAdminUser} ---\n${newNote.trim()}`;

      const response = await adminAPI.saveOrganizationNotes(
        organization.id,
        formattedNote
      );

      if (response.success) {
        // Update organization with new notes using protected setter
        setOrganizationProtected(
          organization
            ? {
                ...organization,
                admin_notes: formattedNote,
                has_notes: true,
                updated_at: new Date().toISOString(),
              }
            : null
        );
        setNewNote("");
        alert("Note saved successfully!");
      } else {
        alert("Failed to save note: " + (response.error || "Unknown error"));
      }
    } catch {
      alert("Failed to save note. Please try again.");
    } finally {
      setSavingNote(false);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error || (!organization && !loading)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600">{error || "Organization not found"}</p>
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={resetAndFetch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {organization?.name || "Loading..."}
            </h1>
            <p className="text-gray-600">
              Account Number:{" "}
              {organization?.account_number ||
                `#${organization?.id?.slice(-8).toUpperCase()}` ||
                "..."}
            </p>
          </div>
          <div className="ml-auto">
            {organization && (
              <Badge
                variant={organization.is_active ? "default" : "destructive"}
              >
                {organization.is_active ? "Active" : "Inactive"}
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <NotebookPen className="h-4 w-4" />
              Notes
              {organization?.has_notes && (
                <span className="ml-1 w-2 h-2 bg-amber-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users (
              {dynamicUserCount !== null
                ? dynamicUserCount
                : organization?.user_count || 0}
              )
              {usersLoading && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
              {activitiesLoading && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              )}
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Plan</Label>
                    <p className="font-medium capitalize">
                      {organization?.plan || "Loading..."}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Team Size</Label>
                    <p className="font-medium">
                      {organization?.team_size || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Industry</Label>
                    <p className="font-medium">
                      {organization?.industry || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Created</Label>
                    <p className="font-medium">
                      {organization?.created_at
                        ? new Date(organization.created_at).toLocaleDateString()
                        : "Loading..."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">Users</Label>
                    <p className="font-medium">
                      {dynamicUserCount !== null
                        ? dynamicUserCount
                        : organization?.user_count || 0}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      Wallet Balance
                    </Label>
                    <p className="font-medium">
                      ${organization?.wallet_balance?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Status</Label>
                    <Badge
                      variant={
                        organization?.is_active ? "default" : "destructive"
                      }
                    >
                      {organization?.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                  <p className="text-sm text-gray-600">
                    Internal notes visible only to admin users
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing Notes */}
                  {organization?.admin_notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-xs text-gray-500 mb-2">
                        Last updated:{" "}
                        {organization?.updated_at
                          ? new Date(
                              organization.updated_at
                            ).toLocaleDateString()
                          : "Unknown"}
                      </div>
                      <div className="text-sm whitespace-pre-wrap font-mono">
                        {organization.admin_notes}
                      </div>
                    </div>
                  )}

                  {/* Add New Note */}
                  <div className="space-y-3">
                    <Label htmlFor="new-note">
                      {organization?.admin_notes ? "Add Note" : "Notes"}
                    </Label>
                    <Textarea
                      id="new-note"
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add your notes here..."
                      className="min-h-[120px] resize-none"
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Will be saved by {currentAdminUser}
                      </span>
                      <span className="text-xs text-gray-400">
                        {newNote.length}/1000
                      </span>
                    </div>
                    <button
                      onClick={handleSaveNote}
                      disabled={savingNote || !newNote.trim()}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {savingNote ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Note
                        </>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Users (
                    {dynamicUserCount !== null
                      ? dynamicUserCount
                      : organization?.user_count || 0}
                    )
                    {users.length > 0 &&
                      users.length !==
                        (dynamicUserCount !== null
                          ? dynamicUserCount
                          : organization?.user_count || 0) && (
                        <span className="text-sm text-gray-500">
                          ({users.length} loaded)
                        </span>
                      )}
                  </div>
                  <button
                    onClick={() => {
                      setUsersLoaded(false);
                      setUsersProtected([]);
                      loadUsersOnDemand();
                    }}
                    disabled={usersLoading}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        usersLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading users...</span>
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{user.role}</Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {user.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">
                      {usersLoaded
                        ? `No users loaded. This organization has ${
                            dynamicUserCount !== null
                              ? dynamicUserCount
                              : organization?.user_count || 0
                          } total users. Try refreshing to load user details.`
                        : `This organization has ${
                            dynamicUserCount !== null
                              ? dynamicUserCount
                              : organization?.user_count || 0
                          } users. Click the button below to load user details.`}
                    </p>
                    {!usersLoaded && (
                      <button
                        onClick={loadUsersOnDemand}
                        disabled={usersLoading}
                        className="mx-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {usersLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Users className="h-4 w-4" />
                        )}
                        {usersLoading ? "Loading..." : "Load Users"}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </div>
                  <button
                    onClick={() => {
                      setActivitiesLoaded(false);
                      setActivitiesProtected([]);
                      loadActivitiesOnDemand();
                    }}
                    disabled={activitiesLoading}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        activitiesLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">
                      Loading activities...
                    </span>
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.slice(0, 20).map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <Activity className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">
                      {activitiesLoaded
                        ? "No activities found for this organization yet. Activities will appear when users perform actions like registering, upgrading plans, creating API keys, or purchasing phone numbers."
                        : "Activities load on demand. Click the button below to load recent activities for this organization."}
                    </p>
                    {!activitiesLoaded && (
                      <button
                        onClick={loadActivitiesOnDemand}
                        disabled={activitiesLoading}
                        className="mx-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {activitiesLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                        {activitiesLoading ? "Loading..." : "Load Activities"}
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">
                      Current Plan
                    </Label>
                    <p className="font-medium capitalize">
                      {organization?.plan || "Loading..."}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">
                      Wallet Balance
                    </Label>
                    <p className="font-medium">
                      ${organization?.wallet_balance?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
