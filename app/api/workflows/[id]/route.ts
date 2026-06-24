import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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
}