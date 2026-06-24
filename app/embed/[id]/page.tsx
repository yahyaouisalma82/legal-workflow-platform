"use client";

import { use, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Workflow } from "@/features/workflows/types";
import { renderRuntimeField } from "@/features/widget/runtimeRenderer";
import {useParams} from "next/navigation";


export default function EmbedPage() {
    const params = useParams();
    const id = params.id as string;

    const [workflow, setWorkflow] = useState<Workflow | null>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState<Record<string, string>>({});

    useEffect(() => {
        async function load() {
            const ref = doc(db, "workflows", id);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                setWorkflow({
                    id: snap.id,
                    ...snap.data(),
                } as Workflow);
            }

            setLoading(false);
        }

        load();
    }, [id]);

    const updateField = (fieldId: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!workflow) return;

        await fetch("/api/submissions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                workflowId: workflow.id,
                data: formData,
                webhookUrl: workflow.webhookUrl,
            }),
        });

        alert("Submitted successfully");
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!workflow) return <div className="p-8">Not found</div>;

    return (
        <div className="max-w-xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">
                {workflow.name}
            </h1>

            <form onSubmit={submit} className="space-y-4">
                {workflow.fields.map((field) =>
                    renderRuntimeField({
                        field,
                        theme: workflow.theme,
                        value: formData[field.id] ?? "",
                        onChange: (val) =>
                            updateField(field.id, val),
                    })
                )}

                <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded"
                >
                    Submit
                </button>
            </form>
        </div>
    );
}