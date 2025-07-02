"use client";

import React, { useState, useEffect } from "react";
import { adminAPI, DropdownOption } from "@/lib/admin-api";

interface DropdownSelectProps {
  type:
    | "job_titles"
    | "departments"
    | "team_sizes"
    | "industries"
    | "use_cases";
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

export function DropdownSelect({
  type,
  value,
  onChange,
  placeholder = "Select an option...",
  className = "",
  disabled = false,
  allowEmpty = true,
  emptyLabel = "Not specified",
}: DropdownSelectProps) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminAPI.getDropdownOptions();

        if (response.success && response.data) {
          const typeOptions = response.data[type] || [];
          // Sort by sort_order, then by label as fallback
          const sortedOptions = typeOptions.sort((a, b) => {
            if (a.sort_order !== b.sort_order) {
              return a.sort_order - b.sort_order;
            }
            return a.label.localeCompare(b.label);
          });
          setOptions(sortedOptions);
        } else {
          throw new Error(response.error || "Failed to fetch dropdown options");
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load options"
        );
        console.error(`Error fetching ${type} options:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [type]);

  const baseSelectClasses = `w-full px-3 py-2 pr-8 bg-white border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] ${className}`;

  if (loading) {
    return (
      <select disabled className={`${baseSelectClasses} border-slate-300`}>
        <option>Loading options...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select disabled className={`${baseSelectClasses} border-red-300`}>
        <option>Select an option...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`${baseSelectClasses} ${
        error ? "border-red-300" : "border-slate-300"
      }`}
    >
      {allowEmpty && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.id || option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Type-specific components for convenience
export function JobTitleSelect(props: Omit<DropdownSelectProps, "type">) {
  return <DropdownSelect {...props} type="job_titles" />;
}

export function DepartmentSelect(props: Omit<DropdownSelectProps, "type">) {
  return <DropdownSelect {...props} type="departments" />;
}

export function TeamSizeSelect(props: Omit<DropdownSelectProps, "type">) {
  return <DropdownSelect {...props} type="team_sizes" />;
}

export function IndustrySelect(props: Omit<DropdownSelectProps, "type">) {
  return <DropdownSelect {...props} type="industries" />;
}

export function UseCaseSelect(props: Omit<DropdownSelectProps, "type">) {
  return <DropdownSelect {...props} type="use_cases" />;
}
