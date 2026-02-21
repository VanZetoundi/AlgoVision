import React, { useState } from "react";

// Remplacez ces valeurs par vos identifiants EmailJS
// 1. Créez un compte sur https://www.emailjs.com
// 2. Créez un service (Gmail, Outlook, etc.) → notez le SERVICE_ID
// 3. Créez un template avec les variables {{from_name}}, {{from_email}}, {{message}} → notez le TEMPLATE_ID
// 4. Dans Account > API Keys → notez le PUBLIC_KEY
const EMAILJS_SERVICE_ID  = "Van zetoundi";
const EMAILJS_TEMPLATE_ID = "template_t9unxaj";
const EMAILJS_PUBLIC_KEY  = "mb8R8qyRNVq1HP4RT";

export default function SuggestionsModal({ onClose }) {
  const [form, setForm]     = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError]   = useState("");

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSend = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Tous les champs sont obligatoires.");
      return;
    }
    setError("");
    setStatus("sending");

    try {
      // Chargement dynamique d'EmailJS (pas besoin de l'installer via npm)
      const emailjs = await loadEmailJS();
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          message:    form.message,
        },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff", borderRadius: 8, padding: "28px 32px",
        minWidth: 380, maxWidth: 480, width: "100%",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        border: "1px solid #e2e8f0",
      }}>
        {/* En-tête */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Suggestions & Retours</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              Une idée, un bug, un commentaire ? Écrivez-nous.
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#94a3b8", lineHeight: 1 }}
          >×</button>
        </div>

        {status === "success" ? (
          <div style={{
            textAlign: "center", padding: "24px 0",
            color: "#166534", fontSize: 14,
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
            <div style={{ fontWeight: 600 }}>Message envoyé, merci !</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>Nous prendrons en compte votre retour.</div>
            <button
              onClick={onClose}
              style={{
                marginTop: 16, background: "#2563eb", border: "none", color: "#fff",
                padding: "7px 20px", borderRadius: 4, cursor: "pointer", fontWeight: 600, fontSize: 12,
              }}
            >Fermer</button>
          </div>
        ) : (
          <>
            {/* Champs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Votre nom" value={form.name} onChange={(v) => set("name", v)} placeholder="Ex. Jean Dupont" />
              <Field label="Votre adresse e-mail" value={form.email} onChange={(v) => set("email", v)} placeholder="jean@exemple.com" type="email" />
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Votre message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder="Décrivez votre suggestion ou le problème rencontré..."
                  rows={4}
                  style={{
                    width: "100%", padding: "7px 10px",
                    border: "1px solid #cbd5e1", borderRadius: 4,
                    fontSize: 13, outline: "none", resize: "vertical",
                    color: "#1e293b", fontFamily: "inherit", boxSizing: "border-box",
                    lineHeight: 1.5,
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 12, color: "#991b1b", marginTop: 8 }}>{error}</div>
            )}
            {status === "error" && (
              <div style={{ fontSize: 12, color: "#991b1b", marginTop: 8 }}>
                Échec de l'envoi. Vérifiez votre configuration EmailJS.
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
              <button
                onClick={onClose}
                style={{
                  background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#475569",
                  padding: "7px 16px", borderRadius: 4, cursor: "pointer", fontSize: 12,
                }}
              >Annuler</button>
              <button
                onClick={handleSend}
                disabled={status === "sending"}
                style={{
                  background: status === "sending" ? "#93c5fd" : "#2563eb",
                  border: "none", color: "#fff",
                  padding: "7px 20px", borderRadius: 4,
                  cursor: status === "sending" ? "not-allowed" : "pointer",
                  fontWeight: 600, fontSize: 12,
                }}
              >
                {status === "sending" ? "Envoi..." : "Envoyer"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "7px 10px",
          border: "1px solid #cbd5e1", borderRadius: 4,
          fontSize: 13, outline: "none", color: "#1e293b",
          fontFamily: "inherit", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// Chargement du SDK EmailJS via CDN (évite d'ajouter une dépendance npm)
function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) { resolve(window.emailjs); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => resolve(window.emailjs);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
