import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/proxy-utils";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; student_id: string }> }
) {
    const { id, student_id } = await params;
    return proxyRequest(req, `/api/exam/${id}/students/${student_id}`);
}
