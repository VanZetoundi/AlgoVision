import React, { useState } from "react";
import { DATA_TYPES, COMPARISON_OPS } from "../constants/index.js";
import { FieldInput, FieldSelect } from "./ui.jsx";
import { createBlock } from "../utils/index.js";

const BLOCK_ACCENT = {
  comment: "#94a3b8",
  declare: "#2563eb",
  assign:  "#0369a1",
  display: "#0f766e",
  read:    "#7c3aed",
  if:      "#b45309",
  for:     "#15803d",
  while:   "#b91c1c",
  repeat:  "#9333ea",
};

// Opérateurs arithmétiques et logiques disponibles comme blocs
const ARITH_OPS   = ["+", "-", "*", "/", "//", "%"];
const LOGIC_OPS   = ["ET", "OU", "NON"];
const COMPARE_OPS = ["<", "<=", ">", ">=", "==", "!="];

// Construit une expression en insérant un opérateur
function buildExpr(current, op, vars) {
  if (!current) return op;
  return `${current} ${op} `;
}

function DropZone({ onDrop }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const raw = e.dataTransfer.getData("blockTemplate");
        if (raw) onDrop(createBlock(JSON.parse(raw)));
      }}
      style={{
        border: `1px dashed ${over ? "#2563eb" : "#cbd5e1"}`,
        borderRadius: 4, padding: "5px 10px",
        fontSize: 11, color: over ? "#2563eb" : "#94a3b8",
        background: over ? "#eff6ff" : "#f8fafc",
        cursor: "default", textAlign: "center",
        transition: "all 0.12s", margin: "4px 0",
      }}
    >
      Déposer un bloc ici
    </div>
  );
}

function NestedBlocks({ blocks, label, onUpdate, activeBlockId, declaredVars, depth }) {
  return (
    <div style={{ marginTop: 6, paddingLeft: 10, borderLeft: "2px solid #e2e8f0" }}>
      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {(blocks || []).map((b, i) => (
        <BlockEditor
          key={b.id}
          block={b}
          activeBlockId={activeBlockId}
          declaredVars={declaredVars}
          depth={depth + 1}
          onChange={(updated) => {
            const arr = [...blocks];
            arr[i] = updated;
            onUpdate(arr);
          }}
          onDelete={() => onUpdate(blocks.filter((_, j) => j !== i))}
        />
      ))}
      <DropZone onDrop={(nb) => onUpdate([...(blocks || []), nb])} />
    </div>
  );
}

// Sélecteur d'expression : variable + opérateur
function ExprBuilder({ value, onChange, declaredVars, placeholder, width = 180 }) {
  const varNames = declaredVars.map((v) => v.name);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
      <FieldInput value={value} onChange={onChange} placeholder={placeholder} width={width} />
      {/* Insérer variable */}
      {varNames.length > 0 && (
        <FieldSelect
          value=""
          onChange={(v) => { if (v && v !== "var...") onChange(value ? `${value} ${v}` : v); }}
          options={["var...", ...varNames]}
        />
      )}
      {/* Insérer opérateur arithmétique */}
      <FieldSelect
        value=""
        onChange={(op) => { if (op && op !== "op...") onChange(value ? `${value} ${op} ` : op); }}
        options={["op...", ...ARITH_OPS]}
      />
      {/* Insérer opérateur logique */}
      <FieldSelect
        value=""
        onChange={(op) => { if (op && op !== "log...") onChange(value ? `${value} ${op} ` : op); }}
        options={["log...", ...LOGIC_OPS]}
      />
    </div>
  );
}

