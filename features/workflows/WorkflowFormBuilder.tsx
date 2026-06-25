"use client";

import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Field, FieldErrors } from "@/features/workflows/types";
import { renderPreviewField } from "@/features/widget/rendererPreview";
import { workflowSchema } from "@/features/workflows/schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function WorkflowFormBuilder() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [allowedDomain, setAllowedDomain] = useState("");

  const [fields, setFields] = useState<Field[]>([]);
  const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});

  const [theme, setTheme] = useState({
    primaryColor: "#000",
    borderRadius: "6px",
  });

  const [errors, setErrors] = useState<FieldErrors>({ fields: {} });
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  /* ---------------- FIELD ACTIONS (UNCHANGED) ---------------- */

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

  /* ---------------- VALIDATION (UNCHANGED) ---------------- */

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

        const id = field.id;
        if (!result.fields[id]) result.fields[id] = {};

        if (path[2] === "label") result.fields[id].label = issue.message;
        if (path[2] === "options") result.fields[id].options = issue.message;
      }
    }

    return result;
  }

  const validate = () => {
    const res = workflowSchema.safeParse({
      name,
      webhookUrl,
      allowedDomain,
      fields,
      theme,
    });

    if (!res.success) {
      setErrors(mapZodErrors(res.error, fields));
      return false;
    }

    setErrors({ fields: {} });
    return true;
  };

  const saveWorkflow = async () => {
    if (!validate()) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
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
        toast.error(data.error ?? "Save failed");
        return;
      }

      setCreatedSecret(data.webhookSecret);
      toast.success("Workflow saved");
    } catch {
      toast.error("Request failed");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-muted/30 p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Create Workflow
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div className="space-y-6">
            {/* NAME */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow Name</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My workflow"
                />
                {errors.name && (
                  <p className="text-lg text-red-500">{errors.name}</p>
                )}
              </CardContent>
            </Card>

            {/* ADD FIELDS */}
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
                  <CardContent className=" space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg uppercase text-muted-foreground">
                        {field.type}
                      </span>

                      <Button
                        variant="ghost"
                        className={"text-red-500 hover:text-red-700"}
                        size="lg"
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
              <CardContent className="space-y-2">
                <Input
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://..."
                />
                {errors.webhookUrl && (
                  <p className="text-lg text-red-500">{errors.webhookUrl}</p>
                )}
              </CardContent>
            </Card>

            {/* DOMAIN */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Allowed Domain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  value={allowedDomain}
                  onChange={(e) => setAllowedDomain(e.target.value)}
                  placeholder="https://example.com"
                />
                {errors.allowedDomain && (
                  <p className="text-lg text-red-500">{errors.allowedDomain}</p>
                )}
              </CardContent>
            </Card>
            {/* THEME */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Theme</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Primary color */}
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
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
                    <span className="text-lg text-muted-foreground">
                      {theme.primaryColor}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Border radius */}
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
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
            {/* SAVE */}
            <Button
              className="w-full"
              disabled={fields.length === 0}
              onClick={saveWorkflow}
            >
              Save Workflow
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

      {/* DIALOG */}
      <Dialog open={!!createdSecret} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook Secret</DialogTitle>
            <DialogDescription>
              Store this safely. It will not be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-muted rounded-md font-mono text-lg break-all">
            {createdSecret}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={async () => {
                await navigator.clipboard.writeText(createdSecret as string);
                toast.success("Copied");
              }}
            >
              Copy
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                setCreatedSecret(null);
                router.push("/workflows");
              }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
