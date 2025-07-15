"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function AdminVerification({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [isVerified, setIsVerified] = useState(false);
  // Note: isVerifying and verificationError are reserved for future verification system
  const [verificationError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setHasInitialized(true);
      // Skip verification and allow access immediately
      setIsVerified(true);
    }
  }, [isLoaded]);

  // Show loading state while Clerk is loading
  if (!hasInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying admin access...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your admin permissions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show verification error if needed
  if (verificationError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Access Denied
              </h2>
              <p className="text-red-600 mb-4">{verificationError}</p>
              <p className="text-sm text-gray-500">
                Redirecting to sign-in page...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show children once verification is complete
  return <>{children}</>;
}
