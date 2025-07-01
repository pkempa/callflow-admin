import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/lib/admin-api";

interface UseAdminStatusMonitorOptions {
  checkInterval?: number; // in milliseconds, default 60 seconds
  enabled?: boolean; // default true
}

export const useAdminStatusMonitor = ({
  checkInterval = 60 * 1000, // 60 seconds
  enabled = true,
}: UseAdminStatusMonitorOptions = {}) => {
  const { signOut, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  const handleStatusChange = useCallback(
    async (reason: string) => {
      console.log(`[ADMIN_STATUS_MONITOR] Admin status changed: ${reason}`);

      try {
        // Sign out from Clerk
        await signOut();

        // Redirect to admin sign-in with error parameter
        router.push(`/sign-in?error=account_issue`);
      } catch (error) {
        console.error("❌ Error during automatic admin logout:", error);
        // Force redirect even if signOut fails
        window.location.href = "/sign-in?error=account_issue";
      }
    },
    [signOut, router]
  );

  const checkAdminStatus = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      return;
    }

    // Skip if not ready or not signed in
    if (!isLoaded || !isSignedIn) {
      return;
    }

    // Throttle checks to prevent too frequent requests
    const now = Date.now();
    if (now - lastCheckRef.current < checkInterval) {
      return;
    }

    isCheckingRef.current = true;
    lastCheckRef.current = now;

    try {
      console.log("[ADMIN_STATUS_MONITOR] Checking admin status...");

      const response = await adminAPI.getUserProfile();

      if (!response.success) {
        // If we get an error, the API layer will handle 401/403 automatically
        console.log(
          "[ADMIN_STATUS_MONITOR] Profile check failed, API will handle auth errors"
        );
        return;
      }

      const userData = response.data;

      if (!userData) {
        console.log("[ADMIN_STATUS_MONITOR] No admin data returned");
        await handleStatusChange("No admin data");
        return;
      }

      // Check admin user status
      if (userData.status === "inactive") {
        console.log("[ADMIN_STATUS_MONITOR] Admin is inactive");
        await handleStatusChange("Admin account deactivated");
        return;
      }

      // Check organization status (if organization data is available)
      if (userData.organization) {
        if (userData.organization.is_active === false) {
          console.log("[ADMIN_STATUS_MONITOR] Admin organization is inactive");
          await handleStatusChange("Admin organization deactivated");
          return;
        }
        console.log("[ADMIN_STATUS_MONITOR] Admin organization status OK");
      }

      console.log("[ADMIN_STATUS_MONITOR] Admin status OK");
    } catch (error) {
      console.error(
        "[ADMIN_STATUS_MONITOR] Error checking admin status:",
        error
      );
      // Don't auto-logout on network errors, let the admin continue
    } finally {
      isCheckingRef.current = false;
    }
  }, [isLoaded, isSignedIn, handleStatusChange, checkInterval]);

  // Set up periodic status checking
  useEffect(() => {
    if (!enabled || !isLoaded || !isSignedIn) {
      return;
    }

    console.log("[ADMIN_STATUS_MONITOR] Starting admin status monitoring");

    // Start the interval
    intervalRef.current = setInterval(checkAdminStatus, checkInterval);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      console.log("[ADMIN_STATUS_MONITOR] Stopped admin status monitoring");
    };
  }, [enabled, isLoaded, isSignedIn, checkAdminStatus, checkInterval]);

  // Also check status when the admin becomes active (page focus)
  useEffect(() => {
    if (!enabled || !isLoaded || !isSignedIn) {
      return;
    }

    const handleFocus = () => {
      console.log("[ADMIN_STATUS_MONITOR] Page focused, checking admin status");
      checkAdminStatus();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [enabled, isLoaded, isSignedIn, checkAdminStatus]);

  return {
    checkAdminStatus,
  };
};
