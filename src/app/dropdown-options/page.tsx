"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { adminAPI, DropdownOption } from "@/lib/admin-api";
import NewAdminLayout from "@/components/layout/NewAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, Save } from "lucide-react";

type OptionType =
  | "team_sizes"
  | "industries"
  | "use_cases"
  | "job_titles"
  | "departments";

interface EditingOption {
  type: OptionType;
  option: DropdownOption;
  isNew: boolean;
}

export default function DropdownOptionsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [options, setOptions] = useState<{
    team_sizes: DropdownOption[];
    industries: DropdownOption[];
    use_cases: DropdownOption[];
    job_titles: DropdownOption[];
    departments: DropdownOption[];
  }>({
    team_sizes: [],
    industries: [],
    use_cases: [],
    job_titles: [],
    departments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<OptionType>("job_titles");

  // Edit dialog state
  const [editDialog, setEditDialog] = useState(false);
  const [editingOption, setEditingOption] = useState<EditingOption | null>(
    null
  );
  const [formData, setFormData] = useState({
    value: "",
    label: "",
    sort_order: 1,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    } else if (isLoaded && isSignedIn) {
      fetchOptions();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDropdownOptions();
      if (response.success && response.data) {
        setOptions(response.data);
      } else {
        throw new Error(response.error || "Failed to fetch dropdown options");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dropdown options"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: OptionType, option: DropdownOption) => {
    setEditingOption({ type, option, isNew: false });
    setFormData({
      value: option.value,
      label: option.label,
      sort_order: option.sort_order,
    });
    setEditDialog(true);
  };

  const handleAdd = (type: OptionType) => {
    const maxSortOrder = Math.max(
      ...(options[type]?.map((o) => o.sort_order) || [0])
    );
    setEditingOption({
      type,
      option: { value: "", label: "", sort_order: maxSortOrder + 1 },
      isNew: true,
    });
    setFormData({
      value: "",
      label: "",
      sort_order: maxSortOrder + 1,
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!editingOption) return;

    try {
      setSaving(true);

      if (editingOption.isNew) {
        const response = await adminAPI.createDropdownOption(
          editingOption.type,
          formData
        );
        if (response.success && response.data) {
          setOptions((prev) => ({
            ...prev,
            [editingOption.type]: [
              ...prev[editingOption.type],
              response.data,
            ].sort((a, b) => (a?.sort_order || 0) - (b?.sort_order || 0)),
          }));
        } else {
          throw new Error(response.error || "Failed to create option");
        }
      } else {
        const response = await adminAPI.updateDropdownOption(
          editingOption.type,
          editingOption.option.id!,
          formData
        );
        if (response.success && response.data) {
          setOptions((prev) => ({
            ...prev,
            [editingOption.type]: prev[editingOption.type]
              .map((o) =>
                o.id === editingOption.option.id ? response.data! : o
              )
              .sort((a, b) => (a?.sort_order || 0) - (b?.sort_order || 0)),
          }));
        } else {
          throw new Error(response.error || "Failed to update option");
        }
      }

      setEditDialog(false);
      setEditingOption(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to save option"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: OptionType, option: DropdownOption) => {
    if (!option.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${option.label}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      const response = await adminAPI.deleteDropdownOption(type, option.id);
      if (response.success) {
        setOptions((prev) => ({
          ...prev,
          [type]: prev[type].filter((o) => o.id !== option.id),
        }));
      } else {
        throw new Error(response.error || "Failed to delete option");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to delete option"
      );
    } finally {
      setSaving(false);
    }
  };

  const getTypeTitle = (type: OptionType) => {
    switch (type) {
      case "team_sizes":
        return "Team Sizes";
      case "industries":
        return "Industries";
      case "use_cases":
        return "Use Cases";
      case "job_titles":
        return "Job Titles";
      case "departments":
        return "Departments";
      default:
        return type;
    }
  };

  const getTypeDescription = (type: OptionType) => {
    switch (type) {
      case "team_sizes":
        return "Organization team size options for onboarding and settings";
      case "industries":
        return "Industry categories for business classification";
      case "use_cases":
        return "Primary use case options for business onboarding";
      case "job_titles":
        return "Standardized job title options for user profiles";
      case "departments":
        return "Department options for user and organization management";
      default:
        return "";
    }
  };

  if (!isLoaded) {
    return (
      <NewAdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </NewAdminLayout>
    );
  }

  return (
    <NewAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dropdown Options Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage dropdown options used throughout the platform for consistency
            and user experience.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 mt-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Show helpful message when no options exist */}
        {!loading &&
          Object.values(options).every((arr) => arr.length === 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    No dropdown options configured
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>To populate the dropdown options, you can either:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>
                        Use the {'"Add Option"'} buttons below to create options
                        manually
                      </li>
                      <li>
                        Run the seeding script:{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          python seed_dropdown_options.py
                        </code>{" "}
                        from the callflow-backend directory
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as OptionType)}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="job_titles">Job Titles</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="team_sizes">Team Sizes</TabsTrigger>
              <TabsTrigger value="industries">Industries</TabsTrigger>
              <TabsTrigger value="use_cases">Use Cases</TabsTrigger>
            </TabsList>

            {(
              [
                "job_titles",
                "departments",
                "team_sizes",
                "industries",
                "use_cases",
              ] as OptionType[]
            ).map((type) => (
              <TabsContent key={type} value={type}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{getTypeTitle(type)}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {getTypeDescription(type)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdd(type)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={saving}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </button>
                  </CardHeader>
                  <CardContent>
                    {options[type].length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="mb-4">
                          No options configured for{" "}
                          {getTypeTitle(type).toLowerCase()}.
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => handleAdd(type)}
                            className="block mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Add Option Manually
                          </button>
                          <p className="text-xs text-gray-400">
                            Or use the seeding script to populate default
                            options
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {options[type].map((option, index) => (
                          <div
                            key={option.id || index}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="text-xs">
                                  Order: {option.sort_order}
                                </Badge>
                                <span className="font-medium">
                                  {option.label}
                                </span>
                                {option.value !== option.label && (
                                  <span className="text-sm text-gray-500">
                                    ({option.value})
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(type, option)}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                disabled={saving}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(type, option)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                disabled={saving}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialog} onOpenChange={setEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingOption?.isNew ? "Add" : "Edit"}{" "}
                {editingOption ? getTypeTitle(editingOption.type) : ""} Option
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="label">Display Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder="e.g., Small Business"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="value">Value *</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, value: e.target.value }))
                  }
                  placeholder="e.g., small_business (usually same as label)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Technical value stored in database. Usually the same as
                  display label.
                </p>
              </div>
              <div>
                <Label htmlFor="sort_order">Sort Order *</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="1"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sort_order: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Display order (lower numbers appear first)
                </p>
              </div>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setEditDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving || !formData.label.trim() || !formData.value.trim()
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingOption?.isNew ? "Create" : "Update"} Option
                  </>
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </NewAdminLayout>
  );
}
