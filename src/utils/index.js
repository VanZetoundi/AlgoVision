import { TYPE_DEFAULTS } from "../constants/index.js";

let _counter = 0;
export const newId = () => `blk_${++_counter}`;

export function createBlock(template) {
  return {
    id: newId(),
    type: template.type,
    props: JSON.parse(JSON.stringify(template.defaultProps)),
  };
}

export function evaluateExpr(expr, memory) {
  if (expr === undefined || expr === null || expr === "") return undefined;
  let replaced = String(expr);

  const vars = Object.keys(memory).sort((a, b) => b.length - a.length);
  for (const v of vars) {
    const val = memory[v]?.value;
    const safe = typeof val === "string" ? `"${val}"` : String(val);
    replaced = replaced.replaceAll(v, safe);
  }

  replaced = replaced
    .replaceAll(" ET ", " && ")
    .replaceAll(" OU ", " || ")
    .replaceAll("NON ", "!");

  try {
    // eslint-disable-next-line no-new-func
    return Function('"use strict"; return (' + replaced + ")")();
  } catch {
    return undefined;
  }
}

export function compareValues(lv, op, rv) {
  if (op === "<")  return lv < rv;
  if (op === "<=") return lv <= rv;
  if (op === ">")  return lv > rv;
  if (op === ">=") return lv >= rv;
  if (op === "==") return lv == rv;  // eslint-disable-line eqeqeq
  if (op === "!=") return lv != rv;  // eslint-disable-line eqeqeq
  return false;
}

export function generatePseudoCode(blocks, indent = 0) {
  const pad = "  ".repeat(indent);
  const lines = [];
  for (const b of blocks) {
    switch (b.type) {
      case "comment":
        lines.push(`${pad}// ${b.props.text}`);
        break;
      case "declare":
        lines.push(`${pad}DÉCLARER ${b.props.name} : ${b.props.dataType}`);
        break;
      case "assign":
        lines.push(`${pad}${b.props.varName} <- ${b.props.expression}`);
        break;
      case "display":
        lines.push(`${pad}AFFICHER ${b.props.value}`);
        break;
      case "read":
        lines.push(`${pad}LIRE ${b.props.varName}`);
        break;
      case "if":
        lines.push(`${pad}SI (${b.props.left} ${b.props.op} ${b.props.right}) ALORS`);
        lines.push(...generatePseudoCode(b.props.thenBlocks || [], indent + 1));
        if ((b.props.elseBlocks || []).length > 0) {
          lines.push(`${pad}SINON`);
          lines.push(...generatePseudoCode(b.props.elseBlocks, indent + 1));
        }
        lines.push(`${pad}FIN SI`);
        break;
      case "for":
        lines.push(`${pad}POUR ${b.props.varName} DE ${b.props.from} A ${b.props.to} PAS ${b.props.step} FAIRE`);
        lines.push(...generatePseudoCode(b.props.body || [], indent + 1));
        lines.push(`${pad}FIN POUR`);
        break;
      case "while":
        lines.push(`${pad}TANT QUE (${b.props.left} ${b.props.op} ${b.props.right}) FAIRE`);
        lines.push(...generatePseudoCode(b.props.body || [], indent + 1));
        lines.push(`${pad}FIN TANT QUE`);
        break;
      case "repeat":
        lines.push(`${pad}RÉPÉTER`);
        lines.push(...generatePseudoCode(b.props.body || [], indent + 1));
        lines.push(`${pad}JUSQU'A (${b.props.left} ${b.props.op} ${b.props.right})`);
        break;
      default:
        break;
    }
  }
  return lines;
}
