import React from "react";
import { BLOCK_CATEGORIES, TYPE_COLORS } from "../constants/index.js";
import { SectionLabel } from "./ui.jsx";

import { FaYoutube } from "react-icons/fa";

function VideoPromo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "16px 24px",
        background: "linear-gradient(90deg, #ff0000, #ff5555)",
        color: "#fff",
        fontWeight: 500,
        fontSize: 10,
        borderRadius: 12,
        cursor: "pointer",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onClick={() => window.open("https://www.youtube.com/", "_blank")}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
      }}
    >
      <FaYoutube size={24} />
      <span>Pour voir la vidéo explicative sur l'utilisation, cliquez ici !</span>
    </div>
  );
}

export default function Toolbox({ declaredVars, onAddBlock }) {
  return (
    <aside style={{
      width: 200,
      background: "#f8fafc",
      borderRight: "1px solid #e2e8f0",
      overflowY: "auto",
      padding: "12px 10px",
      flexShrink: 0,
    }}>
      {BLOCK_CATEGORIES.map((cat) => (
        <div key={cat.category} style={{ marginBottom: 16 }}>
          <SectionLabel>{cat.category}</SectionLabel>
          {cat.blocks.map((tmpl) => (
            <div
              key={tmpl.type}
              draggable
              onClick={() => onAddBlock(tmpl)}
              onDragStart={(e) => e.dataTransfer.setData("blockTemplate", JSON.stringify(tmpl))}
              style={{
                padding: "6px 10px", marginBottom: 3,
                borderRadius: 3, border: "1px solid #e2e8f0",
                background: "#fff", fontSize: 12, color: "#374151",
                cursor: "grab", userSelect: "none", transition: "background 0.1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#eff6ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
            >
              {tmpl.label}
            </div>
          ))}
        </div>
      ))}

      <VideoPromo />
    </aside>
  );
}