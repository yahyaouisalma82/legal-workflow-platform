"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Field } from "@/features/workflows/types";
import { renderPreviewField } from "@/features/widget/rendererPreview";

export default function EditWorkflowPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [name, setName] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [fields, setFields] = useState<Field[]>([]);
    const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});

    const [theme, setTheme] = useState({
        primaryColor: "#000",
        borderRadius: "6px",
        fontSize: "14px",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const ref = doc(db, "workflows", id);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data();

                setName(data.name || "");
                setWebhookUrl(data.webhookUrl || "");
                setFields(data.fields || []);
                setTheme(data.theme || theme);
            }

            setLoading(false);
        }

        load();
    }, [id]);

    // FIELD UPDATES
    const updateLabel = (fieldId: string, label: string) => {
        setFields((prev) =>
            prev.map((f) =>
                f.id === fieldId ? { ...f, label } : f
            )
        );
    };

    const updateSelectDraft = (id: string, value: string) => {
        setOptionDrafts((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const commitSelectOptions = (id: string, value: string) => {
        const options = value
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);

        setFields((prev) =>
            prev.map((f) =>
                f.id === id ? { ...f, options } : f
            )
        );

        setOptionDrafts((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    };

    const deleteField = (id: string) => {
        setFields((prev) => prev.filter((f) => f.id !== id));
    };

    const save = async () => {
        await updateDoc(doc(db, "workflows", id), {
            name,
            webhookUrl,
            fields,
            theme,
        });

        router.push("/workflows");
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="w-full mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">
                Edit Workflow
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT SIDE */}
                <div>
                    {/* name */}
                    <div className="mb-4">
                        <label className="block mb-1">Workflow Name</label>
                        <input
                            className="border p-2 w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* webhook */}
                    <div className="mb-4">
                        <label className="block mb-1">Webhook URL</label>
                        <input
                            className="border p-2 w-full"
                            value={webhookUrl}
                            onChange={(e) =>
                                setWebhookUrl(e.target.value)
                            }
                        />
                    </div>

                    {/* fields */}
                    <div className="space-y-4 mb-6">
                        <label className="block font-semibold">
                            Fields
                        </label>

                        {fields.map((field) => (
                            <div
                                key={field.id}
                                className="border p-4 rounded"
                            >
                                {/* TYPE */}
                                <div className="text-xs mb-2">
                                    Type: {field.type}
                                </div>

                                {/* LABEL */}
                                <label className="block text-xs mb-1">
                                    Label
                                </label>

                                <input
                                    className="border p-2 w-full mb-2"
                                    value={field.label}
                                    onChange={(e) =>
                                        updateLabel(
                                            field.id,
                                            e.target.value
                                        )
                                    }
                                />

                                {/* OPTIONS */}
                                {field.type === "select" && (
                                    <>
                                        <label className="block text-xs mb-1">
                                            Options (comma separated)
                                        </label>

                                        <input
                                            className="border p-2 w-full"
                                            value={
                                                optionDrafts[field.id] ??
                                                (field.options || []).join(", ")
                                            }
                                            onChange={(e) =>
                                                updateSelectDraft(
                                                    field.id,
                                                    e.target.value
                                                )
                                            }
                                            onBlur={(e) =>
                                                commitSelectOptions(
                                                    field.id,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </>
                                )}

                                {/* DELETE */}
                                <button
                                    className="mt-3 text-red-600 text-sm"
                                    onClick={() =>
                                        deleteField(field.id)
                                    }
                                >
                                    Delete field
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* theme */}
                    <div className="mb-6 space-y-2">
                        <label className="block font-semibold">
                            Theme
                        </label>

                        <input
                            type="color"
                            value={theme.primaryColor}
                            onChange={(e) =>
                                setTheme((t) => ({
                                    ...t,
                                    primaryColor: e.target.value,
                                }))
                            }
                        />

                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={parseInt(theme.borderRadius)}
                            onChange={(e) =>
                                setTheme((t) => ({
                                    ...t,
                                    borderRadius: `${e.target.value}px`,
                                }))
                            }
                        />
                    </div>

                    {/* SAVE */}
                    <button
                        className="px-4 py-2 bg-black text-white"
                        onClick={save}
                    >
                        Save Changes
                    </button>
                </div>

                {/* RIGHT SIDE */}
                <div className="border p-4 rounded h-fit lg:sticky lg:top-8">
                    <h2 className="font-semibold mb-4">
                        Live Preview
                    </h2>

                    <div className="space-y-3">
                        {fields.map((f) =>
                            renderPreviewField(f, theme)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}