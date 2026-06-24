import React from "react";
import { Field, Theme } from "@/features/workflows/types";

type RuntimeProps = {
    field: Field;
    theme: Theme;
    value: string;
    onChange: (value: string) => void;
};

export function renderRuntimeField({
                                       field,
                                       theme,
                                       value,
                                       onChange,
                                   }: RuntimeProps) {
    const baseStyle: React.CSSProperties = {
        borderRadius: theme.borderRadius,
        fontSize: theme.fontSize,
        border: "1px solid #ddd",
        padding: "8px",
        width: "100%",
    };

    const labelStyle: React.CSSProperties = {
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
                        value={value}
                        placeholder="Start typing..."
                        onChange={(e) => onChange(e.target.value)}
                    />
                </div>
            );

        case "select":
            return (
                <div key={field.id}>
                    <label style={labelStyle}>{field.label}</label>

                    <select
                        style={baseStyle}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                    >
                        <option value="">Select...</option>

                        {field.options?.map((opt) => (
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