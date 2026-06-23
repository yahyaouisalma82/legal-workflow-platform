export type Field =
    | {
    id: string;
    type: "text";
    label: string;
}
    | {
    id: string;
    type: "select";
    label: string;
    options: string[];
};

export type Workflow = {
    id: string;
    name: string;
    fields: Field[];
    webhookUrl: string;
};