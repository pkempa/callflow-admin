"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminAPI, Parameter, CompanyInfo } from "@/lib/admin-api";
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
  Building,
  MapPin,
  Shield,
  Globe,
  Info,
  Clock,
  AlertTriangle,
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

// Company Information Tab Component
function CompanyInfoTab() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch company information
  const {
    data: companyResponse,
    isLoading: isLoadingCompanyInfo,
    error: companyError,
    refetch: refetchCompanyInfo,
  } = useQuery({
    queryKey: ["admin-company-info"],
    queryFn: () => adminAPI.getCompanyInfo(),
  });

  useEffect(() => {
    if (companyResponse?.success) {
      // If we have company info, use it; otherwise initialize with defaults
      const existingInfo = companyResponse.data?.company_info;

      if (existingInfo && Object.keys(existingInfo).length > 0) {
        setCompanyInfo(existingInfo);
      } else {
        // Initialize with default structure when no data exists
        setCompanyInfo({
          name: "",
          legal_name: "",
          description: "",
          contact: {
            support_email: "",
            sales_email: "",
            general_email: "",
            phone: "",
            toll_free: "",
          },
          address: {
            street: "",
            suite: "",
            city: "",
            state: "",
            postal_code: "",
            country: "",
          },
          business_hours: {
            timezone: "America/Los_Angeles",
            formatted: {
              weekdays: "Monday - Friday: 9:00 AM - 6:00 PM PST",
              weekends: "Saturday - Sunday: 10:00 AM - 4:00 PM PST",
            },
          },
          legal: {
            privacy_email: "",
            legal_email: "",
            dpo_email: "",
            registered_year: "",
            registration_state: "",
          },
          social: {
            website: "",
            twitter: "",
            linkedin: "",
            github: "",
            blog: "",
            status_page: "",
            help_center: "",
            community: "",
          },
          about: {
            founded: "",
            mission: "",
            vision: "",
            headquarters: "",
            team_size: "",
            funding_stage: "",
          },
          emergency: {
            phone: "",
            email: "",
            description: "",
          },
        });
      }
    }
  }, [companyResponse]);

  const handleSave = async () => {
    if (!companyInfo) return;

    setSaving(true);
    try {
      const response = await adminAPI.updateCompanyInfo(companyInfo);
      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        refetchCompanyInfo();
      }
    } catch (error) {
      console.error("Failed to save company info:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!companyInfo) return;

    setCompanyInfo((prev) => {
      if (!prev) return prev;

      const updated = { ...prev };
      const parts = field.split(".");
      let current: any = updated;

      // Navigate to the parent object, creating nested objects as needed
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part] || typeof current[part] !== "object") {
          current[part] = {};
        } else {
          // Deep clone the nested object to avoid mutation
          current[part] = { ...current[part] };
        }
        current = current[part];
      }

      // Set the final value
      const lastPart = parts[parts.length - 1];
      current[lastPart] = value;

      return updated;
    });
  };

  if (isLoadingCompanyInfo) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">
          Loading company information...
        </p>
      </div>
    );
  }

  if (companyError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-sm text-red-700">
          Failed to load company information: {(companyError as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Building className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Basic Information
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={companyInfo?.name || ""}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legal Name
              </label>
              <input
                type="text"
                value={companyInfo?.legal_name || ""}
                onChange={(e) => updateField("legal_name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={companyInfo?.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Contact Information
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={companyInfo?.contact?.support_email || ""}
                onChange={(e) =>
                  updateField("contact.support_email", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Email
              </label>
              <input
                type="email"
                value={companyInfo?.contact?.sales_email || ""}
                onChange={(e) =>
                  updateField("contact.sales_email", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                General Email
              </label>
              <input
                type="email"
                value={companyInfo?.contact?.general_email || ""}
                onChange={(e) =>
                  updateField("contact.general_email", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={companyInfo?.contact?.phone || ""}
                onChange={(e) => updateField("contact.phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Toll-Free Number
              </label>
              <input
                type="tel"
                value={companyInfo?.contact?.toll_free || ""}
                onChange={(e) =>
                  updateField("contact.toll_free", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Address Information
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={companyInfo?.address?.street || ""}
                onChange={(e) => updateField("address.street", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suite/Unit
              </label>
              <input
                type="text"
                value={companyInfo?.address?.suite || ""}
                onChange={(e) => updateField("address.suite", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={companyInfo?.address?.city || ""}
                onChange={(e) => updateField("address.city", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={companyInfo?.address?.state || ""}
                onChange={(e) => updateField("address.state", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={companyInfo?.address?.postal_code || ""}
                onChange={(e) =>
                  updateField("address.postal_code", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={companyInfo?.address?.country || ""}
                onChange={(e) => updateField("address.country", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Support Information
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Chat Available
              </label>
              <select
                value={companyInfo?.support?.live_chat ? "true" : "false"}
                onChange={(e) =>
                  updateField("support.live_chat", e.target.value === "true")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Support Available
              </label>
              <select
                value={companyInfo?.support?.phone_support ? "true" : "false"}
                onChange={(e) =>
                  updateField(
                    "support.phone_support",
                    e.target.value === "true"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Support Available
              </label>
              <select
                value={companyInfo?.support?.email_support ? "true" : "false"}
                onChange={(e) =>
                  updateField(
                    "support.email_support",
                    e.target.value === "true"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Legal Information
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Email
              </label>
              <input
                type="email"
                value={companyInfo?.legal?.privacy_email || ""}
                onChange={(e) =>
                  updateField("legal.privacy_email", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Legal Email
              </label>
              <input
                type="email"
                value={companyInfo?.legal?.legal_email || ""}
                onChange={(e) =>
                  updateField("legal.legal_email", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Protection Officer Email
              </label>
              <input
                type="email"
                value={companyInfo?.legal?.dpo_email || ""}
                onChange={(e) => updateField("legal.dpo_email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration State
              </label>
              <input
                type="text"
                value={companyInfo?.legal?.registration_state || ""}
                onChange={(e) =>
                  updateField("legal.registration_state", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registered Year
              </label>
              <input
                type="text"
                value={companyInfo?.legal?.registered_year || ""}
                onChange={(e) =>
                  updateField("legal.registered_year", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID (Optional)
              </label>
              <input
                type="text"
                value={companyInfo?.legal?.tax_id || ""}
                onChange={(e) => updateField("legal.tax_id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="XX-XXXXXXX"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media & Links */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Social Media & External Links
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={companyInfo?.social?.website || ""}
                onChange={(e) => updateField("social.website", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://callflowHQ.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Page
              </label>
              <input
                type="url"
                value={companyInfo?.social?.status_page || ""}
                onChange={(e) =>
                  updateField("social.status_page", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://status.callflowHQ.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Help Center
              </label>
              <input
                type="url"
                value={companyInfo?.social?.help_center || ""}
                onChange={(e) =>
                  updateField("social.help_center", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://help.callflowHQ.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community
              </label>
              <input
                type="url"
                value={companyInfo?.social?.community || ""}
                onChange={(e) =>
                  updateField("social.community", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://community.callflowHQ.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={companyInfo?.social?.twitter || ""}
                onChange={(e) => updateField("social.twitter", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://twitter.com/callflowHQ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={companyInfo?.social?.linkedin || ""}
                onChange={(e) => updateField("social.linkedin", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://linkedin.com/company/callflowHQ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub
              </label>
              <input
                type="url"
                value={companyInfo?.social?.github || ""}
                onChange={(e) => updateField("social.github", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://github.com/callflowHQ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog
              </label>
              <input
                type="url"
                value={companyInfo?.social?.blog || ""}
                onChange={(e) => updateField("social.blog", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://blog.callflowHQ.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* About Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              About Information
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Founded Year
              </label>
              <input
                type="text"
                value={companyInfo?.about?.founded || ""}
                onChange={(e) => updateField("about.founded", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2023"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Headquarters
              </label>
              <input
                type="text"
                value={companyInfo?.about?.headquarters || ""}
                onChange={(e) =>
                  updateField("about.headquarters", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Size
              </label>
              <input
                type="text"
                value={companyInfo?.about?.team_size || ""}
                onChange={(e) => updateField("about.team_size", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="10-50 employees"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funding Stage
              </label>
              <input
                type="text"
                value={companyInfo?.about?.funding_stage || ""}
                onChange={(e) =>
                  updateField("about.funding_stage", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Seed, Series A, etc."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mission Statement
            </label>
            <textarea
              value={companyInfo?.about?.mission || ""}
              onChange={(e) => updateField("about.mission", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="To democratize business communications..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vision Statement
            </label>
            <textarea
              value={companyInfo?.about?.vision || ""}
              onChange={(e) => updateField("about.vision", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="A world where every business can communicate effectively..."
            />
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Business Hours
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <input
              type="text"
              value={companyInfo?.business_hours?.timezone || ""}
              onChange={(e) =>
                updateField("business_hours.timezone", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="America/Los_Angeles"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekdays Hours
              </label>
              <input
                type="text"
                value={companyInfo?.business_hours?.formatted?.weekdays || ""}
                onChange={(e) =>
                  updateField(
                    "business_hours.formatted.weekdays",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Monday - Friday: 9:00 AM - 6:00 PM PST"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weekend Hours
              </label>
              <input
                type="text"
                value={companyInfo?.business_hours?.formatted?.weekends || ""}
                onChange={(e) =>
                  updateField(
                    "business_hours.formatted.weekends",
                    e.target.value
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Saturday - Sunday: 10:00 AM - 4:00 PM PST"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Emergency Contact
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Phone
              </label>
              <input
                type="tel"
                value={companyInfo?.emergency?.phone || ""}
                onChange={(e) => updateField("emergency.phone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1 (555) 911-HELP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Email
              </label>
              <input
                type="email"
                value={companyInfo?.emergency?.email || ""}
                onChange={(e) => updateField("emergency.email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="emergency@callflowHQ.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Description
            </label>
            <input
              type="text"
              value={companyInfo?.emergency?.description || ""}
              onChange={(e) =>
                updateField("emergency.description", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="For critical service outages only"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !companyInfo}
          className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Company Information"}
        </button>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          Company information saved successfully!
        </div>
      )}
    </div>
  );
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
  const [activeTab, setActiveTab] = useState<
    "general" | "parameters" | "company"
  >("general");
  const [showParameterValues, setShowParameterValues] = useState(false);
  // Parameter editing states - reserved for future functionality
  // const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  // const [creatingParameter, setCreatingParameter] = useState(false);

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
            <button
              onClick={() => setActiveTab("company")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "company"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Building className="h-4 w-4 inline mr-2" />
              Company Information
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
                      onClick={() => {
                        /* Future: Create parameter functionality */
                      }}
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
                                onClick={() => {
                                  /* Future: Edit parameter functionality */
                                }}
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

        {/* Company Information Tab */}
        {activeTab === "company" && <CompanyInfoTab />}

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
