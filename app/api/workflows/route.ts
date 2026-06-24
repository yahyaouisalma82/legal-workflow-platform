import { NextResponse } from "next/server";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { workflowSchema } from "@/features/workflows/schema";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const result =
            workflowSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    issues: result.error.flatten(),
                },
                {
                    status: 400,
                }
            );
        }

        const workflow = result.data;

        const docRef = await addDoc(
            collection(db, "workflows"),
            {
                name: workflow.name,
                fields: workflow.fields,
                webhookUrl:
                workflow.webhookUrl,
                theme: workflow.theme,
                createdAt: serverTimestamp(),
            }
        );


        return NextResponse.json({
            success: true,
            id: docRef.id,
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