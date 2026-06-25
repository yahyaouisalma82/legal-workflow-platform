import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { submissionSchema } from "@/features/submissions/schema";
import { z } from "zod";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const result = submissionSchema.safeParse(body);
        console.dir( body,{ depth:null });
        console.dir( result,{ depth:null });
        if (!result.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    issues: z.treeifyError(result.error),
                },
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

        if (!workflow.webhookSecret) {
            return NextResponse.json(
                { error: "Workflow misconfigured" },
                { status: 500 }
            );
        }

        // 2. Origin check
        const origin = req.headers.get("origin");

        if (
            workflow.allowedDomain &&
            origin !== workflow.allowedDomain
        ) {
            return NextResponse.json(
                { error: "Unauthorized origin" },
                { status: 403 }
            );
        }

        // 3. Save submission
        await addDoc(collection(db, "submissions"), {
            workflowId,
            data,
            createdAt: new Date(),
        });

        // 4. Build payload
        const payload = JSON.stringify({
            workflowId,
            data,
        });

        // 5. Timestamp (anti-replay protection)
        const timestamp = Date.now().toString();

        // 6. Signature base string
        const signedContent = `${timestamp}.${payload}`;

        // 7. HMAC-SHA256 signature
        const signature = crypto
            .createHmac("sha256", workflow.webhookSecret)
            .update(signedContent)
            .digest("hex");

        // 8. Send webhook
        if (workflow.webhookUrl) {
            await fetch(workflow.webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Signature": signature,
                    "X-Timestamp": timestamp,
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