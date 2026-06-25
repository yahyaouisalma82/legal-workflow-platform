import WorkflowFormEditor from "@/features/workflows/WorkflowFormEditor";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return <WorkflowFormEditor id={id} />;
}
