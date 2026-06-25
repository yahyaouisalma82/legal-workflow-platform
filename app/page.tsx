"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col gap-2 items-center justify-center  mx-auto">
      <div className="max-w-6xl mx-auto  space-y-12  flex flex-col gap-4   ">
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Workflow Builder
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create embeddable forms, collect submissions, and trigger your
            workflows through secure webhooks.
          </p>

          <div className="flex justify-center gap-3">
            <Button asChild className={"text-md"} size="lg">
              <Link href="/workflows/new">Create Workflow</Link>
            </Button>

            <Button
              className={"text-md border-b"}
              variant="outline"
              size="lg"
              asChild
            >
              <Link href="/workflows">View Workflows</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="grid gap-6 md:grid-cols-3 ">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Visual Builder</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-lg">
              Create dynamic forms with text, email, select, and radio inputs.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={"text-lg"}>Embed Anywhere</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-lg">
              Add the widget to any website with a simple embed.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={"text-lg"}>Webhook Delivery</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-lg">
              Receive submissions securely in your own systems.
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <h2 className="text-2xl font-semibold">
              Ready to create your first workflow?
            </h2>

            <Button asChild size="lg">
              <Link href="/workflows/new">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
