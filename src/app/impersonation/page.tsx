"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  Clock,
  Shield,
  AlertTriangle,
  Users,
  Activity,
} from "lucide-react";
import { impersonationApi, ImpersonationSession } from "@/lib/admin-api";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface ImpersonationResponse {
  sessions: ImpersonationSession[];
  pagination: PaginationInfo;
}

export default function ImpersonationPage() {
  const [allSessions, setAllSessions] = useState<ImpersonationSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<ImpersonationSession[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedSession, setSelectedSession] =
    useState<ImpersonationSession | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

  const fetchSessions = async () => {
    try {
      setLoading(true);

      // Fetch active sessions
      const activeResponse = await impersonationApi.getImpersonationSessions({
        active_only: true,
        limit: 100,
      });

      // Fetch all recent sessions
      const allResponse = await impersonationApi.getImpersonationSessions({
        active_only: false,
        limit: 100,
      });

      if (activeResponse.success && activeResponse.data) {
        setActiveSessions(
          (activeResponse.data as ImpersonationResponse).sessions
        );
      }

      if (allResponse.success && allResponse.data) {
        setAllSessions((allResponse.data as ImpersonationResponse).sessions);
      }
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (session: ImpersonationSession) => {
    setSelectedSession(session);
    setConfirmDialog(true);
  };

  const confirmEndSession = async () => {
    if (!selectedSession) return;

    try {
      setActionLoading(true);
      const response = await impersonationApi.endImpersonation(
        selectedSession.id
      );

      if (response.success) {
        await fetchSessions(); // Refresh the data
        setConfirmDialog(false);
        setSelectedSession(null);
      } else {
        alert(response.error || "Failed to end impersonation session");
      }
    } catch {
      alert("Failed to end impersonation session");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const getSessionBadgeColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const SessionTable = ({ sessions }: { sessions: ImpersonationSession[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Target User</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell>
              <div>
                <div className="font-medium">
                  User ID: {session.target_user_id}
                </div>
                <div className="text-sm text-gray-500">
                  Org: {session.target_organization_id}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">Admin ID: {session.actor_user_id}</div>
            </TableCell>
            <TableCell>
              <div className="max-w-xs truncate" title={session.reason}>
                {session.reason}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                {formatDuration(session.start_time, session.end_time)}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getSessionBadgeColor(session.is_active)}>
                {session.is_active ? "Active" : "Ended"}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(session.start_time).toLocaleString()}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    /* TODO: Implement view session details */
                  }}
                  className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Eye className="h-3 w-3" />
                </button>
                {session.is_active && (
                  <button
                    onClick={() => handleEndSession(session)}
                    className="px-2 py-1 text-xs font-medium text-red-600 bg-white border border-gray-300 rounded hover:bg-red-50 hover:text-red-700"
                  >
                    End Session
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Impersonation Management</h1>
          <p className="text-gray-600">
            Monitor and manage user impersonation sessions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeSessions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active impersonations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions Today
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                allSessions.filter(
                  (s) =>
                    new Date(s.start_time).toDateString() ===
                    new Date().toDateString()
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Sessions started today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Security Status
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-xs text-muted-foreground">
              All sessions monitored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-800">Security Notice</h3>
              <p className="text-sm text-orange-700 mt-1">
                All impersonation sessions are logged and monitored for security
                purposes. Only use impersonation for legitimate support and
                debugging purposes. Sessions automatically expire and all
                actions are audited.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Impersonation Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">
                Active Sessions ({activeSessions.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All Sessions ({allSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-6">
              {loading ? (
                <div className="text-center py-8">
                  Loading active sessions...
                </div>
              ) : activeSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active impersonation sessions
                </div>
              ) : (
                <SessionTable sessions={activeSessions} />
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              {loading ? (
                <div className="text-center py-8">Loading sessions...</div>
              ) : allSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No impersonation sessions found
                </div>
              ) : (
                <SessionTable sessions={allSessions} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Confirm End Session Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Impersonation Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to end this impersonation session? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="py-4">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Target User:</strong> {selectedSession.target_user_id}
                </div>
                <div>
                  <strong>Reason:</strong> {selectedSession.reason}
                </div>
                <div>
                  <strong>Duration:</strong>{" "}
                  {formatDuration(selectedSession.start_time)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setConfirmDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmEndSession}
              disabled={actionLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading ? "Ending..." : "End Session"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
