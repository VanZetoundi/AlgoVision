import React from "react";

export function FieldInput({ value, onChange, placeholder, width = 90 }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      style={{
        width,
        padding: "2px 6px",
        border: "1px solid #cbd5e1",
        borderRadius: 3,
        fontSize: 12,
        fontFamily: "monospace",
        background: "#fff",
        color: "#1e293b",
        outline: "none",
      }}
    />
  );
}

export function FieldSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      style={{
        padding: "2px 4px",
        border: "1px solid #cbd5e1",
        borderRadius: 3,
        fontSize: 12,
        background: "#fff",
        color: "#1e293b",
        outline: "none",
        cursor: "pointer",
      }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "#94a3b8",
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}
