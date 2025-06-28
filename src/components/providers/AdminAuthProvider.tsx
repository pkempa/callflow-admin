"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setAuthTokenGetter, setSignOutFunction } from "@/lib/admin-api";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, signOut, isLoaded } = useAuth();

  useEffect(() => {
    // Only set up auth functions when Clerk is fully loaded
    if (isLoaded && getToken && signOut) {
      console.log("🔧 Setting up admin auth functions");

      // Wrap getToken to add logging
      const wrappedGetToken = async () => {
        try {
          const token = await getToken();
          if (token) {
            console.log("✅ Admin auth token retrieved successfully");
          } else {
            console.warn("⚠️ No admin auth token available");
          }
          return token;
        } catch (error) {
          console.error("❌ Failed to get admin auth token:", error);
          return null;
        }
      };

      setAuthTokenGetter(wrappedGetToken);
      setSignOutFunction(signOut);

      console.log("✅ Admin auth functions setup completed");
    }
  }, [getToken, signOut, isLoaded]);

  return <>{children}</>;
}
