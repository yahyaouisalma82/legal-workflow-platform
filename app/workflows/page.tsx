"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

type Workflow = {
    id: string;
    name: string;
    webhookUrl?: string;
    fields?: unknown[];
};

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadWorkflows() {
            try {
                const snapshot = await getDocs(
                    collection(db, "workflows")
                );

                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Workflow[];

                setWorkflows(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadWorkflows();
    }, []);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-8">
                Loading workflows...
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">
                    Workflows
                </h1>

                <Link
                    href="/workflows/new"
                    className="border px-4 py-2 rounded"
                >
                    New Workflow
                </Link>
            </div>

            {workflows.length === 0 ? (
                <div className="border rounded p-6">
                    No workflows found.
                </div>
            ) : (
                <div className="space-y-4">
                    {workflows.map((workflow) => (
                        <div
                            key={workflow.id}
                            className="border rounded p-4"
                        >
                            <h2 className="text-lg font-semibold">
                                {workflow.name}
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                {workflow.fields?.length ?? 0} fields
                            </p>

                            {workflow.webhookUrl && (
                                <p className="text-sm text-gray-500 mt-1 truncate">
                                    {workflow.webhookUrl}
                                </p>
                            )}

                            <div className="flex gap-2 mt-4">
                                <Link
                                    href={`/embed/${workflow.id}`}
                                    className="border px-3 py-1 rounded"
                                >
                                    Open Widget
                                </Link>

                                <Link
                                    href={`/workflows/${workflow.id}/edit`}
                                    className="border px-3 py-1 rounded"
                                >
                                    Edit
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}