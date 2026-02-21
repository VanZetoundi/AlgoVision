import React, { useRef, useEffect } from "react";

export default function InputModal({ question, onSubmit }) {
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => onSubmit(inputRef.current?.value ?? "");

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff", borderRadius: 6, padding: "24px 28px",
        minWidth: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        border: "1px solid #e2e8f0",
      }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", marginBottom: 14 }}>
          Saisie de données
        </div>
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>
          {question}
        </div>
        <input
          ref={inputRef}
          type="text"
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{
            width: "100%", padding: "7px 10px",
            border: "1px solid #cbd5e1", borderRadius: 4,
            fontSize: 13, fontFamily: "monospace",
            outline: "none", color: "#1e293b", boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button
            onClick={submit}
            style={{
              background: "#2563eb", border: "none", color: "#fff",
              padding: "7px 20px", borderRadius: 4,
              fontWeight: 600, fontSize: 12, cursor: "pointer",
            }}
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}
