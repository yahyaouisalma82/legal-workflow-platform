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

          <input
            type="text"
            style={baseStyle}
            value={value}
            placeholder="Start typing..."
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    case "email":
      return (
        <div key={field.id}>
          <label style={labelStyle}>{field.label}</label>

          <input
            type="email"
            style={baseStyle}
            value={value}
            placeholder="name@example.com"
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
                <input
                  type="radio"
                  name={field.id}
                  checked={value === opt}
                  onChange={() => onChange(opt)}
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
