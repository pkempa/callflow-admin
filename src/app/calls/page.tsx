"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  Clock,
  User,
  Calendar,
  Play,
  Download,
  Search,
  Filter,
  MoreHorizontal,
  PhoneCall,
  Timer,
  Volume2,
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import NewAdminLayout from "@/components/layout/NewAdminLayout";
import {
  Card,
  Button,
  Badge,
  Input,
  LoadingSpinner,
  EmptyState,
  StatusIndicator,
} from "@/components/ui/design-system";
import { formatDate, formatRelativeTime, formatDuration } from "@/lib/utils";

interface CallRecord {
  id: string;
  phoneNumber: string;
  direction: "inbound" | "outbound";
  status: "completed" | "missed" | "busy" | "failed";
  duration: number;
  startTime: string;
  endTime?: string;
  organizationId: string;
  organizationName: string;
  userId?: string;
  userName?: string;
  recording?: {
    url: string;
    duration: number;
    size: number;
  };
  transcript?: {
    text: string;
    confidence: number;
    language: string;
  };
  aiSummary?: {
    summary: string;
    sentiment: "positive" | "neutral" | "negative";
    topics: string[];
    actionItems: string[];
  };
  cost: number;
  provider: string;
}

// Mock data for demonstration
const mockCalls: CallRecord[] = [
  {
    id: "call_1",
    phoneNumber: "+1 (555) 123-4567",
    direction: "inbound",
    status: "completed",
    duration: 245,
    startTime: "2024-01-15T10:30:00Z",
    endTime: "2024-01-15T10:34:05Z",
    organizationId: "org_1",
    organizationName: "Acme Corp",
    userId: "user_1",
    userName: "John Smith",
    recording: {
      url: "/recordings/call_1.mp3",
      duration: 245,
      size: 2450000,
    },
    transcript: {
      text: "Customer called about billing inquiry. Resolved payment issue and updated account.",
      confidence: 0.95,
      language: "en",
    },
    aiSummary: {
      summary: "Customer billing inquiry resolved successfully",
      sentiment: "positive",
      topics: ["billing", "payment", "account"],
      actionItems: ["Update payment method", "Send confirmation email"],
    },
    cost: 0.12,
    provider: "Twilio",
  },
  {
    id: "call_2",
    phoneNumber: "+1 (555) 987-6543",
    direction: "outbound",
    status: "missed",
    duration: 0,
    startTime: "2024-01-15T09:15:00Z",
    organizationId: "org_2",
    organizationName: "TechStart Inc",
    cost: 0.05,
    provider: "Bandwidth",
  },
  {
    id: "call_3",
    phoneNumber: "+1 (555) 456-7890",
    direction: "inbound",
    status: "completed",
    duration: 180,
    startTime: "2024-01-15T08:45:00Z",
    endTime: "2024-01-15T08:48:00Z",
    organizationId: "org_1",
    organizationName: "Acme Corp",
    userId: "user_2",
    userName: "Sarah Johnson",
    recording: {
      url: "/recordings/call_3.mp3",
      duration: 180,
      size: 1800000,
    },
    aiSummary: {
      summary: "Product support call - helped customer with setup",
      sentiment: "neutral",
      topics: ["support", "setup", "product"],
      actionItems: ["Follow up in 24 hours"],
    },
    cost: 0.09,
    provider: "Twilio",
  },
];

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [directionFilter, setDirectionFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate API call
    const loadCalls = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCalls(mockCalls);
      setLoading(false);
    };

    loadCalls();
  }, []);

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (call.userName &&
        call.userName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || call.status === statusFilter;
    const matchesDirection =
      directionFilter === "all" || call.direction === directionFilter;

    return matchesSearch && matchesStatus && matchesDirection;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "missed":
        return "warning";
      case "busy":
        return "warning";
      case "failed":
        return "error";
      default:
        return "neutral";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "missed":
        return AlertCircle;
      case "busy":
        return XCircle;
      case "failed":
        return XCircle;
      default:
        return Phone;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <NewAdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </NewAdminLayout>
    );
  }

  return (
    <NewAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Call Intelligence
            </h1>
            <p className="text-gray-600">
              Monitor and analyze call activity across your platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <PhoneCall className="w-4 h-4 mr-2" />
              Test Call
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Calls
                  </p>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">+12%</span>
                <span className="text-gray-600 ml-2">vs last month</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Avg Duration
                  </p>
                  <p className="text-2xl font-bold text-gray-900">3m 24s</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Timer className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">+8%</span>
                <span className="text-gray-600 ml-2">vs last month</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">94.2%</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium">+2.1%</span>
                <span className="text-gray-600 ml-2">vs last month</span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Cost
                  </p>
                  <p className="text-2xl font-bold text-gray-900">$156.78</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-red-600 font-medium">+5%</span>
                <span className="text-gray-600 ml-2">vs last month</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search calls by phone number, organization, or user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="missed">Missed</option>
                  <option value="busy">Busy</option>
                  <option value="failed">Failed</option>
                </select>
                <select
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Directions</option>
                  <option value="inbound">Inbound</option>
                  <option value="outbound">Outbound</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Call Records */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Calls
            </h2>
            {filteredCalls.length === 0 ? (
              <EmptyState
                icon={Phone}
                title="No calls found"
                description="No calls match your current filters."
              />
            ) : (
              <div className="space-y-4">
                {filteredCalls.map((call) => {
                  const StatusIcon = getStatusIcon(call.status);
                  return (
                    <div
                      key={call.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                call.direction === "inbound"
                                  ? "bg-green-50"
                                  : "bg-blue-50"
                              }`}
                            >
                              <StatusIcon
                                className={`w-5 h-5 ${
                                  call.direction === "inbound"
                                    ? "text-green-600"
                                    : "text-blue-600"
                                }`}
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-sm font-medium text-gray-900">
                                {call.phoneNumber}
                              </h3>
                              <Badge variant={getStatusColor(call.status)}>
                                {call.status}
                              </Badge>
                              <Badge variant="outline">{call.direction}</Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {call.organizationName}
                              </span>
                              {call.userName && (
                                <span className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  {call.userName}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatDuration(call.duration)}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatRelativeTime(call.startTime)}
                              </span>
                            </div>
                            {call.aiSummary && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    AI Summary
                                  </h4>
                                  <span
                                    className={`text-xs font-medium ${getSentimentColor(
                                      call.aiSummary.sentiment
                                    )}`}
                                  >
                                    {call.aiSummary.sentiment}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">
                                  {call.aiSummary.summary}
                                </p>
                                {call.aiSummary.topics.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {call.aiSummary.topics.map(
                                      (topic, index) => (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          size="sm"
                                        >
                                          {topic}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                                {call.aiSummary.actionItems.length > 0 && (
                                  <div className="mt-2">
                                    <h5 className="text-xs font-medium text-gray-700 mb-1">
                                      Action Items:
                                    </h5>
                                    <ul className="text-xs text-gray-600 space-y-1">
                                      {call.aiSummary.actionItems.map(
                                        (item, index) => (
                                          <li
                                            key={index}
                                            className="flex items-start"
                                          >
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                            {item}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {call.recording && (
                            <Button variant="ghost" size="sm">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          {call.transcript && (
                            <Button variant="ghost" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </NewAdminLayout>
  );
}
