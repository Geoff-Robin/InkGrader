import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy-utils";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return proxyRequest(req, `/api/exam/${id}/rubrics`);
}
