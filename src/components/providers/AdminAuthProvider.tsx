"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  setAuthTokenGetter,
  setSignOutFunction,
  resetAuthSystem,
} from "@/lib/admin-api";

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { getToken, signOut, isLoaded } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Reset auth system on mount to handle refresh scenarios
    console.log("🔄 AdminAuthProvider: Resetting auth system");
    resetAuthSystem();

    // Only set up auth functions when Clerk is fully loaded
    if (isLoaded && getToken && signOut) {
      console.log(
        "✅ AdminAuthProvider: Setting up authentication (Clerk loaded)"
      );

      // Wrap getToken to add error handling
      const wrappedGetToken = async () => {
        try {
          const token = await getToken();
          return token;
        } catch (error) {
          console.error("❌ AdminAuthProvider: Error getting token:", error);
          return null;
        }
      };

      setAuthTokenGetter(wrappedGetToken);
      setSignOutFunction(signOut);
      console.log(
        "🎉 AdminAuthProvider: Auth setup complete - API requests should now work"
      );
    } else {
      console.log("⏳ AdminAuthProvider: Waiting for Clerk to load", {
        isLoaded,
        hasGetToken: !!getToken,
        hasSignOut: !!signOut,
      });
    }
  }, [getToken, signOut, isLoaded]);

  // Prevent hydration mismatch by not rendering until client-side hydration is complete
  if (!isHydrated) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
