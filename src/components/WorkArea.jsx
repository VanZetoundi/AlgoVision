import React, { useState, useRef } from "react";
import BlockEditor from "./BlockEditor.jsx";
import { TYPE_COLORS } from "../constants/index.js";
import { createBlock } from "../utils/index.js";

export function extractDeclaredVars(blocks) {
  const vars = [];
  for (const b of blocks) {
    if (b.type === "declare" && b.props.name?.trim()) {
      vars.push({ name: b.props.name.trim(), dataType: b.props.dataType });
    }
    if (b.props?.thenBlocks) vars.push(...extractDeclaredVars(b.props.thenBlocks));
    if (b.props?.elseBlocks) vars.push(...extractDeclaredVars(b.props.elseBlocks));
    if (b.props?.body)       vars.push(...extractDeclaredVars(b.props.body));
  }
  return vars;
}

export default function WorkArea({ algoName, blocks, activeBlockId, onAdd, onChange, onDelete, onReorder }) {
  const [dropOver, setDropOver]       = useState(false);
  const [dragIndex, setDragIndex]     = useState(null);
  const [dropIndex, setDropIndex]     = useState(null);
  const dragNodeRef                   = useRef(null);

  const declaredVars = extractDeclaredVars(blocks);

  // ── Réordonnancement des blocs ──────────────────────────────────────────
  const handleBlockDragStart = (e, index) => {
    e.stopPropagation();
    setDragIndex(index);
    dragNodeRef.current = e.currentTarget;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("blockMove", String(index));
  };

  const handleBlockDragOver = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("blockmove")) {
      setDropIndex(index);
    }
  };

  const handleBlockDrop = (e, targetIndex) => {
    e.preventDefault();
    e.stopPropagation();
    const raw = e.dataTransfer.getData("blockMove");
    if (raw !== "" && raw !== null) {
      const fromIndex = parseInt(raw, 10);
      if (!isNaN(fromIndex) && fromIndex !== targetIndex) {
        onReorder(fromIndex, targetIndex);
      }
    }
    setDragIndex(null);
    setDropIndex(null);
  };

  const handleBlockDragEnd = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  return (
    <main
      style={{
        flex: 1, display: "flex", flexDirection: "column",
        overflowY: "auto",
        background: dropOver ? "#f0f9ff" : "#f1f5f9",
        transition: "background 0.15s",
      }}
      onDragOver={(e) => {
        // Seulement si c'est un nouveau bloc depuis la toolbox
        if (e.dataTransfer.types.includes("blocktemplate")) {
          e.preventDefault();
          setDropOver(true);
        }
      }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDropOver(false); }}
      onDrop={(e) => {
        setDropOver(false);
        const raw = e.dataTransfer.getData("blockTemplate");
        if (raw) { e.preventDefault(); onAdd(JSON.parse(raw)); }
      }}
    >
      {/* Bandeau en-tête */}
      <div style={{
        padding: "8px 16px", background: "#fff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Algorithme
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", fontFamily: "monospace" }}>
          {algoName}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
          {blocks.length} bloc{blocks.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Bandeau variables déclarées */}
      {declaredVars.length > 0 && (
        <div style={{
          padding: "6px 16px", background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>
            Variables :
          </span>
          {declaredVars.map((v) => {
            const color = TYPE_COLORS[v.dataType] || "#64748b";
            return (
              <div
                key={v.name}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("varName", v.name)}
                title={`Glisser '${v.name}' dans un champ`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "2px 8px",
                  border: `1px solid ${color}55`,
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 3, background: "#fff",
                  fontSize: 11, fontFamily: "monospace",
                  color: "#1e293b", cursor: "grab", userSelect: "none",
                }}
              >
                <span style={{ fontWeight: 700 }}>{v.name}</span>
                <span style={{ color: "#94a3b8", fontSize: 10, marginLeft: 2 }}>{v.dataType}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Zone de blocs */}
      <div style={{ flex: 1, padding: 16 }}>
        {blocks.length === 0 && (
          <div style={{
            height: "200px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            color: "#cbd5e1", fontSize: 13, gap: 6,
            border: "2px dashed #e2e8f0", borderRadius: 6, padding: 40,
          }}>
            <div style={{ fontSize: 28, opacity: 0.4 }}>[ ]</div>
            <div>Glissez des blocs depuis la colonne de gauche</div>
            <div style={{ fontSize: 11 }}>ou cliquez sur un bloc pour l'ajouter</div>
          </div>
        )}

        {blocks.map((block, index) => (
          <div
            key={block.id}
            draggable
            onDragStart={(e) => handleBlockDragStart(e, index)}
            onDragOver={(e) => handleBlockDragOver(e, index)}
            onDrop={(e) => handleBlockDrop(e, index)}
            onDragEnd={handleBlockDragEnd}
            style={{
              opacity: dragIndex === index ? 0.4 : 1,
              borderTop: dropIndex === index && dragIndex !== index ? "2px solid #2563eb" : "2px solid transparent",
              transition: "border-color 0.1s, opacity 0.1s",
              cursor: "grab",
            }}
          >
            <BlockEditor
              block={block}
              declaredVars={declaredVars}
              activeBlockId={activeBlockId}
              onChange={(updated) => onChange(block.id, updated)}
              onDelete={() => onDelete(block.id)}
            />
          </div>
        ))}

        {/* Zone de dépôt bas */}
        {blocks.length > 0 && (
          <div
            style={{
              marginTop: 8, border: "1px dashed #cbd5e1", borderRadius: 4,
              padding: "8px 12px", fontSize: 11, color: "#94a3b8",
              textAlign: "center", background: "#fff",
            }}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#2563eb"; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = "#cbd5e1"; }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.borderColor = "#cbd5e1";
              const raw = e.dataTransfer.getData("blockTemplate");
              if (raw) onAdd(JSON.parse(raw));
            }}
          >
            Déposer un nouveau bloc ici
          </div>
        )}
      </div>
    </main>
  );
}