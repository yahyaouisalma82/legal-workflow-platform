"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Field, FieldErrors } from "@/features/workflows/types";
import { renderPreviewField } from "@/features/widget/rendererPreview";
import { workflowSchema } from "@/features/workflows/schema";
import { toast } from "sonner";

export default function WorkflowFormEditor({ id }: { id: string }) {
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [allowedDomain, setAllowedDomain] =
        useState("");
    const [fields, setFields] = useState<Field[]>([]);
    const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>(
        {}
    );

    const [errors, setErrors] = useState<FieldErrors>({ fields: {} });

    const [theme, setTheme] = useState({
        primaryColor: "#000",
        borderRadius: "6px",
        fontSize: "14px",
    });

    /* ---------------- LOAD ---------------- */

    useEffect(() => {
        const load = async () => {
            const res = await fetch(`/api/workflows/${id}`);
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error ?? "Failed to load workflow");
                return;
            }

            setName(data.name);
            setWebhookUrl(data.webhookUrl);
            setAllowedDomain(data.allowedDomain);
            setFields(data.fields);
            setTheme(data.theme ?? theme);

            setLoading(false);
        };

        load();
    }, [id]);

    /* ---------------- FIELD ACTIONS (SAME AS CREATE) ---------------- */

    const addTextField = () =>
        setFields((prev) => [
            ...prev,
            { id: crypto.randomUUID(), type: "text", label: "" },
        ]);

    const addSelectField = () =>
        setFields((prev) => [
            ...prev,
            { id: crypto.randomUUID(), type: "select", label: "", options: [] },
        ]);

    const addEmailField = () =>
        setFields((prev) => [
            ...prev,
            { id: crypto.randomUUID(), type: "email", label: "" },
        ]);

    const addRadioField = () =>
        setFields((prev) => [
            ...prev,
            { id: crypto.randomUUID(), type: "radio", label: "", options: [] },
        ]);

    const updateLabel = (id: string, label: string) => {
        setFields((prev) =>
            prev.map((f) => (f.id === id ? { ...f, label } : f))
        );
    };

    const updateSelectDraft = (id: string, value: string) => {
        setOptionDrafts((prev) => ({ ...prev, [id]: value }));
    };

    const commitSelectOptions = (id: string, value: string) => {
        const options = value
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);

        setFields((prev) =>
            prev.map((f) => (f.id === id ? { ...f, options } : f))
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

    /* ---------------- VALIDATION (UNCHANGED) ---------------- */

    function mapZodErrors(error: z.ZodError, fields: Field[]): FieldErrors {
        const result: FieldErrors = { fields: {} };

        for (const issue of error.issues) {
            const path = issue.path;

            if (path[0] === "name") result.name = issue.message;
            if (path[0] === "webhookUrl")
                result.webhookUrl = issue.message;
            if (path[0] === "allowedDomain") {
                result.allowedDomain = issue.message;
            }
            if (path[0] === "fields" && typeof path[1] === "number") {
                const field = fields[path[1]];
                if (!field) continue;

                if (!result.fields[field.id]) {
                    result.fields[field.id] = {};
                }

                if (path[2] === "label") {
                    result.fields[field.id].label = issue.message;
                }

                if (path[2] === "options") {
                    result.fields[field.id].options = issue.message;
                }
            }
        }

        return result;
    }

    const validate = () => {
        const result = workflowSchema.safeParse({
            name,
            webhookUrl,
            allowedDomain,
            fields,
            theme,
        });

        if (!result.success) {
            setErrors(mapZodErrors(result.error, fields));
            return false;
        }

        setErrors({ fields: {} });
        return true;
    };

    /* ---------------- UPDATE ---------------- */

    const updateWorkflow = async () => {
        if (!validate()) {
            toast.error("Fix validation errors");
            return;
        }

        const res = await fetch(`/api/workflows/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                webhookUrl,
                allowedDomain,
                fields,
                theme,
            }),
        });

        const data = await res.json();
        console.log(     {res})
        if (!res.ok) {
            toast.error(data.error ?? "Update failed");
            return;
        }

        toast.success("Workflow updated");
    };

    if (loading) return <div className="p-8">Loading...</div>;

    /* ---------------- UI (IDENTICAL TO CREATE) ---------------- */

    return (
        <div className="w-full mx-auto p-8">
            <h1 className="text-3xl font-bold mb-6">Edit Workflow</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT SIDE */}
                <div>
                    {/* NAME */}
                    <div className="mb-4">
                        <label className="block mb-2">
                            Workflow Name *
                        </label>

                        <input
                            className="border p-2 w-full"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            className="border px-4 py-2"
                            onClick={addTextField}
                        >
                            Add Text Field
                        </button>

                        <button
                            className="border px-4 py-2"
                            onClick={addEmailField}
                        >
                            Add Email Field
                        </button>

                        <button
                            className="border px-4 py-2"
                            onClick={addSelectField}
                        >
                            Add Select Field
                        </button>

                        <button
                            className="border px-4 py-2"
                            onClick={addRadioField}
                        >
                            Add Radio Field
                        </button>
                    </div>

                    {/* FIELDS */}
                    <div className="space-y-4 mb-6">
                        {fields.map((field) => (
                            <div key={field.id} className="border p-4 rounded">
                                <div className="text-sm text-gray-600 mb-2 capitalize">
                                    Type: {field.type}
                                </div>

                                <input
                                    className="border p-2 w-full"
                                    value={field.label}
                                    onChange={(e) =>
                                        updateLabel(field.id, e.target.value)
                                    }
                                    placeholder="Field label *"
                                />

                                {(field.type === "select" ||
                                    field.type === "radio") && (
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
                                        placeholder="Option1, Option2 *"
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

                    {/* WEBHOOK */}
                    <div className="mb-4">
                        <label className="block mb-2">
                            Webhook URL *
                        </label>

                        <input
                            className="border p-2 w-full"
                            value={webhookUrl}
                            onChange={(e) =>
                                setWebhookUrl(e.target.value)
                            }
                        />

                        {errors.webhookUrl && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.webhookUrl}
                            </p>
                        )}
                    </div>

                    {/* ALLOWED DOMAIN */}
                    <div className="mb-4">
                        <label className="block mb-2">
                            Allowed Domain *
                        </label>

                        <input
                            className="border p-2 w-full"
                            placeholder="https://lawfirm.com"
                            value={allowedDomain}
                            onChange={(e) => setAllowedDomain(e.target.value)}
                        />

                        {errors.allowedDomain && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.allowedDomain}
                            </p>
                        )}
                    </div>
                    {/* THEME */}
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

                    {/* SAVE */}
                    <button
                        onClick={updateWorkflow}
                        className="mt-4 px-4 py-2 text-white bg-black"
                    >
                        Update Workflow
                    </button>
                </div>

                {/* RIGHT SIDE */}
                <div className="border p-4 rounded h-fit lg:sticky lg:top-8">
                    <h2 className="text-xl font-semibold mb-4">
                        Live Preview
                    </h2>

                    <div className="space-y-3">
                        {fields.map((field) =>
                            renderPreviewField(field, theme)
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}