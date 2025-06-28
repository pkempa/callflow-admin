"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Clerk?: any;
  }
}

interface DebugInfo {
  windowClerk: any;
  envVars: Record<string, string>;
  timestamp: string;
  clerkScriptLoaded: boolean;
}

export default function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const collectDebugInfo = () => {
    const info: DebugInfo = {
      windowClerk:
        typeof window !== "undefined"
          ? {
              exists: !!window.Clerk,
              loaded: window.Clerk?.loaded,
              user: window.Clerk?.user
                ? {
                    id: window.Clerk.user.id,
                    primaryEmailAddress:
                      window.Clerk.user.primaryEmailAddress?.emailAddress,
                    firstName: window.Clerk.user.firstName,
                    lastName: window.Clerk.user.lastName,
                  }
                : null,
              session: window.Clerk?.session
                ? {
                    id: window.Clerk.session.id,
                    userId: window.Clerk.session.userId,
                  }
                : null,
            }
          : null,
      envVars: {
        NODE_ENV: process.env.NODE_ENV || "undefined",
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env
          .NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          ? `${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(
              0,
              20
            )}...`
          : "undefined",
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "undefined",
      },
      clerkScriptLoaded:
        typeof window !== "undefined" &&
        !!document.querySelector('script[src*="clerk"]'),
      timestamp: new Date().toISOString(),
    };
    setDebugInfo(info);
  };

  useEffect(() => {
    collectDebugInfo();

    // Try to wait for Clerk to load
    const checkClerk = () => {
      if (window.Clerk) {
        try {
          if (
            window.Clerk.addListener &&
            typeof window.Clerk.addListener === "function"
          ) {
            window.Clerk.addListener("load", collectDebugInfo);
          }
        } catch (e) {
          console.log("Clerk addListener error:", e);
        }
        collectDebugInfo();
      }
    };

    // Check immediately
    checkClerk();

    // Check every second for up to 10 seconds
    const interval = setInterval(() => {
      checkClerk();
      collectDebugInfo();
    }, 1000);

    setTimeout(() => clearInterval(interval), 10000);

    return () => clearInterval(interval);
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
    collectDebugInfo();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Admin Panel Debug Information (No Auth)
        </h1>
        <p className="text-gray-600">
          This page shows Clerk authentication status and environment
          configuration without any authentication checks.
        </p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Info
        </button>
      </div>

      {debugInfo && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Clerk Script Loaded:</span>{" "}
                <span
                  className={
                    debugInfo.clerkScriptLoaded
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {debugInfo.clerkScriptLoaded ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div>
                <span className="font-medium">window.Clerk Exists:</span>{" "}
                <span
                  className={
                    debugInfo.windowClerk?.exists
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {debugInfo.windowClerk?.exists ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div>
                <span className="font-medium">Clerk Loaded:</span>{" "}
                <span
                  className={
                    debugInfo.windowClerk?.loaded
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {debugInfo.windowClerk?.loaded ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div>
                <span className="font-medium">User Signed In:</span>{" "}
                <span
                  className={
                    debugInfo.windowClerk?.user
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {debugInfo.windowClerk?.user ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div>
                <span className="font-medium">User ID:</span>{" "}
                <span className="font-mono text-xs bg-gray-200 px-1 rounded">
                  {debugInfo.windowClerk?.user?.id || "null"}
                </span>
              </div>
              <div>
                <span className="font-medium">Session ID:</span>{" "}
                <span className="font-mono text-xs bg-gray-200 px-1 rounded">
                  {debugInfo.windowClerk?.session?.id || "null"}
                </span>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">
              Environment Variables
            </h2>
            <div className="space-y-2 text-sm">
              {Object.entries(debugInfo.envVars).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium w-64">{key}:</span>
                  <span
                    className={`font-mono text-xs px-1 rounded ${
                      value === "undefined"
                        ? "bg-red-200 text-red-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Window Clerk Object */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">window.Clerk Object</h2>
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.windowClerk, null, 2)}
            </pre>
          </div>

          {/* Console Commands */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">
              Console Commands to Try
            </h2>
            <div className="text-sm space-y-2">
              <div>
                <span className="font-medium">Check Clerk:</span>
                <code className="ml-2 bg-gray-200 px-1 rounded text-xs">
                  console.log('Clerk:', window.Clerk)
                </code>
              </div>
              <div>
                <span className="font-medium">Check User:</span>
                <code className="ml-2 bg-gray-200 px-1 rounded text-xs">
                  console.log('User ID:', window.Clerk?.user?.id)
                </code>
              </div>
              <div>
                <span className="font-medium">Check Session:</span>
                <code className="ml-2 bg-gray-200 px-1 rounded text-xs">
                  console.log('Session:', window.Clerk?.session)
                </code>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-orange-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Recommendations</h2>
            <div className="text-sm space-y-2">
              {debugInfo.envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ===
                "undefined" && (
                <div className="text-red-600">
                  ❌ <strong>Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</strong>{" "}
                  - Create .env.local file with Clerk keys
                </div>
              )}
              {!debugInfo.clerkScriptLoaded && (
                <div className="text-orange-600">
                  ⚠️ <strong>Clerk script not loaded</strong> - Check if
                  ClerkProvider is working
                </div>
              )}
              {!debugInfo.windowClerk?.exists && (
                <div className="text-orange-600">
                  ⚠️ <strong>window.Clerk not available</strong> - Clerk not
                  initialized
                </div>
              )}
              {!debugInfo.windowClerk?.loaded &&
                debugInfo.windowClerk?.exists && (
                  <div className="text-blue-600">
                    ℹ️ <strong>Clerk exists but not loaded</strong> - Waiting
                    for initialization
                  </div>
                )}
              {!debugInfo.windowClerk?.user &&
                debugInfo.windowClerk?.loaded && (
                  <div className="text-blue-600">
                    ℹ️ <strong>User not signed in</strong> - Need to sign in to
                    get user ID
                  </div>
                )}
              {debugInfo.windowClerk?.user && (
                <div className="text-green-600">
                  ✅ <strong>Ready!</strong> User ID:{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    {debugInfo.windowClerk.user.id}
                  </code>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Last updated: {debugInfo.timestamp}
          </div>
        </div>
      )}
    </div>
  );
}
