"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

import { db } from "@/lib/firebase";
import { PublicWorkflow } from "@/features/workflows/types";
import { renderRuntimeField } from "@/features/widget/runtimeRenderer";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmbedPage() {
  const params = useParams();
  const id = params.id as string;

  const [workflow, setWorkflow] = useState<PublicWorkflow | null>(null);
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
        } as PublicWorkflow);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 p-10">
        <div className="max-w-xl mx-auto">Loading...</div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-muted/30 p-10">
        <div className="max-w-xl mx-auto">Not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-10">
      <div className="max-w-xl mx-auto space-y-6">
        {/* HEADER */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{workflow.name}</CardTitle>
          </CardHeader>
        </Card>

        {/* FORM */}
        <Card>
          <CardContent className="">
            <form className="space-y-4">
              {workflow.fields.map((field) =>
                renderRuntimeField({
                  field,
                  theme: workflow.theme,
                  value: formData[field.id] ?? "",
                  onChange: (val) => updateField(field.id, val),
                }),
              )}

              <Button
                type="submit"
                disabled={true}
                size={"lg"}
                className="w-full cursor-not-allowed"
              >
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
