"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

declare global {
  interface Window {
    Clerk?: any;
  }
}

interface DebugInfo {
  clerkLoaded: boolean;
  clerkUser: any;
  clerkSession: any;
  clerkAuth: any;
  windowClerk: any;
  envVars: Record<string, string>;
  timestamp: string;
}

export default function DebugPage() {
  const { isLoaded: authLoaded, userId, getToken, sessionId } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const collectDebugInfo = () => {
    const info: DebugInfo = {
      clerkLoaded: authLoaded && userLoaded,
      clerkUser: user
        ? {
            id: user.id,
            primaryEmailAddress: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            hasImage: !!user.hasImage,
            createdAt: user.createdAt,
            lastSignInAt: user.lastSignInAt,
          }
        : null,
      clerkSession: sessionId
        ? {
            sessionId,
            userId,
          }
        : null,
      clerkAuth: {
        isLoaded: authLoaded,
        userId,
        sessionId,
      },
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
      timestamp: new Date().toISOString(),
    };
    setDebugInfo(info);
  };

  useEffect(() => {
    collectDebugInfo();
  }, [authLoaded, userLoaded, user, userId, sessionId, refreshCount]);

  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
    collectDebugInfo();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Admin Panel Debug Information
        </h1>
        <p className="text-gray-600">
          This page shows Clerk authentication status and environment
          configuration.
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
                <span className="font-medium">Clerk Loaded:</span>{" "}
                <span
                  className={
                    debugInfo.clerkLoaded ? "text-green-600" : "text-red-600"
                  }
                >
                  {debugInfo.clerkLoaded ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div>
                <span className="font-medium">User Signed In:</span>{" "}
                <span
                  className={
                    debugInfo.clerkUser ? "text-green-600" : "text-red-600"
                  }
                >
                  {debugInfo.clerkUser ? "✅ Yes" : "❌ No"}
                </span>
              </div>
              <div>
                <span className="font-medium">User ID:</span>{" "}
                <span className="font-mono text-xs bg-gray-200 px-1 rounded">
                  {debugInfo.clerkUser?.id || "null"}
                </span>
              </div>
              <div>
                <span className="font-medium">Session ID:</span>{" "}
                <span className="font-mono text-xs bg-gray-200 px-1 rounded">
                  {debugInfo.clerkSession?.sessionId || "null"}
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

          {/* Clerk Auth Hook */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">useAuth() Hook</h2>
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.clerkAuth, null, 2)}
            </pre>
          </div>

          {/* Clerk User Hook */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">useUser() Hook</h2>
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.clerkUser, null, 2)}
            </pre>
          </div>

          {/* Window Clerk Object */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">window.Clerk Object</h2>
            <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
              {JSON.stringify(debugInfo.windowClerk, null, 2)}
            </pre>
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
              {!debugInfo.clerkLoaded && (
                <div className="text-orange-600">
                  ⚠️ <strong>Clerk not loaded</strong> - Check environment
                  configuration
                </div>
              )}
              {!debugInfo.clerkUser && debugInfo.clerkLoaded && (
                <div className="text-blue-600">
                  ℹ️ <strong>User not signed in</strong> - Sign in to get user
                  ID
                </div>
              )}
              {debugInfo.clerkUser && (
                <div className="text-green-600">
                  ✅ <strong>Ready!</strong> User ID:{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    {debugInfo.clerkUser.id}
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
