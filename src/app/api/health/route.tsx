import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const probeType = searchParams.get("type");

  // This part is what the Sidebar talks to
  if (probeType === "live") {
    return NextResponse.json(
      {
        status: "UP",
        // These will now correctly return "js" and "dcim-fe-..."
        pod_name: process.env.NEXT_PUBLIC_MY_POD_NAME || "unknown",
        node_name: process.env.NEXT_PUBLIC_MY_NODE_NAME || "unknown",
      },
      { status: 200 }
    );
  }

  // This part is what Kubernetes Readiness probe talks to
  try {
    // Using internal K8s service name for the backend check
    const backendRes = await fetch("http://dcim-be:8000/health/healthz", {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(2000),
    });
    if (!backendRes.ok) throw new Error("Backend Unreachable");
    return NextResponse.json({ status: "UP" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { status: "DOWN", error: (error as Error).message },
      { status: 503 }
    );
  }
}
