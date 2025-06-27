import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
        <div className="mb-8 text-center">
          <div className="mx-auto h-12 w-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Invitation Required
          </h2>
          <p className="text-gray-600 mt-2">
            Admin access is by invitation only
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              <strong>Admin Registration Disabled</strong>
            </p>
            <p className="text-amber-700 text-sm mt-2">
              New administrators must be invited by an existing admin.
              Self-registration is not permitted for security reasons.
            </p>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <p>To request admin access:</p>
            <ul className="list-disc list-inside space-y-1 text-left">
              <li>Contact your system administrator</li>
              <li>Request an invitation to be sent to your email</li>
              <li>Use the invitation link to create your account</li>
            </ul>
          </div>

          <Link
            href="/sign-in"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
}
