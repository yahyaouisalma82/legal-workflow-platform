import React from "react";

export type Theme = {
    primaryColor: string;
    borderRadius: string;
    fontSize: string;
};

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

export function renderField(field: Field, theme: Theme) {
    const baseStyle = {
        borderRadius: theme.borderRadius,
        fontSize: theme.fontSize,
        border: "1px solid #ddd",
        padding: "8px",
        width: "100%",
    };

    const labelStyle = {
        color: theme.primaryColor,
        fontSize: "12px",
        marginBottom: "4px",
        display: "block",
    };

    switch (field.type) {
        case "text":
            return (
                <div key={field.id}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                        style={baseStyle}
                        placeholder="Start typing"
                    />
                </div>
            );

        case "select":
            return (
                <div key={field.id}>
                    <label style={labelStyle}>{field.label}</label>
                    <select style={baseStyle}>
                        <option value="">Select...</option>
                        {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            );

        default:
            return null;
    }
}