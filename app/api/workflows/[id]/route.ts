import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { workflowSchema } from "@/features/workflows/schema";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const ref = doc(db, "workflows", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            return NextResponse.json(
                { error: "Workflow not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: snap.id,
            ...snap.data(),
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            { error: "Failed to fetch workflow" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const body = await req.json();

        const result = workflowSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    issues: result.error.flatten(),
                },
                { status: 400 }
            );
        }

        const ref = doc(db, "workflows", id);

        await updateDoc(ref, {
            ...result.data,
            updatedAt: serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            id  ,
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            { error: "Failed to update workflow" },
            { status: 500 }
        );
    }
}