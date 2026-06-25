import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { workflowSchema } from "@/features/workflows/schema";
import { z } from "zod";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const ref = doc(db, "workflows", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 },
      );
    }
    const workflow = snap.data();

    const { webhookSecret: _webhookSecret, ...safeData } = workflow;

    return NextResponse.json({
      id: snap.id,
      ...safeData,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const body = await req.json();

    const result = workflowSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: z.treeifyError(result.error),
        },
        { status: 400 },
      );
    }

    const ref = doc(db, "workflows", id);

    await updateDoc(ref, {
      ...result.data,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      id,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update workflow" },
      { status: 500 },
    );
  }
}
