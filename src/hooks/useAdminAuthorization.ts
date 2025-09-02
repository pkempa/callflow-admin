"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { adminAPI } from "@/lib/admin-api";

interface AdminAuthorizationState {
  isLoading: boolean;
  isAuthorized: boolean;
  userProfile: any | null;
  error: string | null;
}

interface UseAdminAuthorizationOptions {
  redirectOnUnauthorized?: boolean;
  redirectUrl?: string;
}

export function useAdminAuthorization(
  options: UseAdminAuthorizationOptions = {}
): AdminAuthorizationState {
  const { redirectOnUnauthorized = true, redirectUrl = "/unauthorized" } =
    options;
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<AdminAuthorizationState>({
    isLoading: true,
    isAuthorized: false,
    userProfile: null,
    error: null,
  });

  useEffect(() => {
    async function checkAdminAuthorization() {
      // Wait for Clerk to load
      if (!isLoaded) {
        return;
      }

      // If not signed in, not authorized
      if (!isSignedIn) {
        setState({
          isLoading: false,
          isAuthorized: false,
          userProfile: null,
          error: "Not signed in",
        });

        if (redirectOnUnauthorized) {
          router.push("/sign-in");
        }
        return;
      }

      try {
        // Try to get user profile - backend will enforce admin permissions
        console.log("🔍 Checking admin authorization...");
        const profileResponse = await adminAPI.getUserProfile();

        if (!profileResponse.success) {
          console.error(
            "❌ Admin authorization failed:",
            profileResponse.error
          );

          // Check for authorization errors (401/403 or access denied messages)
          const errorMessage = profileResponse.error || "";
          const isAuthError =
            errorMessage.includes("401") ||
            errorMessage.includes("403") ||
            errorMessage.includes("Access denied") ||
            errorMessage.includes("Unauthorized") ||
            errorMessage.includes("Forbidden") ||
            errorMessage.includes("platform admin") ||
            errorMessage.includes("admin privileges");

          if (isAuthError) {
            setState({
              isLoading: false,
              isAuthorized: false,
              userProfile: null,
              error: "Access denied - Platform admin privileges required",
            });

            if (redirectOnUnauthorized) {
              console.log(
                "❌ User not authorized for admin access, redirecting to unauthorized page..."
              );
              router.push(redirectUrl);
            }
            return;
          }

          // Other errors (network, etc.) - still deny access but don't redirect
          setState({
            isLoading: false,
            isAuthorized: false,
            userProfile: null,
            error: profileResponse.error || "Failed to verify admin access",
          });
          return;
        }

        // If we got a successful response, user is authorized
        const userProfile = profileResponse.data;
        console.log("✅ Admin authorization successful:", {
          email: userProfile?.email,
          role: userProfile?.role,
          organization: userProfile?.organization?.name,
        });

        setState({
          isLoading: false,
          isAuthorized: true,
          userProfile,
          error: null,
        });
      } catch (error) {
        console.error("❌ Error checking admin authorization:", error);

        // Any error accessing the admin profile endpoint means no admin access
        // This includes network errors, CORS errors, or endpoint not found
        setState({
          isLoading: false,
          isAuthorized: false,
          userProfile: null,
          error: "Access denied - Unable to verify admin privileges",
        });

        if (redirectOnUnauthorized) {
          console.log(
            "❌ Admin authorization check failed, redirecting to unauthorized page..."
          );
          router.push(redirectUrl);
        }
      }
    }

    checkAdminAuthorization();
  }, [isLoaded, isSignedIn, router, redirectOnUnauthorized, redirectUrl]);

  return state;
}
