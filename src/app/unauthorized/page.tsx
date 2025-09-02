"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ShieldX, ArrowLeft, Home } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    // Redirect to main CallFlow app
    const mainAppUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://app.callflowhq.com";
    window.location.href = mainAppUrl;
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldX className="w-10 h-10 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          You don't have permission to access the CallFlowHQ Admin Panel.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          This area is restricted to platform administrators only. If you
          believe this is an error, please contact your system administrator.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to CallFlowHQ App
          </button>

          <button
            onClick={handleGoBack}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={handleSignOut}
            className="w-full text-gray-500 py-2 px-4 rounded-lg font-medium hover:text-gray-700 transition-colors text-sm"
          >
            Sign Out
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Need help? Contact support at{" "}
            <a
              href="mailto:support@callflowhq.com"
              className="text-blue-600 hover:text-blue-700"
            >
              support@callflowhq.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
