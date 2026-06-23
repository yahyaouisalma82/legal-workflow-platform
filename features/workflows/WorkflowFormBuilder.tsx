"use client";

import { useState } from "react";
import { Field } from "@/features/workflows/types";
import { renderField } from "@/features/widget/renderer";

export default function WorkflowFormBuilder() {
    const [name, setName] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");

    const [fields, setFields] = useState<Field[]>([]);

    const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});
    const [theme, setTheme] = useState({
        primaryColor: "#000",
        borderRadius: "6px",
        fontSize: "14px",
    });
    const addTextField = () => {
        setFields((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                type: "text",
                label: "",
            },
        ]);
    };

    const addSelectField = () => {
        setFields((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                type: "select",
                label: "",
                options: [],
            },
        ]);
    };

    const updateLabel = (id: string, label: string) => {
        setFields((prev) =>
            prev.map((field) =>
                field.id === id ? { ...field, label } : field
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
            prev.map((field) =>
                field.id === id ? { ...field, options } : field
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

        setOptionDrafts((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
        });
    };

    const saveWorkflow = async () => {
        const res = await fetch("/api/workflows", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                fields,
                webhookUrl,
            }),
        });

        const data = await res.json();

        if (data.success) {
            alert("Saved: " + data.id);
        } else {
            alert("Save failed");
        }
    };

    return (
        <div className="w-full mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">
                Create Workflow
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* LEFT SIDE (Builder) */}
                <div>
                    {/* name */}
                    <div className="mb-4">
                        <label className="block mb-2">Workflow Name</label>
                        <input
                            className="border p-2 w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Create Company"
                        />
                    </div>

                    {/* buttons */}
                    <div className="flex gap-2 mb-6">
                        <button
                            className="border px-4 py-2"
                            onClick={addTextField}
                        >
                            Add Text Field
                        </button>

                        <button
                            className="border px-4 py-2"
                            onClick={addSelectField}
                        >
                            Add Select Field
                        </button>
                    </div>

                    {/* fields */}
                    <div className="space-y-4 mb-6">
                        {fields.map((field) => (
                            <div key={field.id} className="border p-4 rounded">
                                <div className="mb-2">
                                    Type: {field.type}
                                </div>

                                <input
                                    className="border p-2 w-full"
                                    value={field.label}
                                    onChange={(e) =>
                                        updateLabel(field.id, e.target.value)
                                    }
                                    placeholder="Field label"
                                />

                                {field.type === "select" && (
                                    <input
                                        className="border p-2 w-full mt-2"
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
                                        placeholder="Option1, Option2"
                                    />
                                )}

                                <button
                                    className="mt-2 border px-3 py-1"
                                    onClick={() => deleteField(field.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* webhook */}
                    <div className="mb-4">
                        <label className="block mb-2">
                            Webhook URL
                        </label>

                        <input
                            className="border p-2 w-full"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="mb-6 space-y-2">
                        <h2 className="font-semibold">Theme</h2>

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
                    {/* save */}
                    <button
                        className="mt-4 px-4 py-2 bg-black text-white"
                        onClick={saveWorkflow}
                    >
                        Save Workflow
                    </button>
                </div>

                {/* RIGHT SIDE (Preview) */}
                <div className="border p-4 rounded h-fit lg:sticky lg:top-8">
                    <h2 className="text-xl font-semibold mb-4">
                        Live Preview
                    </h2>

                    <div className="space-y-3">
                        {fields.map((field) => renderField(field, theme))}                    </div>
                </div>

            </div>
        </div>
    );
}