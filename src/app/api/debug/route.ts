import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { getToken, userId } = await auth();

    console.log("=== Admin Debug Endpoint ===");
    console.log("User ID:", userId);

    if (!userId) {
      return NextResponse.json({
        error: "Not authenticated",
        userId: null,
        token: null,
      });
    }

    // Get fresh JWT token
    const token = await getToken();
    console.log("Token length:", token?.length || 0);

    if (token) {
      // Test the token immediately with the backend
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://ca6ofgmah9.execute-api.us-east-1.amazonaws.com/prod";

      try {
        console.log("Testing token with /admin/analytics...");
        const response = await fetch(`${apiUrl}/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("API Response Status:", response.status);
        const responseText = await response.text();
        console.log("API Response:", responseText.substring(0, 200));

        return NextResponse.json({
          userId,
          tokenLength: token.length,
          tokenPreview: `${token.substring(0, 50)}...`,
          apiTest: {
            status: response.status,
            response: responseText.substring(0, 500),
          },
        });
      } catch (apiError) {
        console.error("API test failed:", apiError);
        return NextResponse.json({
          userId,
          tokenLength: token.length,
          tokenPreview: `${token.substring(0, 50)}...`,
          apiTest: {
            error:
              apiError instanceof Error ? apiError.message : "Unknown error",
          },
        });
      }
    }

    return NextResponse.json({
      userId,
      token: token ? "present" : "missing",
      tokenLength: token?.length || 0,
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");

  return new NextResponse(null, { status: 200, headers });
}
