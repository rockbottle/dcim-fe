import { NextRequest, NextResponse } from "next/server";

async function proxyHandler(
  req: NextRequest,
  // Note: params is now a Promise in Next.js 15
  { params }: { params: Promise<{ args: string[] }> },
) {
  // 1. Await the params before using them
  const resolvedParams = await params;

  // 2. Join args and remove any accidental double slashes
  const path = resolvedParams.args.filter(Boolean).join("/");

  // 3. Get the Internal Backend URL
  const backendBaseUrl = process.env.BACKEND_URL || "http://dcim-be:8000";
  // 4. Construct the full internal URL Safely
  // This regex ensures we only have ONE slash between the base and the path
  const cleanBase = backendBaseUrl.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");
  const fullUrl = `${cleanBase}/${cleanPath}${req.nextUrl.search}`;

  console.log(`[Proxy Log] Forwarding request to: ${fullUrl}`);

  try {
    // 4. Get the raw body as text to preserve formatting (JSON or Form-Data)
    const body =
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.text()
        : undefined;

    // 5. Forward the request to the backend
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        // FIX: Forward the browser's original Content-Type (important for /token)
        "Content-Type": req.headers.get("content-type") || "application/json",
        // Forward the Authorization token for protected routes
        Authorization: req.headers.get("authorization") || "",
      },
      body,
    });

    // 6. Handle the response from the backend
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      // If the backend returns text/html or plain text, wrap it in a JSON object
      const text = await response.text();
      data = { message: text };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Internal Proxy Error:", error);
    return NextResponse.json(
      { message: "Could not connect to internal backend service" },
      { status: 500 },
    );
  }
}

// Export the proxy for all standard HTTP methods
export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const DELETE = proxyHandler;
