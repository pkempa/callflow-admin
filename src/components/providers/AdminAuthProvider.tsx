"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import {
  setAuthTokenGetter,
  setSignOutFunction,
  resetAuthSystem,
} from "@/lib/admin-api";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, signOut, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    // Reset auth system on mount to handle refresh scenarios
    resetAuthSystem();

    // Set up auth functions immediately when Clerk is fully loaded
    if (isLoaded && getToken && signOut) {
      // Wrap getToken to add error handling
      const wrappedGetToken = async () => {
        try {
          const token = await getToken();
          return token;
        } catch {
          return null;
        }
      };

      setAuthTokenGetter(wrappedGetToken);
      setSignOutFunction(signOut);
    }
  }, [getToken, signOut, isLoaded, isSignedIn]);

  return <>{children}</>;
}
