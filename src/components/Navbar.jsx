import React, { useState } from "react";

const btnBase = {
  padding: "3px 10px", fontSize: 12,
  border: "1px solid #e2e8f0", borderRadius: 3,
  background: "#f8fafc", color: "#374151", cursor: "pointer",
};

export default function Navbar({
  algoName, onRename,
  running, stepping,
  onRun, onStartStep, onNextStep, onStop,
  onUndo, onRedo, onReset,
  onSave, onLoad,
  executionDelay, onDelayChange,
  onSuggestions,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(algoName);

  const commitRename = () => {
    setEditing(false);
    if (draft.trim()) onRename(draft.trim());
  };

  return (
    <header style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "0 14px", height: 46,
      background: "#fff", borderBottom: "1px solid #e2e8f0",
      flexShrink: 0, flexWrap: "wrap",
    }}>
      {/* Marque */}
      <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", letterSpacing: "-0.02em", marginRight: 4 }}>
        AlgoVision
      </span>

      {/* Fichier */}
      <button style={btnBase} onClick={onSave}>Enregistrer</button>
      <button style={btnBase} onClick={onLoad}>Ouvrir</button>

      <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

      {/* Nom algo */}
      <span style={{ fontSize: 11, color: "#94a3b8" }}>Algo :</span>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setEditing(false); }}
          style={{
            fontSize: 13, fontWeight: 600,
            border: "1px solid #2563eb", borderRadius: 3,
            padding: "2px 6px", outline: "none",
            color: "#1e293b", fontFamily: "monospace",
          }}
        />
      ) : (
        <span
          onDoubleClick={() => { setDraft(algoName); setEditing(true); }}
          title="Double-cliquer pour renommer"
          style={{
            fontSize: 13, fontWeight: 600, color: "#1e293b",
            fontFamily: "monospace", cursor: "text",
            borderBottom: "1px dashed #cbd5e1", paddingBottom: 1,
          }}
        >
          {algoName}
        </span>
      )}

      <div style={{ flex: 1 }} />

      {/* Édition */}
      <button style={btnBase} onClick={onUndo}>Annuler</button>
      <button style={btnBase} onClick={onRedo}>Rétablir</button>
      <button style={btnBase} onClick={onReset}>Vider</button>

      <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

      {/* Vitesse (masquée en mode pas à pas) */}
      {!stepping && (
        <>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Vitesse</span>
          <input
            type="range" min={100} max={2000} step={100}
            value={executionDelay}
            onChange={(e) => onDelayChange(Number(e.target.value))}
            style={{ width: 70, accentColor: "#2563eb" }}
          />
          <span style={{ fontSize: 11, color: "#64748b", width: 45 }}>{executionDelay} ms</span>
          <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />
        </>
      )}

      {/* Boutons d'exécution */}
      {!running && (
        <>
          <button
            onClick={onRun}
            style={{
              padding: "5px 14px", fontSize: 12, fontWeight: 700,
              border: "none", borderRadius: 4,
              background: "#2563eb", color: "#fff", cursor: "pointer",
            }}
          >
            Exécuter
          </button>
          <button
            onClick={onStartStep}
            style={{
              padding: "5px 14px", fontSize: 12, fontWeight: 600,
              border: "1px solid #2563eb", borderRadius: 4,
              background: "#fff", color: "#2563eb", cursor: "pointer",
            }}
          >
            Pas à pas
          </button>
        </>
      )}

      {running && stepping && (
        <>
          <button
            onClick={onNextStep}
            style={{
              padding: "5px 14px", fontSize: 12, fontWeight: 700,
              border: "none", borderRadius: 4,
              background: "#15803d", color: "#fff", cursor: "pointer",
            }}
          >
            Pas suivant
          </button>
          <button
            onClick={onStop}
            style={{
              padding: "5px 14px", fontSize: 12, fontWeight: 600,
              border: "1px solid #dc2626", borderRadius: 4,
              background: "#fff", color: "#dc2626", cursor: "pointer",
            }}
          >
            Arrêter
          </button>
        </>
      )}

      {running && !stepping && (
        <button
          onClick={onStop}
          style={{
            padding: "5px 14px", fontSize: 12, fontWeight: 700,
            border: "none", borderRadius: 4,
            background: "#dc2626", color: "#fff", cursor: "pointer",
          }}
        >
          Arrêter
        </button>
      )}

      <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />

      {/* Suggestions */}
      <button
        onClick={onSuggestions}
        style={{
          ...btnBase,
          color: "#2563eb", borderColor: "#bfdbfe",
        }}
      >
        Suggestions
      </button>
    </header>
  );
}