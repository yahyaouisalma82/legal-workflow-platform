import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { submissionSchema } from "@/features/submissions/schema";
import crypto from "crypto";
import {z} from "zod";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const result = submissionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: z.treeifyError(result.error) },
                { status: 400 }
            );
        }

        const { workflowId, data } = result.data;

        // 1. Load workflow
        const ref = doc(db, "workflows", workflowId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
            return NextResponse.json(
                { error: "Workflow not found" },
                { status: 404 }
            );
        }

        const workflow = snap.data();

        // 2. Origin check
        const origin = req.headers.get("origin");
        console.log({ workflow, origin });
        if (workflow.allowedDomain && origin !== workflow.allowedDomain) {
            return NextResponse.json(
                { error: "Unauthorized origin" },
                { status: 403 }
            );
        }

        // 3. Save submission (optional)
        await addDoc(collection(db, "submissions"), {
            workflowId,
            data,
            createdAt: new Date(),
        });

        // 4. HMAC signature
        const payload = JSON.stringify({ workflowId, data });

        const signature = crypto
            .createHmac("sha256", workflow.webhookSecret || "default")
            .update(payload)
            .digest("hex");

        // 5. Send webhook
        if (workflow.webhookUrl) {
            await fetch(workflow.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-signature": signature,
                },
                body: payload,
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Failed" },
            { status: 500 }
        );
    }
}