import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ success: false, error: "Support ticket ID is required" }, { status: 400 });
        }

        await prisma.support.update({
            where: { id },
            data: { status: "RESOLVED", updatedAt: new Date() },
        });

        return NextResponse.json({ success: true, message: "Support ticket resolved successfully" });
    } catch (error) {
        console.error("Resolve support ticket error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to resolve support ticket" },
            { status: 500 }
        );
    }
}