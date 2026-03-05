import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        console.log("Received grading results webhook:", payload);

        // Revalidate cache tags for the updated exam and students
        if (payload.exam_id) {
            revalidateTag(`exam-students-${payload.exam_id}`, "max");
            revalidateTag("exam-students", "max");
            revalidateTag("exams", "max");
        }

        return NextResponse.json({ message: "Webhook received successfully" });
    } catch (error) {
        console.error("Error processing webhook:", error);
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
}
