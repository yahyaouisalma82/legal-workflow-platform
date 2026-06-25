import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { workflowSchema } from "@/features/workflows/schema";
import {z} from "zod";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const result =
            workflowSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    issues: z.treeifyError(result.error),
                },
                {
                    status: 400,
                }
            );
        }

        const workflow = result.data;

        // generate secret
        const webhookSecret = crypto.randomUUID();

        const docRef = await addDoc(collection(db, "workflows"), {
            ...workflow,
            webhookSecret,
            createdAt: serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            id: docRef.id,
            webhookSecret,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error:
                    "Failed to save workflow",
            },
            {
                status: 500,
            }
        );
    }
}