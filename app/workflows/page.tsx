"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";
import { Workflow } from "@/features/workflows/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const snapshot = await getDocs(collection(db, "workflows"));

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
      <div className="min-h-screen bg-muted/30 p-10">
        <div className="max-w-5xl mx-auto">Loading workflows...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Workflows</h1>

          <Button asChild>
            <Link href="/workflows/new">New Workflow</Link>
          </Button>
        </div>

        {/* EMPTY */}
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-muted-foreground text-2xl">
              No workflows found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {workflow.fields?.length ?? 0} fields
                  </p>

                  {workflow.webhookUrl && (
                    <p className="text-sm text-muted-foreground truncate">
                      {workflow.webhookUrl}
                    </p>
                  )}

                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" asChild>
                      <Link href={`/workflows/${workflow.id}`}>
                        View Workflow
                      </Link>
                    </Button>

                    <Button variant="outline" asChild>
                      <Link href={`/workflows/${workflow.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
