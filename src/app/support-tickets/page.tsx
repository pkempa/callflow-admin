"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import NewAdminLayout from "@/components/layout/NewAdminLayout";
import { adminAPI, SupportTicket, AttachmentMetadata } from "@/lib/admin-api";
import {
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  User,
  Building,
  Tag,
  MessageCircle,
  Paperclip,
  Download,
  File,
  Image,
  Filter,
  RefreshCw,
  Send,
  Mail,
  Calendar,
  Users,
  AlertTriangle,
  Plus,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Badge, StatusBadge, PlanBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, SearchInput, Textarea } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DataTable,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SupportTicketsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statistics, setStatistics] = useState({
    total_open: 0,
    total_in_progress: 0,
    total_resolved: 0,
    total_closed: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== "all" && { status: filterStatus }),
        ...(filterCategory !== "all" && { category: filterCategory }),
        ...(filterPriority !== "all" && { priority: filterPriority }),
      };

      const response = await adminAPI.getSupportTickets(params);
      if (response.success && response.data) {
        setTickets(response.data.tickets);
        setPagination(response.data.pagination);
        setStatistics(response.data.statistics);
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    searchTerm,
    filterStatus,
    filterCategory,
    filterPriority,
  ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchTickets();
  };

  const handleTicketClick = async (ticket: SupportTicket) => {
    try {
      const response = await adminAPI.getSupportTicket(ticket.id);
      if (response.success && response.data) {
        setSelectedTicket(response.data.ticket);
        setTicketDetailOpen(true);
      }
    } catch {
      // Silently handle ticket details fetch errors
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    try {
      setIsSubmitting(true);
      const response = await adminAPI.updateSupportTicket(ticketId, {
        status: newStatus,
      });
      if (response.success) {
        await fetchTickets();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(response.data!.ticket);
        }
      }
    } catch {
      // Silently handle status update errors
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriorityUpdate = async (
    ticketId: string,
    newPriority: string
  ) => {
    try {
      setIsSubmitting(true);
      const response = await adminAPI.updateSupportTicket(ticketId, {
        priority: newPriority,
      });
      if (response.success) {
        await fetchTickets();
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket(response.data!.ticket);
        }
      }
    } catch {
      // Silently handle priority update errors
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddResponse = async () => {
    if (!selectedTicket || !responseText.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await adminAPI.addSupportTicketResponse(
        selectedTicket.id,
        {
          response: responseText,
          is_internal: isInternal,
        }
      );
      if (response.success && response.data) {
        setSelectedTicket(response.data.ticket);
        setResponseText("");
        setIsInternal(false);
        await fetchTickets();
      }
    } catch {
      // Silently handle response add errors
    } finally {
      setIsSubmitting(false);
    }
  };

  // Attachment helper functions
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return (
        <Image className="w-4 h-4 text-blue-500" aria-label="Image file" />
      );
    }
    return (
      <File className="w-4 h-4 text-slate-500" aria-label="File attachment" />
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const downloadAttachment = async (attachment: AttachmentMetadata) => {
    try {
      const response = await adminAPI.downloadAttachment(attachment.s3_key);
      if (response.success && response.data) {
        window.open(response.data.download_url, "_blank");
      }
    } catch {
      alert("Failed to download attachment");
    }
  };

  const getStatusBadgeVariant = (
    status: string
  ): "success" | "warning" | "destructive" | "info" | "secondary" => {
    switch (status) {
      case "open":
        return "info";
      case "in_progress":
        return "warning";
      case "waiting_for_customer":
        return "warning";
      case "resolved":
        return "success";
      case "closed":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getPriorityBadgeVariant = (
    priority: string
  ): "destructive" | "warning" | "info" | "success" => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "info";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "billing":
        return <Building className="h-4 w-4 text-emerald-500" />;
      case "feature_request":
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case "bug_report":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "account":
        return <User className="h-4 w-4 text-amber-500" />;
      default:
        return <Tag className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusDisplayText = (status: string) => {
    switch (status) {
      case "open":
        return "Open";
      case "in_progress":
        return "In Progress";
      case "waiting_for_customer":
        return "Waiting for Customer";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  };

  const getPriorityDisplayText = (priority: string) => {
    switch (priority) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
      case "urgent":
        return "Urgent";
      default:
        return priority;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg mx-auto mb-4 animate-pulse"></div>
          <div className="text-lg font-medium text-slate-700">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <NewAdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Support Tickets
            </h1>
            <p className="mt-1 text-slate-600">
              Manage customer support tickets and responses
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchTickets}
              variant="outline"
              leftIcon={
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              }
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            variant="elevated"
            className="border-l-4 border-l-blue-500 card-hover"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Open Tickets
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {statistics.total_open}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="elevated"
            className="border-l-4 border-l-amber-500 card-hover"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    In Progress
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {statistics.total_in_progress}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-400 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="elevated"
            className="border-l-4 border-l-emerald-500 card-hover"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Resolved</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {statistics.total_resolved}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="elevated"
            className="border-l-4 border-l-slate-500 card-hover"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Closed</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {statistics.total_closed}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-400 rounded-xl">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="overflow-hidden">
          <CardHeader variant="elevated">
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2 text-blue-500" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <SearchInput
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_for_customer">
                      Waiting for Customer
                    </SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="feature_request">
                      Feature Request
                    </SelectItem>
                    <SelectItem value="bug_report">Bug Report</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="gradient"
                  leftIcon={<Search className="h-4 w-4" />}
                >
                  Search Tickets
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card className="overflow-hidden">
          <CardHeader variant="elevated">
            <CardTitle>Support Tickets ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              loading={loading}
              empty={tickets.length === 0}
              emptyMessage="No tickets found"
            >
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleTicketClick(ticket)}
                          className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {ticket.ticket_number}
                        </button>
                        <div className="text-sm text-slate-600 line-clamp-2">
                          {ticket.subject}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {ticket.metadata?.is_anonymous
                              ? "Anonymous"
                              : "User"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {ticket.organization_name || "No organization"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(ticket.category)}
                        <span className="capitalize text-sm text-slate-700">
                          {ticket.category.replace("_", " ")}
                        </span>
                        {ticket.attachments &&
                          ticket.attachments.length > 0 && (
                            <Badge variant="outline" size="sm">
                              <Paperclip className="w-3 h-3 mr-1" />
                              {ticket.attachments.length}
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getPriorityBadgeVariant(ticket.priority)}
                        size="sm"
                      >
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(ticket.status)}
                        size="sm"
                      >
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTicketClick(ticket);
                          }}
                          className="text-blue-600 hover:text-blue-800 h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(ticket.id, "in_progress");
                          }}
                          className="text-amber-600 hover:text-amber-800 h-8 w-8 p-0"
                          disabled={ticket.status === "in_progress"}
                          title="Mark In Progress"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(ticket.id, "resolved");
                          }}
                          className="text-emerald-600 hover:text-emerald-800 h-8 w-8 p-0"
                          disabled={
                            ticket.status === "resolved" ||
                            ticket.status === "closed"
                          }
                          title="Mark Resolved"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>

            {/* Pagination */}
            {tickets.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                <div className="text-sm text-slate-600">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} tickets
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={!pagination.has_prev}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={!pagination.has_next}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Ticket Detail Modal */}
        <Dialog
          open={ticketDetailOpen}
          onOpenChange={setTicketDetailOpen}
          size="full"
        >
          <DialogContent
            className="max-w-5xl max-h-[95vh] overflow-hidden"
            showClose={true}
            onClose={() => setTicketDetailOpen(false)}
          >
            {selectedTicket && (
              <>
                <DialogHeader variant="gradient">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <DialogTitle className="text-xl text-blue-900">
                          Ticket {selectedTicket.ticket_number}
                        </DialogTitle>
                        <DialogDescription className="text-blue-700 mt-1">
                          {selectedTicket.subject}
                        </DialogDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={getStatusBadgeVariant(selectedTicket.status)}
                      >
                        {selectedTicket.status.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant={getPriorityBadgeVariant(
                          selectedTicket.priority
                        )}
                      >
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>
                </DialogHeader>

                <DialogBody className="overflow-y-auto max-h-[70vh]">
                  <div className="space-y-6">
                    {/* Customer Info Card */}
                    <Card variant="outlined">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Users className="h-5 w-5 mr-2 text-blue-500" />
                          Customer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            {selectedTicket.metadata?.is_anonymous ? (
                              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                <div className="flex items-center mb-3">
                                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
                                  <span className="font-semibold text-amber-800">
                                    Anonymous Contact
                                  </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 text-amber-600 mr-2" />
                                    <span className="font-medium">Name:</span>
                                    <span className="ml-1">
                                      {
                                        selectedTicket.metadata
                                          .contact_name as string
                                      }
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-amber-600 mr-2" />
                                    <span className="font-medium">Email:</span>
                                    <span className="ml-1">
                                      {
                                        selectedTicket.metadata
                                          .contact_email as string
                                      }
                                    </span>
                                  </div>
                                  {selectedTicket.metadata.contact_company && (
                                    <div className="flex items-center">
                                      <Building className="h-4 w-4 text-amber-600 mr-2" />
                                      <span className="font-medium">
                                        Company:
                                      </span>
                                      <span className="ml-1">
                                        {String(
                                          selectedTicket.metadata
                                            .contact_company
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center">
                                    <Tag className="h-4 w-4 text-amber-600 mr-2" />
                                    <span className="font-medium">
                                      Inquiry Type:
                                    </span>
                                    <span className="ml-1">
                                      {
                                        selectedTicket.metadata
                                          .inquiry_type as string
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 text-blue-600 mr-2" />
                                    <span className="font-medium">
                                      User ID:
                                    </span>
                                    <span className="ml-1 font-mono text-xs">
                                      {selectedTicket.user_id}
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <Building className="h-4 w-4 text-blue-600 mr-2" />
                                    <span className="font-medium">
                                      {selectedTicket.organization_account_number
                                        ? "Account:"
                                        : "Organization ID:"}
                                    </span>
                                    <span className="ml-1 font-mono text-xs">
                                      {selectedTicket.organization_account_number ||
                                        selectedTicket.organization_id}
                                    </span>
                                  </div>
                                  {selectedTicket.organization_name && (
                                    <div className="flex items-center">
                                      <Building className="h-4 w-4 text-blue-600 mr-2" />
                                      <span className="font-medium">
                                        Organization:
                                      </span>
                                      <span className="ml-1">
                                        {selectedTicket.organization_name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                              <h4 className="font-medium text-slate-900 mb-3 flex items-center">
                                <Tag className="h-4 w-4 mr-2 text-slate-600" />
                                Ticket Details
                              </h4>
                              <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600">
                                    Category:
                                  </span>
                                  <div className="flex items-center">
                                    {getCategoryIcon(selectedTicket.category)}
                                    <span className="ml-1 capitalize">
                                      {selectedTicket.category.replace(
                                        "_",
                                        " "
                                      )}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600">
                                    Created:
                                  </span>
                                  <span className="flex items-center text-slate-900">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(
                                      selectedTicket.created_at
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600">
                                    Last Updated:
                                  </span>
                                  <span className="flex items-center text-slate-900">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {new Date(
                                      selectedTicket.updated_at
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Description */}
                    <Card variant="outlined">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <MessageCircle className="h-5 w-5 mr-2 text-emerald-500" />
                          Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-white border border-slate-200 rounded-lg">
                          <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">
                            {selectedTicket.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Attachments */}
                    {selectedTicket.attachments &&
                      selectedTicket.attachments.length > 0 && (
                        <Card variant="outlined">
                          <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                              <Paperclip className="h-5 w-5 mr-2 text-purple-500" />
                              Attachments ({selectedTicket.attachments.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-3">
                              {selectedTicket.attachments.map(
                                (attachment, index) => (
                                  <div
                                    key={`${attachment.s3_key}-${index}`}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                                        {getFileIcon(attachment.file_type)}
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-900">
                                          {attachment.original_filename}
                                        </p>
                                        <p className="text-sm text-slate-500">
                                          {formatFileSize(attachment.file_size)}{" "}
                                          • {attachment.file_type}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        downloadAttachment(attachment)
                                      }
                                      className="h-8 w-8 p-0"
                                      aria-label="Download attachment"
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                    {/* Admin Controls */}
                    <Card variant="outlined">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Tag className="h-5 w-5 mr-2 text-amber-500" />
                          Admin Controls
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-900 mb-2 block">
                              Status
                            </Label>
                            <Select
                              value={selectedTicket.status}
                              onValueChange={(value) =>
                                handleStatusUpdate(selectedTicket.id, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="waiting_for_customer">
                                  Waiting for Customer
                                </SelectItem>
                                <SelectItem value="resolved">
                                  Resolved
                                </SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-900 mb-2 block">
                              Priority
                            </Label>
                            <Select
                              value={selectedTicket.priority}
                              onValueChange={(value) =>
                                handlePriorityUpdate(selectedTicket.id, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Responses */}
                    <Card variant="outlined">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <MessageCircle className="h-5 w-5 mr-2 text-blue-500" />
                          Responses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                          {selectedTicket.responses.length === 0 ? (
                            <div className="text-center py-8">
                              <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                              <p className="text-slate-500">No responses yet</p>
                            </div>
                          ) : (
                            selectedTicket.responses.map((response) => (
                              <div
                                key={response.id}
                                className={`p-4 rounded-lg border-l-4 ${
                                  response.is_internal
                                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-l-amber-400"
                                    : "bg-gradient-to-r from-blue-50 to-cyan-50 border-l-blue-400"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className={`p-1.5 rounded-full ${
                                        response.is_internal
                                          ? "bg-amber-100"
                                          : "bg-blue-100"
                                      }`}
                                    >
                                      {response.is_internal ? (
                                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                                      ) : (
                                        <MessageCircle className="h-3 w-3 text-blue-600" />
                                      )}
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">
                                      {response.admin_user_id
                                        ? "Admin"
                                        : "System"}
                                      {response.is_internal && " (Internal)"}
                                    </span>
                                  </div>
                                  <span className="text-xs text-slate-500 bg-white/50 px-2 py-1 rounded-full">
                                    {new Date(
                                      response.created_at
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-900 whitespace-pre-wrap leading-relaxed">
                                  {response.message}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Add Response */}
                    <Card variant="outlined">
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          <Plus className="h-5 w-5 mr-2 text-emerald-500" />
                          Add Response
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Enter your response..."
                            rows={4}
                            fullWidth
                          />
                          <div className="flex items-center space-x-3">
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isInternal}
                                onChange={(e) =>
                                  setIsInternal(e.target.checked)
                                }
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-700">
                                Internal note (not visible to customer)
                              </span>
                            </label>
                            {isInternal && (
                              <Badge variant="warning" size="sm">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Internal Only
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogBody>

                <DialogFooter className="bg-slate-50">
                  <Button
                    variant="outline"
                    onClick={() => setTicketDetailOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleAddResponse}
                    disabled={!responseText.trim() || isSubmitting}
                    loading={isSubmitting}
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    {isSubmitting ? "Adding..." : "Add Response"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </NewAdminLayout>
  );
}
