import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { workflowId, data, webhookUrl } = body;

        if (!workflowId || !data) {
            return NextResponse.json(
                { error: "Missing data" },
                { status: 400 }
            );
        }

        // 1. Save submission (optional but expected)
        console.log("Submission:", body);

        // 2. Send webhook if exists
        if (webhookUrl) {
            await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workflowId,
                    data,
                }),
            });
        }

        return NextResponse.json({
            success: true,
        });
    } catch (err) {
        console.log(          {err})
        return NextResponse.json(
            { error: "Failed" },
            { status: 500 }
        );
    }
}