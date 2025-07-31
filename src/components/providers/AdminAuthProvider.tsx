"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import {
  setAuthTokenGetter,
  setSignOutFunction,
  resetAuthSystem,
} from "@/lib/admin-api";

// Token caching to prevent infinite loops
let cachedToken: string | null = null;
let tokenExpiry: number = 0;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, signOut, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    // Reset auth system on mount to handle refresh scenarios
    resetAuthSystem();

    // Clear token cache on reset
    cachedToken = null;
    tokenExpiry = 0;

    // Set up auth functions immediately when Clerk is fully loaded
    if (isLoaded && getToken && signOut) {
      // Wrap getToken to add caching and error handling
      const wrappedGetToken = async () => {
        try {
          // Check if we have a valid cached token
          const now = Date.now();
          if (cachedToken && now < tokenExpiry) {
            console.log("🔑 AdminAuthProvider: Using cached token");
            return cachedToken;
          }

          console.log("🔑 AdminAuthProvider: Requesting token from Clerk...");
          const token = await getToken();
          if (token) {
            console.log("🔑 AdminAuthProvider: Token retrieved successfully");
            // Cache the token for 5 minutes
            cachedToken = token;
            tokenExpiry = now + TOKEN_CACHE_DURATION;
            console.log(
              `🔑 AdminAuthProvider: Token cached until ${new Date(
                tokenExpiry
              ).toLocaleTimeString()}`
            );
          } else {
            console.warn("⚠️ AdminAuthProvider: No token returned from Clerk");
            // Clear cache if no token returned
            cachedToken = null;
            tokenExpiry = 0;
          }
          return token;
        } catch (error) {
          console.error("❌ AdminAuthProvider: Error getting token:", error);
          // Clear cache on error
          cachedToken = null;
          tokenExpiry = 0;
          return null;
        }
      };

      // Wrap signOut to clear token cache
      const wrappedSignOut = async () => {
        console.log(
          "🔑 AdminAuthProvider: User signing out, clearing token cache"
        );
        cachedToken = null;
        tokenExpiry = 0;
        await signOut();
      };

      setAuthTokenGetter(wrappedGetToken);
      setSignOutFunction(wrappedSignOut);
    }
  }, [getToken, signOut, isLoaded, isSignedIn]);

  return <>{children}</>;
}
