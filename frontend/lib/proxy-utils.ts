import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function proxyRequest(req: NextRequest, targetPath: string) {
    const url = new URL(targetPath, BACKEND_URL);

    // Copy search params from the original request
    req.nextUrl.searchParams.forEach((value, key) => {
        url.searchParams.set(key, value);
    });

    const headers = new Headers(req.headers);
    // Remove host header to avoid conflicts
    headers.delete("host");

    try {
        const response = await fetch(url.toString(), {
            method: req.method,
            headers: headers,
            body: req.method !== "GET" && req.method !== "HEAD" ? await req.blob() : undefined,
            cache: "no-store",
        });

        const data = await response.json().catch(() => null);

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error(`Proxy error for ${url.toString()}:`, error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
