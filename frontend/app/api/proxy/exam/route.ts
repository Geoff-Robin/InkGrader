import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy-utils";

export async function GET(req: NextRequest) {
    return proxyRequest(req, "/api/exam/");
}

export async function POST(req: NextRequest) {
    return proxyRequest(req, "/api/exam/");
}
