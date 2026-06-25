import { z } from "zod";

export const submissionSchema = z.object({
  workflowId: z.string().min(1),
  data: z.record(z.string(), z.any()),
});