export default function BlockEditor({ block, onChange, onDelete, activeBlockId, declaredVars = [], depth = 0 }) {
  const { type, props } = block;
  const accent   = BLOCK_ACCENT[type] || "#64748b";
  const isActive = block.id === activeBlockId;

  const set = (key, val) => onChange({ ...block, props: { ...props, [key]: val } });
  const varNames = declaredVars.map((v) => v.name);

  const kw = (text) => (
    <span style={{ fontWeight: 700, color: accent, fontSize: 12, whiteSpace: "nowrap" }}>{text}</span>
  );

  const row = {
    display: "flex", alignItems: "center",
    gap: 6, flexWrap: "wrap",
    fontSize: 13, color: "#334155",
  };

  return (
    <div style={{
      border: `1px solid ${isActive ? accent : "#e2e8f0"}`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: 4, padding: "7px 32px 7px 10px", marginBottom: 5,
      background: isActive ? `${accent}08` : "#fff",
      marginLeft: depth * 12,
      position: "relative",
      boxShadow: isActive ? `0 0 0 2px ${accent}33` : "none",
      transition: "box-shadow 0.15s, background 0.15s",
    }}>

      {/* Bouton supprimer */}
      <button
        onClick={onDelete}
        title="Supprimer ce bloc"
        style={{
          position: "absolute", top: 4, right: 6,
          background: "none", border: "none",
          color: "#cbd5e1", cursor: "pointer",
          fontSize: 16, lineHeight: 1, padding: 0,
        }}
        onMouseEnter={(e) => (e.target.style.color = "#ef4444")}
        onMouseLeave={(e) => (e.target.style.color = "#cbd5e1")}
      >×</button>

      {/* ── COMMENTAIRE ─────────────────────────────────────────────────── */}
      {type === "comment" && (
        <div style={row}>
          <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: 12 }}>//</span>
          <FieldInput value={props.text} onChange={(v) => set("text", v)} placeholder="Commentaire..." width={240} />
        </div>
      )}

      {/* ── DÉCLARER ────────────────────────────────────────────────────── */}
      {type === "declare" && (
        <div style={row}>
          {kw("DÉCLARER")}
          <FieldInput value={props.name} onChange={(v) => set("name", v)} placeholder="nom_variable" width={120} />
          {kw("de type")}
          <FieldSelect value={props.dataType} onChange={(v) => set("dataType", v)} options={DATA_TYPES} />
        </div>
      )}

      {/* ── AFFECTER ────────────────────────────────────────────────────── */}
      {type === "assign" && (
        <div style={row}>
          {kw("AFFECTER")}
          <ExprBuilder
            value={props.expression}
            onChange={(v) => set("expression", v)}
            placeholder="valeur ou expression"
            declaredVars={declaredVars}
            width={130}
          />
          {kw("dans")}
          <FieldSelect
            value={props.varName || "—"}
            onChange={(v) => set("varName", v === "—" ? "" : v)}
            options={["—", ...varNames]}
          />
        </div>
      )}

      {/* ── AFFICHER ────────────────────────────────────────────────────── */}
      {type === "display" && (
        <div style={row}>
          {kw("AFFICHER")}
          <ExprBuilder
            value={props.value}
            onChange={(v) => set("value", v)}
            placeholder="variable ou expression"
            declaredVars={declaredVars}
            width={130}
          />
        </div>
      )}

      {/* ── LIRE ────────────────────────────────────────────────────────── */}
      {type === "read" && (
        <div style={row}>
          {kw("LIRE")}
          <FieldSelect
            value={props.varName || "—"}
            onChange={(v) => set("varName", v === "—" ? "" : v)}
            options={["—", ...varNames]}
          />
        </div>
      )}

      {/* ── SI ──────────────────────────────────────────────────────────── */}
      {type === "if" && (
        <div>
          <div style={row}>
            {kw("SI")}
            <FieldSelect value={props.left  || "—"} onChange={(v) => set("left",  v === "—" ? "" : v)} options={["—", ...varNames]} />
            <FieldSelect value={props.op}            onChange={(v) => set("op", v)}                    options={COMPARE_OPS} />
            <FieldSelect value={props.right || "—"} onChange={(v) => set("right", v === "—" ? "" : v)} options={["—", ...varNames]} />
            <FieldInput  value={props.right}         onChange={(v) => set("right", v)}                  placeholder="ou valeur" width={70} />
            {kw("ALORS")}
          </div>
          <NestedBlocks blocks={props.thenBlocks} label="ALORS" activeBlockId={activeBlockId} declaredVars={declaredVars} depth={depth} onUpdate={(arr) => set("thenBlocks", arr)} />
          <NestedBlocks blocks={props.elseBlocks} label="SINON" activeBlockId={activeBlockId} declaredVars={declaredVars} depth={depth} onUpdate={(arr) => set("elseBlocks", arr)} />
        </div>
      )}

      {/* ── POUR ────────────────────────────────────────────────────────── */}
      {type === "for" && (
        <div>
          <div style={row}>
            {kw("POUR")}
            <FieldInput value={props.varName} onChange={(v) => set("varName", v)} placeholder="i" width={50} />
            {kw("DE")}
            <FieldInput value={props.from}    onChange={(v) => set("from", v)}    placeholder="0" width={50} />
            {kw("À")}
            <FieldInput value={props.to}      onChange={(v) => set("to", v)}      placeholder="10" width={50} />
            {kw("PAS")}
            <FieldInput value={props.step}    onChange={(v) => set("step", v)}    placeholder="1" width={40} />
            {kw("FAIRE")}
          </div>
          <NestedBlocks blocks={props.body} label="CORPS" activeBlockId={activeBlockId} declaredVars={declaredVars} depth={depth} onUpdate={(arr) => set("body", arr)} />
        </div>
      )}

      {/* ── TANT QUE ────────────────────────────────────────────────────── */}
      {type === "while" && (
        <div>
          <div style={row}>
            {kw("TANT QUE")}
            <FieldSelect value={props.left  || "—"} onChange={(v) => set("left",  v === "—" ? "" : v)} options={["—", ...varNames]} />
            <FieldSelect value={props.op}            onChange={(v) => set("op", v)}                    options={COMPARE_OPS} />
            <FieldInput  value={props.right}         onChange={(v) => set("right", v)}                  placeholder="valeur" width={70} />
            {kw("FAIRE")}
          </div>
          <NestedBlocks blocks={props.body} label="CORPS" activeBlockId={activeBlockId} declaredVars={declaredVars} depth={depth} onUpdate={(arr) => set("body", arr)} />
        </div>
      )}

      {/* ── RÉPÉTER ─────────────────────────────────────────────────────── */}
      {type === "repeat" && (
        <div>
          <div style={row}>{kw("RÉPÉTER")}</div>
          <NestedBlocks blocks={props.body} label="CORPS" activeBlockId={activeBlockId} declaredVars={declaredVars} depth={depth} onUpdate={(arr) => set("body", arr)} />
          <div style={{ ...row, marginTop: 6 }}>
            {kw("JUSQU'À")}
            <FieldSelect value={props.left  || "—"} onChange={(v) => set("left",  v === "—" ? "" : v)} options={["—", ...varNames]} />
            <FieldSelect value={props.op}            onChange={(v) => set("op", v)}                    options={COMPARE_OPS} />
            <FieldInput  value={props.right}         onChange={(v) => set("right", v)}                  placeholder="valeur" width={70} />
          </div>
        </div>
      )}
    </div>
  );
}