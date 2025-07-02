"use client";

import React, { useState, useEffect, useRef } from "react";
import { adminAPI, Organization } from "@/lib/admin-api";
import { Search, Building, Hash, ChevronDown, Check } from "lucide-react";

interface OrganizationSelectProps {
  value?: string;
  onChange: (organizationId: string, organization: Organization | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export function OrganizationSelect({
  value,
  onChange,
  placeholder = "Search by name, account number (154788), or ID...",
  className = "",
  disabled = false,
  required = false,
  error,
}: OrganizationSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length > 0 || isOpen) {
        searchOrganizations(searchTerm);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen]);

  // Load organization if value is provided
  useEffect(() => {
    if (value && !selectedOrg) {
      loadOrganizationById(value);
    }
  }, [value, selectedOrg]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchOrganizations = async (query: string) => {
    setLoading(true);
    try {
      let searchTerm = query.trim();
      let searchQueries = [searchTerm]; // Always include original search term first

      // If query looks like numbers (partial or full account number)
      if (/^\d+$/.test(searchTerm)) {
        // Add CF- prefix version for account number search
        searchQueries.push(`CF-${searchTerm}`);
      }

      // If query starts with "cf" (case insensitive) but no dash, add the dash
      if (
        searchTerm.toLowerCase().startsWith("cf") &&
        !searchTerm.includes("-")
      ) {
        const numbers = searchTerm.substring(2);
        if (numbers) {
          searchQueries.push(`CF-${numbers}`);
        }
      }

      // Try each search query until we find results
      let organizations: any[] = [];

      for (const search of searchQueries) {
        const response = await adminAPI.getOrganizations({
          search: search,
          limit: 20,
        });

        if (
          response.success &&
          response.data &&
          response.data.organizations.length > 0
        ) {
          organizations = response.data.organizations;
          break; // Found results, stop searching
        }
      }

      setOrganizations(organizations);
    } catch (error) {
      console.error("Error searching organizations:", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationById = async (orgId: string) => {
    try {
      const response = await adminAPI.getOrganizations({
        search: orgId,
        limit: 50,
      });

      if (response.success && response.data) {
        const org = response.data.organizations.find((o) => o.id === orgId);
        if (org) {
          setSelectedOrg(org);
        }
      }
    } catch (error) {
      console.error("Error loading organization:", error);
    }
  };

  const handleSelect = (org: Organization) => {
    setSelectedOrg(org);
    onChange(org.id, org);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    setSelectedOrg(null);
    onChange("", null);
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const formatAccountNumber = (org: Organization) => {
    return org.account_number || `#${org.id.slice(-8).toUpperCase()}`;
  };

  const getDisplayValue = () => {
    if (selectedOrg) {
      return `${selectedOrg.name} (${formatAccountNumber(selectedOrg)})`;
    }
    return searchTerm;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : getDisplayValue()}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
            if (selectedOrg && e.target.value !== getDisplayValue()) {
              setSelectedOrg(null);
              onChange("", null);
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            if (selectedOrg) {
              setSearchTerm("");
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full h-10 pl-10 pr-8 py-2 bg-white border rounded-md text-sm focus:outline-none focus:ring-1 transition-colors ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />

        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center hover:bg-slate-100 rounded transition-colors"
        >
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {selectedOrg && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        )}
      </div>

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 text-center text-slate-500">
              <div className="animate-spin inline-block w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full mr-2"></div>
              Searching organizations...
            </div>
          ) : organizations.length === 0 ? (
            <div className="p-3 text-center text-slate-500">
              {searchTerm
                ? "No organizations found"
                : "Start typing to search organizations"}
            </div>
          ) : (
            <div className="py-1">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => handleSelect(org)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50 focus:outline-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-900 truncate">
                          {org.name}
                        </span>
                        {selectedOrg?.id === org.id && (
                          <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {formatAccountNumber(org)}
                        </span>
                        <span className="capitalize">{org.plan}</span>
                        <span>{org.user_count} users</span>
                        {!org.is_active && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
