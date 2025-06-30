"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      return <Image className="w-4 h-4" aria-label="Image file" />;
    }
    return <File className="w-4 h-4" aria-label="File attachment" />;
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "waiting_for_customer":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return <AlertCircle className="h-4 w-4" />;
      case "billing":
        return <Building className="h-4 w-4" />;
      case "feature_request":
        return <MessageCircle className="h-4 w-4" />;
      case "bug_report":
        return <XCircle className="h-4 w-4" />;
      case "account":
        return <User className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Support Tickets
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage customer support tickets and responses
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.total_open}
                  </p>
                  <p className="text-xs font-medium text-gray-500">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.total_in_progress}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    In Progress
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.total_resolved}
                  </p>
                  <p className="text-xs font-medium text-gray-500">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <div className="flex items-center space-x-2">
                <XCircle className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.total_closed}
                  </p>
                  <p className="text-xs font-medium text-gray-500">Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_customer">
                    Waiting for Customer
                  </option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="billing">Billing</option>
                  <option value="feature_request">Feature Request</option>
                  <option value="bug_report">Bug Report</option>
                  <option value="account">Account</option>
                  <option value="general">General</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Support Tickets ({pagination.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tickets found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Subject</TableHead>
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
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleTicketClick(ticket)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {ticket.ticket_number}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-sm truncate">
                            {ticket.subject}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {ticket.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>
                            User ID: {ticket.user_id.substring(0, 8)}...
                          </div>
                          <div className="text-gray-500">
                            {ticket.organization_account_number ||
                              `Org: ${ticket.organization_id.substring(
                                0,
                                8
                              )}...`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(ticket.category)}
                          <span className="capitalize">
                            {ticket.category.replace("_", " ")}
                          </span>
                          {ticket.attachments &&
                            ticket.attachments.length > 0 && (
                              <div
                                className="flex items-center text-gray-400"
                                title={`${ticket.attachments.length} attachment(s)`}
                              >
                                <Paperclip className="w-3 h-3" />
                              </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPriorityBadgeColor(ticket.priority)}
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(ticket.status)}>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-8 w-8 p-0 rounded-md hover:bg-gray-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleTicketClick(ticket)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(ticket.id, "in_progress")
                              }
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(ticket.id, "resolved")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Resolved
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {tickets.length > 0 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} tickets
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={!pagination.has_prev}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={!pagination.has_next}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ticket Detail Modal */}
        <Dialog open={ticketDetailOpen} onOpenChange={setTicketDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <span>Ticket {selectedTicket.ticket_number}</span>
                    <Badge
                      className={getStatusBadgeColor(selectedTicket.status)}
                    >
                      {selectedTicket.status.replace("_", " ")}
                    </Badge>
                    <Badge
                      className={getPriorityBadgeColor(selectedTicket.priority)}
                    >
                      {selectedTicket.priority}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTicket.subject}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* Ticket Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Customer
                      </Label>
                      {selectedTicket.metadata?.is_anonymous ? (
                        <div>
                          <p className="text-sm font-medium text-orange-600">
                            Anonymous Contact
                          </p>
                          <p className="text-sm">
                            Name:{" "}
                            {selectedTicket.metadata.contact_name as string}
                          </p>
                          <p className="text-sm">
                            Email:{" "}
                            {selectedTicket.metadata.contact_email as string}
                          </p>
                          {selectedTicket.metadata.contact_company && (
                            <p className="text-sm">
                              Company:{" "}
                              {String(selectedTicket.metadata.contact_company)}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Inquiry Type:{" "}
                            {selectedTicket.metadata.inquiry_type as string}
                          </p>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm">
                            User ID: {selectedTicket.user_id}
                          </p>
                          <p className="text-sm">
                            {selectedTicket.organization_account_number
                              ? `Account: ${selectedTicket.organization_account_number}`
                              : `Org ID: ${selectedTicket.organization_id}`}
                          </p>
                          {selectedTicket.organization_name && (
                            <p className="text-sm text-gray-500">
                              {selectedTicket.organization_name}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Category
                      </Label>
                      <p className="text-sm capitalize">
                        {selectedTicket.category.replace("_", " ")}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Created
                      </Label>
                      <p className="text-sm">
                        {new Date(selectedTicket.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">
                        Last Updated
                      </Label>
                      <p className="text-sm">
                        {new Date(selectedTicket.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Description
                    </Label>
                    <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedTicket.attachments &&
                    selectedTicket.attachments.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium text-gray-900">
                          Attachments ({selectedTicket.attachments.length})
                        </Label>
                        <div className="mt-2 space-y-2">
                          {selectedTicket.attachments.map(
                            (attachment, index) => (
                              <div
                                key={`${attachment.s3_key}-${index}`}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  {getFileIcon(attachment.file_type)}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {attachment.original_filename}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(attachment.file_size)} •{" "}
                                      {attachment.file_type}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => downloadAttachment(attachment)}
                                  className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50"
                                  title="Download attachment"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Admin Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        Status
                      </Label>
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(value) =>
                          handleStatusUpdate(selectedTicket.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="waiting_for_customer">
                            Waiting for Customer
                          </SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-900">
                        Priority
                      </Label>
                      <Select
                        value={selectedTicket.priority}
                        onValueChange={(value) =>
                          handlePriorityUpdate(selectedTicket.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
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

                  {/* Responses */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Responses
                    </Label>
                    <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                      {selectedTicket.responses.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No responses yet
                        </p>
                      ) : (
                        selectedTicket.responses.map((response) => (
                          <div
                            key={response.id}
                            className={`p-3 rounded-lg ${
                              response.is_internal
                                ? "bg-yellow-50 border-l-4 border-yellow-400"
                                : "bg-blue-50 border-l-4 border-blue-400"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-gray-500">
                                {response.admin_user_id ? "Admin" : "System"}
                                {response.is_internal && " (Internal)"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(response.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">
                              {response.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Response */}
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Add Response
                    </Label>
                    <div className="mt-2 space-y-3">
                      <Textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Enter your response..."
                        rows={4}
                      />
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="internal"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor="internal"
                          className="text-sm text-gray-600"
                        >
                          Internal note (not visible to customer)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <button
                    type="button"
                    onClick={() => setTicketDetailOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleAddResponse}
                    disabled={!responseText.trim() || isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Adding..." : "Add Response"}
                  </button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
