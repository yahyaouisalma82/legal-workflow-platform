"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

import { Field, FieldErrors } from "@/features/workflows/types";
import { renderPreviewField } from "@/features/widget/rendererPreview";
import { workflowSchema } from "@/features/workflows/schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function WorkflowFormEditor({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [allowedDomain, setAllowedDomain] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<FieldErrors>({ fields: {} });

  const [theme, setTheme] = useState({
    primaryColor: "#000",
    borderRadius: "6px",
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

  /* ---------------- ACTIONS ---------------- */

  const addTextField = () =>
    setFields((p) => [
      ...p,
      { id: crypto.randomUUID(), type: "text", label: "" },
    ]);

  const addEmailField = () =>
    setFields((p) => [
      ...p,
      { id: crypto.randomUUID(), type: "email", label: "" },
    ]);

  const addSelectField = () =>
    setFields((p) => [
      ...p,
      { id: crypto.randomUUID(), type: "select", label: "", options: [] },
    ]);

  const addRadioField = () =>
    setFields((p) => [
      ...p,
      { id: crypto.randomUUID(), type: "radio", label: "", options: [] },
    ]);

  const updateLabel = (id: string, label: string) => {
    setFields((p) => p.map((f) => (f.id === id ? { ...f, label } : f)));
  };

  const deleteField = (id: string) => {
    setFields((p) => p.filter((f) => f.id !== id));
  };

  const updateSelectDraft = (id: string, value: string) => {
    setOptionDrafts((p) => ({ ...p, [id]: value }));
  };

  const commitSelectOptions = (id: string, value: string) => {
    const options = value
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    setFields((p) => p.map((f) => (f.id === id ? { ...f, options } : f)));

    setOptionDrafts((p) => {
      const copy = { ...p };
      delete copy[id];
      return copy;
    });
  };

  /* ---------------- VALIDATION ---------------- */

  function mapZodErrors(error: z.ZodError, fields: Field[]): FieldErrors {
    const result: FieldErrors = { fields: {} };

    for (const issue of error.issues) {
      const path = issue.path;

      if (path[0] === "name") result.name = issue.message;
      if (path[0] === "webhookUrl") result.webhookUrl = issue.message;
      if (path[0] === "allowedDomain") result.allowedDomain = issue.message;

      if (path[0] === "fields" && typeof path[1] === "number") {
        const field = fields[path[1]];
        if (!field) continue;

        if (!result.fields[field.id]) result.fields[field.id] = {};

        if (path[2] === "label") result.fields[field.id].label = issue.message;

        if (path[2] === "options")
          result.fields[field.id].options = issue.message;
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
      toast.error("Make sure all fields are correctly filled.");
      return;
    }

    const res = await fetch(`/api/workflows/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        webhookUrl,
        allowedDomain,
        fields,
        theme,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error ?? "Update failed");
      return;
    }

    toast.success("Workflow updated");
  };

  if (loading) return <div className="p-8">Loading...</div>;

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-muted/30 p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-semibold tracking-tight">Edit Workflow</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="space-y-6">
            {/* NAME */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Name</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My workflow"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </CardContent>
            </Card>

            {/* ACTIONS */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Fields</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={addTextField}>
                  Text
                </Button>
                <Button variant="outline" onClick={addEmailField}>
                  Email
                </Button>
                <Button variant="outline" onClick={addSelectField}>
                  Select
                </Button>
                <Button variant="outline" onClick={addRadioField}>
                  Radio
                </Button>
              </CardContent>
            </Card>

            {/* FIELDS */}
            <div className="space-y-4">
              {fields.map((field) => (
                <Card key={field.id}>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm uppercase text-muted-foreground">
                        {field.type}
                      </span>

                      <Button
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => deleteField(field.id)}
                      >
                        Delete
                      </Button>
                    </div>

                    <Input
                      value={field.label}
                      onChange={(e) => updateLabel(field.id, e.target.value)}
                      placeholder="Label"
                    />

                    {(field.type === "select" || field.type === "radio") && (
                      <Input
                        value={
                          optionDrafts[field.id] ??
                          (field.options || []).join(", ")
                        }
                        onChange={(e) =>
                          updateSelectDraft(field.id, e.target.value)
                        }
                        onBlur={(e) =>
                          commitSelectOptions(field.id, e.target.value)
                        }
                        placeholder="option1, option2"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* WEBHOOK */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Webhook</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://..."
                />
                {errors.webhookUrl && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.webhookUrl}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* DOMAIN */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Allowed Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={allowedDomain}
                  onChange={(e) => setAllowedDomain(e.target.value)}
                  placeholder="https://example.com"
                />
                {errors.allowedDomain && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.allowedDomain}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* THEME */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
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
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <input
                    type="range"
                    min="0"
                    max="24"
                    value={parseInt(theme.borderRadius)}
                    onChange={(e) =>
                      setTheme((t) => ({
                        ...t,
                        borderRadius: `${e.target.value}px`,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={updateWorkflow}>
              Update Workflow
            </Button>
          </div>

          {/* RIGHT */}
          <Card className="h-fit sticky top-10 ">
            <CardHeader>
              <CardTitle className={"text-lg"}>Live Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((f) => renderPreviewField(f, theme))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
