export const DATA_TYPES = ["Entier", "Réel", "Booléen", "Caractère", "Chaîne", "Tableau"];

export const TYPE_COLORS = {
  Entier:    "#2563eb",
  Réel:      "#0891b2",
  Booléen:   "#7c3aed",
  Caractère: "#b45309",
  Chaîne:    "#0f766e",
  Tableau:   "#be185d",
};

export const TYPE_DEFAULTS = {
  Entier:    0,
  Réel:      0.0,
  Booléen:   false,
  Caractère: "",
  Chaîne:    "",
  Tableau:   [],
};

export const COMPARISON_OPS = ["<", "<=", ">", ">=", "==", "!="];

export const BLOCK_CATEGORIES = [
  {
    category: "Texte libre",
    blocks: [
      { type: "comment", label: "Commentaire", defaultProps: { text: "Votre commentaire ici" } },
    ],
  },
  {
    category: "Instructions",
    blocks: [
      { type: "declare", label: "Déclarer variable",            defaultProps: { name: "variable1", dataType: "Entier" } },
      { type: "assign",  label: "Affecter ... dans ...",         defaultProps: { varName: "", expression: "" } },
      { type: "display", label: "Afficher ...",                  defaultProps: { value: "" } },
      { type: "read",    label: "Récupérer et mettre dans ...",  defaultProps: { varName: "" } },
    ],
  },
  {
    category: "Conditions",
    blocks: [
      { type: "if", label: "Si ... alors ... sinon", defaultProps: { left: "", op: "==", right: "", thenBlocks: [], elseBlocks: [] } },
    ],
  },
  {
    category: "Boucles",
    blocks: [
      { type: "for",    label: "Pour ... de ... à ... faire", defaultProps: { varName: "i", from: "0", to: "10", step: "1", body: [] } },
      { type: "while",  label: "Tant que ... faire",          defaultProps: { left: "", op: "<", right: "", body: [] } },
      { type: "repeat", label: "Répéter ... jusqu'à ...",     defaultProps: { body: [], left: "", op: "==", right: "" } },
    ],
  },
];

export const LOG_COLORS = {
  info:    "#475569",
  success: "#166534",
  error:   "#991b1b",
  warn:    "#92400e",
  output:  "#1e40af",
  system:  "#4b5563",
};

export const LOG_BG = {
  info:    "transparent",
  success: "#f0fdf4",
  error:   "#fef2f2",
  warn:    "#fffbeb",
  output:  "#eff6ff",
  system:  "#f9fafb",
};
