import { z } from "zod";

export const fieldSchema = z
  .object({
    id: z.string(),
    type: z.enum(["text", "email", "select", "radio"]),
    label: z.string().min(1, "Label is required"),
    options: z.array(z.string()).optional(),
  })
  .superRefine((field, ctx) => {
    if (
      (field.type === "select" || field.type === "radio") &&
      (!field.options || field.options.length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "At least one option required",
        path: ["options"],
      });
    }
  });

export const workflowSchema = z.object({
  name: z.string().trim().min(1, "Workflow name is required"),

  webhookUrl: z.url("Invalid webhook URL"),

  allowedDomain: z.url("Invalid allowed domain"),

  fields: z.array(fieldSchema).min(1, "At least one field is required"),

  theme: z.object({
    primaryColor: z.string(),
    borderRadius: z.string(),
    fontSize: z.string(),
  }),
});

export type WorkflowInput = z.infer<typeof workflowSchema>;
