import React from "react";
import { Theme, Field } from "@/features/workflows/types";

export function renderPreviewField(field: Field, theme: Theme) {
  const baseStyle: React.CSSProperties = {
    borderRadius: theme.borderRadius,
    border: "1px solid #ddd",
    padding: "8px",
    width: "100%",
    fontSize: "18px",
    textTransform: "capitalize",
  };

  const labelStyle: React.CSSProperties = {
    color: theme.primaryColor,
    fontSize: "18px",
    marginBottom: "4px",
    display: "block",
    fontWeight: 500,
    textTransform: "capitalize",
  };

  switch (field.type) {
    case "text":
      return (
        <div key={field.id}>
          <label style={labelStyle}>{field.label}</label>

          <input type="text" style={baseStyle} placeholder="Start typing" />
        </div>
      );

    case "email":
      return (
        <div key={field.id}>
          <label style={labelStyle}>{field.label}</label>

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
          <label style={labelStyle}>{field.label}</label>

          <select style={baseStyle}>
            <option value="" className={"text-lg"}>
              Select...
            </option>

            {field.options.map((opt) => (
              <option key={opt} value={opt} className={"text-lg"}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <div key={field.id}>
          <label style={labelStyle}>{field.label}</label>

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
                className={"text-lg"}
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <input type="radio" name={field.id} />

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
