import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log(JSON.stringify(body));
        const { name, fields, webhookUrl } = body;

        if (!name || !fields || !webhookUrl) {
            return NextResponse.json(
                { error: "Missing name or fields" },
                { status: 400 }
            );
        }

        const docRef = await addDoc(collection(db, "workflows"), {
            name,
            fields,
            webhookUrl,
            createdAt: serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            id: docRef.id,
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Failed to save workflow" },
            { status: 500 }
        );
    }
}