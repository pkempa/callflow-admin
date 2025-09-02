"use client";

import { useUser, useOrganization } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export function AdminVerification({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const verifyAdminAccess = () => {
      if (!isLoaded || !orgLoaded || !user) return;

      setHasInitialized(true);
      setIsVerifying(true);
      setVerificationError(null);

      try {
        // Check if user is in the platform admin organization
        const isPlatformAdminOrg = organization?.id === "platform-admin-org";
        
        if (!isPlatformAdminOrg) {
          setVerificationError(
            "Access denied. You must be a member of the CallFlow platform administration organization to access this admin panel."
          );
          console.log(
            `❌ Admin access denied: User organization=${organization?.id}, required=platform-admin-org`
          );
          setIsVerifying(false);
          return;
        }

        // Check user's role in the platform admin organization
        const userRole = organization?.memberships?.find(
          membership => membership.publicUserData.userId === user.id
        )?.role;

        const isPlatformAdmin = userRole === "admin";
        const isPlatformMember = userRole === "basic_member";

        if (isPlatformAdmin || isPlatformMember) {
          setIsVerified(true);
          console.log(
            `✅ Admin access granted: Role=${userRole}, Organization=${organization?.id}`
          );
        } else {
          setVerificationError(
            "Access denied. You must have admin or member privileges in the platform administration organization."
          );
          console.log(
            `❌ Admin access denied: Role=${userRole}, Organization=${organization?.id} - insufficient privileges`
          );
        }
      } catch (error) {
        console.error("Admin verification error:", error);
        setVerificationError(
          "Unable to verify admin access. Please try refreshing the page or contact support."
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAdminAccess();
  }, [isLoaded, orgLoaded, user, organization]);

  // Show loading state while Clerk is loading or verifying admin access
  if (!hasInitialized || isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {!hasInitialized ? "Loading..." : "Verifying admin access..."}
            </h2>
            <p className="text-gray-600">
              {!hasInitialized
                ? "Please wait while we load the application."
                : "Please wait while we verify your admin permissions."}
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Admin Access Required
              </h2>
              <p className="text-red-600 mb-4 text-sm leading-relaxed">
                {verificationError}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
                <p className="text-xs text-gray-500">
                  If you believe this is an error, please contact your system
                  administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show children once verification is complete
  return <>{children}</>;
}
