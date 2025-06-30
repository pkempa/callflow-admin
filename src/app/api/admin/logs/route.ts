import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { getToken, userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get JWT token for backend authentication
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    // Get query parameters from the request
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    // Backend API URL
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://gln3f6l37g.execute-api.us-east-1.amazonaws.com/prod";

    // Forward request to backend
    const backendUrl = `${apiUrl}/admin/logs${
      queryString ? `?${queryString}` : ""
    }`;

    console.log(`📋 Proxying log request to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "CallFlowHQ-Admin/1.0",
      },
    });

    if (!response.ok) {
      console.error(`❌ Backend log API error: ${response.status}`);
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Backend API error: ${response.status}`,
          details: errorText.substring(0, 200),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`✅ Successfully fetched ${data.logs?.length || 0} logs`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error in admin logs proxy:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch logs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { getToken, userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get JWT token for backend authentication
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token available" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();

    // Backend API URL
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://gln3f6l37g.execute-api.us-east-1.amazonaws.com/prod";

    // Forward request to backend
    const backendUrl = `${apiUrl}/admin/logs`;

    console.log(`📋 Proxying log storage request to: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "CallFlowHQ-Admin/1.0",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`❌ Backend log storage API error: ${response.status}`);
      const errorText = await response.text();
      return NextResponse.json(
        {
          error: `Backend API error: ${response.status}`,
          details: errorText.substring(0, 200),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`✅ Successfully stored ${data.stored_count || 0} logs`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Error in admin log storage proxy:", error);

    return NextResponse.json(
      {
        error: "Failed to store logs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
