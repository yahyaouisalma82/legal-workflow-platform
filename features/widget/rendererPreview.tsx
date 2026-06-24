import React from "react";
import { Theme, Field } from "@/features/workflows/types";

export function renderPreviewField(
    field: Field,
    theme: Theme
) {
    const baseStyle: React.CSSProperties = {
        borderRadius: theme.borderRadius,
        border: "1px solid #ddd",
        padding: "8px",
        width: "100%",
        fontSize: theme.fontSize,
    };

    const labelStyle: React.CSSProperties = {
        color: theme.primaryColor,
        fontSize: "12px",
        marginBottom: "4px",
        display: "block",
        fontWeight: 500,
    };

    switch (field.type) {
        case "text":
            return (
                <div key={field.id}>
                    <label style={labelStyle}>
                        {field.label}
                    </label>

                    <input
                        type="text"
                        style={baseStyle}
                        placeholder="Start typing"
                    />
                </div>
            );

        case "email":
            return (
                <div key={field.id}>
                    <label style={labelStyle}>
                        {field.label}
                    </label>

                    <input
                        type="email"
                        style={baseStyle}
                        placeholder="name@example.com"
                    />
                </div>
            );

        case "select":
            return (
                <div key={field.id}>
                    <label style={labelStyle}>
                        {field.label}
                    </label>

                    <select style={baseStyle}>
                        <option value="">
                            Select...
                        </option>

                        {field.options.map((opt) => (
                            <option
                                key={opt}
                                value={opt}
                            >
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
            );

        case "radio":
            return (
                <div key={field.id}>
                    <label style={labelStyle}>
                        {field.label}
                    </label>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            marginTop: "8px",
                        }}
                    >
                        {field.options.map((opt) => (
                            <label
                                key={opt}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <input
                                    type="radio"
                                    name={field.id}
                                />

                                <span>{opt}</span>
                            </label>
                        ))}
                    </div>
                </div>
            );

        default:
            return null;
    }
}