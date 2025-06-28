"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminAPI, Parameter } from "@/lib/admin-api";
import {
  Save,
  Database,
  Mail,
  Settings as SettingsIcon,
  Key,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
} from "lucide-react";

interface Settings {
  systemName: string;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maxUsersPerPlan: number;
  supportEmail: string;
  apiRateLimit: number;
}

export default function SettingsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<Settings>({
    systemName: "CallFlowHQ",
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: true,
    maxUsersPerPlan: 1000,
    supportEmail: "support@callflowhq.com",
    apiRateLimit: 1000,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Parameter management states
  const [activeTab, setActiveTab] = useState<"general" | "parameters">(
    "general"
  );
  const [showParameterValues, setShowParameterValues] = useState(false);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(
    null
  );
  const [creatingParameter, setCreatingParameter] = useState(false);

  // Fetch parameters
  const {
    data: parametersResponse,
    isLoading: parametersLoading,
    error: parametersError,
  } = useQuery({
    queryKey: ["admin-parameters", showParameterValues],
    queryFn: () =>
      adminAPI.getParameters({ include_values: showParameterValues }),
    enabled: isLoaded && isSignedIn && activeTab === "parameters",
  });

  // Parameter mutations
  const updateParameterMutation = useMutation({
    mutationFn: ({ name, data }: { name: string; data: any }) =>
      adminAPI.updateParameter(name, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-parameters"] });
      setEditingParameter(null);
    },
  });

  const createParameterMutation = useMutation({
    mutationFn: (data: any) => adminAPI.createParameter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-parameters"] });
      setCreatingParameter(false);
    },
  });

  const deleteParameterMutation = useMutation({
    mutationFn: (name: string) => adminAPI.deleteParameter(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-parameters"] });
    },
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleInputChange = (
    field: keyof Settings,
    value: string | boolean | number
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">
            Configure system-wide settings and preferences
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("general")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "general"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <SettingsIcon className="h-4 w-4 inline mr-2" />
              General Settings
            </button>
            <button
              onClick={() => setActiveTab("parameters")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "parameters"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Key className="h-4 w-4 inline mr-2" />
              System Parameters
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <SettingsIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    General Settings
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      System Name
                    </label>
                    <input
                      type="text"
                      value={settings.systemName}
                      onChange={(e) =>
                        handleInputChange("systemName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) =>
                        handleInputChange("supportEmail", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Users Per Plan
                    </label>
                    <input
                      type="number"
                      value={settings.maxUsersPerPlan}
                      onChange={(e) =>
                        handleInputChange(
                          "maxUsersPerPlan",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Rate Limit (requests/hour)
                    </label>
                    <input
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) =>
                        handleInputChange(
                          "apiRateLimit",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* System Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Database className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    System Controls
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Maintenance Mode
                    </h3>
                    <p className="text-sm text-gray-600">
                      Put the system in maintenance mode to prevent user access
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) =>
                        handleInputChange("maintenanceMode", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Notification Settings
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      Send email notifications for important events
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        handleInputChange(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      SMS Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      Send SMS notifications for critical alerts
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) =>
                        handleInputChange("smsNotifications", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Parameters Tab */}
        {activeTab === "parameters" && (
          <div className="space-y-6">
            {/* Parameters Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-gray-400 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      System Parameters
                    </h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() =>
                        setShowParameterValues(!showParameterValues)
                      }
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {showParameterValues ? (
                        <EyeOff className="h-4 w-4 mr-2" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      {showParameterValues ? "Hide Values" : "Show Values"}
                    </button>
                    <button
                      onClick={() =>
                        queryClient.invalidateQueries({
                          queryKey: ["admin-parameters"],
                        })
                      }
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </button>
                    <button
                      onClick={() => setCreatingParameter(true)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Parameter
                    </button>
                  </div>
                </div>
              </div>

              {/* Parameters Content */}
              <div className="p-6">
                {parametersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">
                      Loading parameters...
                    </p>
                  </div>
                ) : parametersError ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-sm text-red-700">
                      Failed to load parameters:{" "}
                      {(parametersError as Error).message}
                    </div>
                  </div>
                ) : parametersResponse?.data?.parameters?.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No parameters found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {parametersResponse?.data?.parameters?.map(
                      (param: Parameter) => (
                        <div
                          key={param.name}
                          className="bg-gray-50 rounded-lg border p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {param.name}
                                </h4>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                    param.type === "SecureString"
                                      ? "bg-red-100 text-red-800"
                                      : param.type === "StringList"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {param.type}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {param.description || "No description"}
                              </p>
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">
                                  Value:{" "}
                                </span>
                                <span className="text-sm font-mono text-gray-900">
                                  {showParameterValues
                                    ? param.value
                                    : param.value_preview}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-gray-400">
                                Version: {param.version} • Last modified:{" "}
                                {new Date(
                                  param.last_modified
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingParameter(param)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(`Delete parameter "${param.name}"?`)
                                  ) {
                                    deleteParameterMutation.mutate(param.name);
                                  }
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {saved && (
          <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            Settings saved successfully!
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
