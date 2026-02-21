import React, { useRef, useEffect, useState } from "react";
import { TYPE_COLORS, LOG_COLORS, LOG_BG } from "../constants/index.js";

// ── Écran de sortie ───────────────────────────────────────────────────────────

function OutputScreen({ logs, onClear }) {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "50%", borderBottom: "1px solid #e2e8f0" }}>
      <div style={{
        padding: "5px 10px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Écran
        </span>
        <button
          onClick={onClear}
          style={{ background: "none", border: "none", fontSize: 11, color: "#94a3b8", cursor: "pointer" }}
        >
          Effacer
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 8, fontFamily: "monospace", fontSize: 12, background: "#fff" }}>
        {logs.length === 0 && (
          <div style={{ color: "#cbd5e1", textAlign: "center", marginTop: 16, fontSize: 12 }}>
            Exécutez l'algorithme pour voir les résultats.
          </div>
        )}
        {logs.map((l) => (
          <div key={l.id} style={{
            padding: "2px 6px", marginBottom: 2, borderRadius: 2,
            color: LOG_COLORS[l.type] || "#374151",
            background: LOG_BG[l.type] || "transparent",
            borderLeft: `2px solid ${LOG_COLORS[l.type] || "#e2e8f0"}`,
            fontSize: 12, fontFamily: "monospace", wordBreak: "break-all",
          }}>
            {l.msg}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

// ── Visualiseur de mémoire ────────────────────────────────────────────────────

function MemoryPanel({ memory }) {
  const vars = Object.entries(memory);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "50%" }}>
      <div style={{
        padding: "5px 10px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Mémoire
        </span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 10, background: "#fff" }}>
        {vars.length === 0 && (
          <div style={{ color: "#cbd5e1", textAlign: "center", marginTop: 16, fontSize: 12 }}>
            Aucune variable en mémoire.
          </div>
        )}
        {vars.map(([name, info]) => {
          const color   = TYPE_COLORS[info.type] || "#64748b";
          const display = typeof info.value === "object" ? JSON.stringify(info.value) : String(info.value);
          return (
            <div key={name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, color: "#1e293b" }}>{name}</span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{info.type}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{
                    width: 16, height: 16,
                    border: `1px solid ${color}55`,
                    background: i < 4 ? `${color}22` : `${color}0a`,
                    borderRadius: 2, fontSize: 7,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color, fontFamily: "monospace",
                  }}>
                    {i === 0 ? (display[0] || "0") : "·"}
                  </div>
                ))}
                <span style={{ marginLeft: 6, fontFamily: "monospace", fontSize: 12, fontWeight: 600, color }}>
                  = {display}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Comparateur de pseudo-code ────────────────────────────────────────────────

function ComparePanel({ getPseudoCode }) {
  const [userCode, setUserCode] = useState("");
  const [result, setResult]     = useState(null);

  const compare = () => {
    const generated = getPseudoCode();
    const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");
    const genLines  = generated.split("\n").map(normalize).filter(Boolean);
    const userLines = userCode.split("\n").map(normalize).filter(Boolean);
    const matches   = genLines.filter((l) => userLines.includes(l)).length;
    const pct       = genLines.length ? Math.round((matches / genLines.length) * 100) : 0;
    setResult({ generated, matches, total: genLines.length, pct });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 10, gap: 8, overflowY: "auto", background: "#fff" }}>
      <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
        Écrivez votre pseudo-code, puis comparez avec la solution générée.
      </p>
      <textarea
        value={userCode}
        onChange={(e) => setUserCode(e.target.value)}
        placeholder={"DÉCLARER somme : Entier\nLIRE a\nLIRE b\nsomme <- a + b\nAFFICHER somme"}
        style={{
          flex: "0 0 150px", border: "1px solid #e2e8f0", borderRadius: 4,
          padding: 8, fontSize: 12, fontFamily: "monospace",
          resize: "vertical", outline: "none", color: "#1e293b", lineHeight: 1.6,
        }}
      />
      <button
        onClick={compare}
        style={{
          background: "#2563eb", border: "none", color: "#fff",
          padding: "7px 0", borderRadius: 4, cursor: "pointer",
          fontWeight: 600, fontSize: 12,
        }}
      >
        Comparer
      </button>
      {result && (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}>
          <div style={{
            padding: "8px 12px", borderBottom: "1px solid #e2e8f0",
            fontWeight: 700, fontSize: 13,
            background: result.pct >= 80 ? "#f0fdf4" : result.pct >= 50 ? "#fffbeb" : "#fef2f2",
            color: result.pct >= 80 ? "#166534" : result.pct >= 50 ? "#92400e" : "#991b1b",
          }}>
            {result.pct}% de concordance ({result.matches}/{result.total} lignes)
          </div>
          {/** Optionnel : afficher le code généré pour comparaison
          <div style={{ padding: "8px 12px" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>SOLUTION ATTENDUE</div>
            <pre style={{ margin: 0, fontSize: 11, fontFamily: "monospace", color: "#374151", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {result.generated}
            </pre>
          </div>
        **/}
        </div>
      )}
    </div>
  );
}

// ── Panneau droit (2 onglets : Exécution | Pseudo-code) ───────────────────────

const TABS = [
  { id: "exec",    label: "Exécution" },
  { id: "compare", label: "Pseudo-code" },
];

export default function RightPanel({ logs, memory, getPseudoCode, onClearLogs }) {
  const [tab, setTab] = useState("exec");

  return (
    <aside style={{
      width: 280, background: "#fff",
      borderLeft: "1px solid #e2e8f0",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* Onglets */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "8px 0", fontSize: 11,
              border: "none",
              borderBottom: tab === t.id ? "2px solid #2563eb" : "2px solid transparent",
              background: "none",
              color: tab === t.id ? "#2563eb" : "#64748b",
              fontWeight: tab === t.id ? 700 : 400,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Onglet Exécution : Écran (haut) + Mémoire (bas) */}
      {tab === "exec" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <OutputScreen logs={logs} onClear={onClearLogs} />
          <MemoryPanel memory={memory} />
        </div>
      )}

      {/* Onglet Pseudo-code */}
      {tab === "compare" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <ComparePanel getPseudoCode={getPseudoCode} />
        </div>
      )}
    </aside>
  );
}