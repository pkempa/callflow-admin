"use client";

import React, { useState, useEffect, useRef } from "react";
import { adminAPI } from "@/lib/admin-api";

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
  metadata?: Record<string, any>;
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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Mock data function for when API is not available
  const getMockLogData = (filters: LogFilters): LogSearchResponse => {
    const now = new Date();
    const mockLogs: LogEntry[] = [
      {
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        level: "info",
        message: "User logged in successfully",
        log_source: "frontend",
        context: {
          userId: "user_123",
          page: "/dashboard",
          correlationId: "req_123456",
        },
        metadata: {
          user_action: true,
          action: "LOGIN",
          duration_ms: 150,
        },
      },
      {
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        level: "error",
        message: "API call failed",
        log_source: "frontend",
        context: {
          userId: "user_456",
          page: "/phone-numbers",
          component: "PhoneNumbersList",
        },
        metadata: {
          api_call: true,
          endpoint: "/phone-numbers",
          status_code: 500,
          duration_ms: 5000,
        },
        error: {
          name: "NetworkError",
          message: "Failed to fetch phone numbers",
          stack: "Error: Failed to fetch\n    at fetchPhoneNumbers...",
        },
      },
      {
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        level: "warn",
        message: "SECURITY EVENT: Multiple failed login attempts",
        log_source: "backend",
        context: {
          userId: "user_789",
          correlationId: "req_789123",
        },
        metadata: {
          security_event: true,
          event: "FAILED_LOGIN_ATTEMPTS",
          severity: "medium",
          attempt_count: 3,
        },
      },
      {
        timestamp: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
        level: "info",
        message: "PHONE_NUMBER_PURCHASED",
        log_source: "backend",
        context: {
          userId: "user_123",
          organizationId: "org_456",
        },
        metadata: {
          business_event: true,
          phone_number: "+1234567890",
          cost: 1.0,
          provider: "twilio",
        },
      },
      {
        timestamp: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
        level: "debug",
        message: "Database query executed",
        log_source: "backend",
        metadata: {
          performance_metric: true,
          query_type: "SELECT",
          table: "users",
          duration_ms: 15,
        },
      },
    ];

    // Apply filters
    let filteredLogs = mockLogs;

    if (filters.log_source !== "all") {
      filteredLogs = filteredLogs.filter(
        (log) => log.log_source === filters.log_source
      );
    }

    if (filters.level) {
      filteredLogs = filteredLogs.filter((log) => log.level === filters.level);
    }

    if (filters.search_text) {
      const searchLower = filters.search_text.toLowerCase();
      filteredLogs = filteredLogs.filter(
        (log) =>
          log.message.toLowerCase().includes(searchLower) ||
          JSON.stringify(log.metadata || {})
            .toLowerCase()
            .includes(searchLower)
      );
    }

    return {
      logs: filteredLogs,
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: filteredLogs.length,
        per_page: 50,
        has_next: false,
        has_previous: false,
      },
      filters: {
        log_source: filters.log_source,
        level: filters.level,
        start_time: filters.start_time,
        end_time: filters.end_time,
      },
    };
  };

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

  useEffect(() => {
    console.log("Log viewer page mounted");
    fetchLogs();

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(() => {
        fetchLogs(false); // Don't show loading state for auto-refresh
      }, 30000); // Refresh every 30 seconds

      console.log("Auto-refresh enabled for logs");
    } else {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
      console.log("Auto-refresh disabled for logs");
    }

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [autoRefresh]);

  const fetchLogs = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

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
        params.append("start_time", new Date(filters.start_time).toISOString());
      if (filters.end_time)
        params.append("end_time", new Date(filters.end_time).toISOString());
      params.append("page", pagination.current_page.toString());
      params.append("limit", "50");

      console.log("Fetching logs with filters", {
        filters,
        page: pagination.current_page,
      });

      // Make API call to admin logs endpoint
      let data: LogSearchResponse;

      try {
        const response = await fetch(`/api/admin/logs?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          // If API fails, use mock data for now
          console.warn(`API failed with ${response.status}, using mock data`);
          data = getMockLogData(filters);
        } else {
          data = await response.json();
        }
      } catch (fetchError) {
        console.warn(
          "API endpoint not available, using mock data:",
          fetchError
        );
        data = getMockLogData(filters);
      }

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

      console.log("Logs fetched successfully", {
        count: data.logs?.length || 0,
        total: data.pagination?.total_items || 0,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch logs";
      setError(errorMessage);
      console.error("Failed to fetch logs", err, { filters });
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (key: keyof LogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    fetchLogs();
    console.log("LOG_SEARCH", { filters });
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
          log.message.replace(/"/g, '""'),
          log.context?.userId || "",
          log.context?.organizationId || "",
          JSON.stringify(log.metadata || {}).replace(/"/g, '""'),
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

    console.log("LOGS_EXPORTED", { count: logs.length, filters });
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
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error Loading Logs
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Log Entries */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No logs found for the selected criteria
            </p>
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
