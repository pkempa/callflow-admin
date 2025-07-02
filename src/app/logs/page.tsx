"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";

interface LogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error" | "critical";
  message: string;
  log_source: "frontend" | "backend";
  context?: {
    userId?: string;
    organizationId?: string;
    userRole?: string;
    page?: string;
    component?: string;
    correlationId?: string;
  };
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  log_group?: string;
}

interface LogFilters {
  log_source: string;
  level: string;
  start_time: string;
  end_time: string;
  user_id: string;
  organization_id: string;
  search_text: string;
}

interface LogSearchResponse {
  logs: LogEntry[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
  filters: {
    log_source: string;
    level?: string;
    start_time: string;
    end_time: string;
  };
}

export default function LogViewerPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    per_page: 50,
    has_next: false,
    has_previous: false,
  });

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  const [filters, setFilters] = useState<LogFilters>({
    log_source: "all",
    level: "",
    start_time: new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16), // Last 24 hours
    end_time: new Date().toISOString().slice(0, 16),
    user_id: "",
    organization_id: "",
    search_text: "",
  });

  const fetchLogs = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }
        setError(null);
        setSuccess(null);

        // Build query parameters
        const params = new URLSearchParams();
        if (filters.log_source !== "all")
          params.append("log_source", filters.log_source);
        if (filters.level) params.append("level", filters.level);
        if (filters.user_id) params.append("user_id", filters.user_id);
        if (filters.organization_id)
          params.append("organization_id", filters.organization_id);
        if (filters.search_text)
          params.append("search_text", filters.search_text);
        if (filters.start_time)
          params.append(
            "start_time",
            new Date(filters.start_time).toISOString()
          );
        if (filters.end_time)
          params.append("end_time", new Date(filters.end_time).toISOString());
        params.append("page", pagination.current_page.toString());
        params.append("limit", "50");

        // Make API call to admin logs endpoint
        const response = await fetch(`/api/admin/logs?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              errorData.details ||
              `API Error: ${response.status} ${response.statusText}`
          );
        }

        const data: LogSearchResponse = await response.json();

        setLogs(data.logs || []);
        setPagination(
          data.pagination || {
            current_page: 1,
            total_pages: 1,
            total_items: 0,
            per_page: 50,
            has_next: false,
            has_previous: false,
          }
        );

        // Show success message
        const logCount = data.logs?.length || 0;
        setSuccess(`✅ Successfully loaded ${logCount} logs`);
        setTimeout(() => setSuccess(null), 3000); // Clear after 3 seconds
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch logs";
        setError(errorMessage);
        setSuccess(null); // Clear success on error
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [filters, pagination.current_page]
  );

  useEffect(() => {
    fetchLogs();

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [fetchLogs]);

  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        fetchLogs(false); // Don't show loading state for auto-refresh
      }, 30000); // Refresh every 30 seconds
    } else {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh, fetchLogs]);

  const handleFilterChange = (key: keyof LogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchLogs();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
    fetchLogs();
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "error":
        return "bg-red-50 text-red-700 border-red-100";
      case "warn":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "info":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "debug":
        return "bg-gray-50 text-gray-700 border-gray-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "frontend":
        return "🌐";
      case "backend":
        return "⚙️";
      default:
        return "📄";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportLogs = () => {
    const csvContent = logs
      .map((log) => {
        return [
          log.timestamp,
          log.level,
          log.log_source,
          log.message.replace(/"/g, "\u0022\u0022"),
          log.context?.userId || "",
          log.context?.organizationId || "",
          JSON.stringify(log.metadata || {}).replace(/"/g, "\u0022\u0022"),
        ].join(",");
      })
      .join("\n");

    const header =
      "Timestamp,Level,Source,Message,User ID,Organization ID,Metadata\n";
    const csv = header + csvContent;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `callflow-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center hover:text-gray-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">System Logs</span>
        </nav>

        {/* Back Button */}
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors mr-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
            <p className="text-gray-600">Monitor and debug system activity</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
            </label>
            <button
              onClick={exportLogs}
              disabled={logs.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
            <button
              onClick={() => fetchLogs()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters - Improved Layout */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Filter & Search
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Filter logs by source, level, time range, and search criteria
            </p>
          </div>

          <div className="p-6">
            {/* Primary Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source
                </label>
                <select
                  value={filters.log_source}
                  onChange={(e) =>
                    handleFilterChange("log_source", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Sources</option>
                  <option value="frontend">🌐 Frontend</option>
                  <option value="backend">⚙️ Backend</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="critical">🔴 Critical</option>
                  <option value="error">❌ Error</option>
                  <option value="warn">⚠️ Warning</option>
                  <option value="info">ℹ️ Info</option>
                  <option value="debug">🔍 Debug</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={filters.start_time}
                  onChange={(e) =>
                    handleFilterChange("start_time", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={filters.end_time}
                  onChange={(e) =>
                    handleFilterChange("end_time", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Secondary Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={filters.user_id}
                  onChange={(e) =>
                    handleFilterChange("user_id", e.target.value)
                  }
                  placeholder="Filter by user ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization ID
                </label>
                <input
                  type="text"
                  value={filters.organization_id}
                  onChange={(e) =>
                    handleFilterChange("organization_id", e.target.value)
                  }
                  placeholder="Filter by organization"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Text
                </label>
                <input
                  type="text"
                  value={filters.search_text}
                  onChange={(e) =>
                    handleFilterChange("search_text", e.target.value)
                  }
                  placeholder="Search messages, errors, etc..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  🔍 Search Logs
                </button>
                <button
                  onClick={() => {
                    setFilters({
                      log_source: "all",
                      level: "",
                      start_time: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        .toISOString()
                        .slice(0, 16),
                      end_time: new Date().toISOString().slice(0, 16),
                      user_id: "",
                      organization_id: "",
                      search_text: "",
                    });
                    fetchLogs();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  🔄 Clear Filters
                </button>
              </div>

              <div className="text-sm text-gray-600 font-medium">
                {pagination?.total_items || 0} logs found
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <div className="text-red-400 mt-0.5">⚠️</div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Logs
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={() => fetchLogs()}
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    console.log("🔍 Debug info:", {
                      apiUrl: process.env.NEXT_PUBLIC_API_URL,
                      filters,
                      timestamp: new Date().toISOString(),
                    });
                    // Test debug endpoint
                    fetch("/api/admin/logs?debug=true")
                      .then((r) => r.json())
                      .then((data) => console.log("🔍 Debug response:", data))
                      .catch((e) => console.error("🔍 Debug error:", e));
                  }}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded transition-colors"
                >
                  Debug Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <div className="text-green-400 mr-3">✅</div>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Log Entries */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No logs found
              </h3>
              <p className="text-gray-500 mb-4">
                No logs match your current filter criteria.
              </p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>• Try expanding the time range</p>
                <p>• Clear some filters</p>
                <p>• Check if the backend is running</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFilters({
                  log_source: "all",
                  level: "",
                  start_time: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 16),
                  end_time: new Date().toISOString().slice(0, 16),
                  user_id: "",
                  organization_id: "",
                  search_text: "",
                });
                fetchLogs();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          logs.map((logEntry, index) => {
            const logId = `${logEntry.timestamp}-${index}`;
            const isExpanded = expandedLogs.has(logId);

            return (
              <div
                key={logId}
                className={`border rounded-lg ${getLevelColor(logEntry.level)}`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleLogExpansion(logId)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg">
                          {getSourceIcon(logEntry.log_source)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(
                            logEntry.level
                          )}`}
                        >
                          {logEntry.level.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTimestamp(logEntry.timestamp)}
                        </span>
                        {logEntry.context?.correlationId && (
                          <span className="text-xs text-gray-400 font-mono">
                            {logEntry.context.correlationId}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {logEntry.message}
                      </p>
                      {logEntry.context?.page && (
                        <p className="text-xs text-gray-600 mt-1">
                          📍 {logEntry.context.page}
                          {logEntry.context.component &&
                            ` → ${logEntry.context.component}`}
                        </p>
                      )}
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      {isExpanded ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-white bg-opacity-50 p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Context */}
                      {logEntry.context &&
                        Object.keys(logEntry.context).length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Context
                            </h4>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(logEntry.context, null, 2)}
                            </pre>
                          </div>
                        )}

                      {/* Metadata */}
                      {logEntry.metadata &&
                        Object.keys(logEntry.metadata).length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Metadata
                            </h4>
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(logEntry.metadata, null, 2)}
                            </pre>
                          </div>
                        )}

                      {/* Error Details */}
                      {logEntry.error && (
                        <div className="lg:col-span-2">
                          <h4 className="font-medium text-red-900 mb-2">
                            Error Details
                          </h4>
                          <div className="bg-red-50 p-3 rounded">
                            <p className="text-sm font-medium text-red-800">
                              {logEntry.error.name}: {logEntry.error.message}
                            </p>
                            {logEntry.error.stack && (
                              <pre className="text-xs text-red-600 mt-2 overflow-x-auto">
                                {logEntry.error.stack}
                              </pre>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {pagination.current_page} of {pagination.total_pages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.has_previous}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.has_next}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
