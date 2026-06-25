export type Theme = {
  primaryColor: string;
  borderRadius: string;
  fontSize: string;
};

type BaseField = {
  id: string;
  label: string;
};

export type TextField = BaseField & {
  type: "text";
};

export type EmailField = BaseField & {
  type: "email";
};

export type SelectField = BaseField & {
  type: "select";
  options: string[];
};

export type RadioField = BaseField & {
  type: "radio";
  options: string[];
};

export type Field = TextField | EmailField | SelectField | RadioField;

export type Workflow = {
  id: string;
  name: string;
  webhookUrl: string;
  allowedDomain: string;
  fields: Field[];
  theme: Theme;
  createdAt: string;
  webhookSecret: string;
};

export type PublicWorkflow = Omit<Workflow, "webhookSecret">;

export type FieldErrors = {
  name?: string;
  webhookUrl?: string;
  allowedDomain?: string;
  fields: Record<string, { label?: string; options?: string }>;
};
