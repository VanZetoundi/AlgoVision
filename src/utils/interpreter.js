import { evaluateExpr, compareValues } from "./index.js";
import { TYPE_DEFAULTS } from "../constants/index.js";

/**
 * Mode normal : exécute tous les blocs d'un coup avec délai entre chaque.
 */
export async function interpret(
  blocks, memory, log, syncMemory,
  requestInput, setActiveBlock, delay, abortRef
) {
  await _run(blocks, memory, log, syncMemory, requestInput, setActiveBlock, delay, abortRef, null);
}

/**
 * Mode pas à pas : attend un signal (stepRef) avant chaque bloc.
 * stepRef = { current: resolve_fn | null }
 * Pour avancer : appeler stepRef.current() depuis l'extérieur.
 */
export async function interpretStepByStep(
  blocks, memory, log, syncMemory,
  requestInput, setActiveBlock, abortRef, stepRef
) {
  await _run(blocks, memory, log, syncMemory, requestInput, setActiveBlock, 0, abortRef, stepRef);
}

async function _run(
  blocks, memory, log, syncMemory,
  requestInput, setActiveBlock, delay, abortRef, stepRef
) {
  for (const block of blocks) {
    if (abortRef.current) break;

    // Attente du signal "pas suivant" si en mode pas à pas
    if (stepRef) {
      await new Promise((resolve) => { stepRef.current = resolve; });
      if (abortRef.current) break;
    } else {
      await sleep(delay);
    }

    setActiveBlock(block.id);
    if (!stepRef) await sleep(Math.min(delay, 80)); // petite pause visuelle

    switch (block.type) {

      case "comment": break;

      case "declare": {
        const { name, dataType } = block.props;
        if (!name?.trim()) { log("Nom de variable manquant.", "error"); break; }
        if (memory[name])  { log(`Variable '${name}' déjà déclarée.`, "warn"); break; }
        memory[name] = { type: dataType, value: TYPE_DEFAULTS[dataType] };
        syncMemory();
        log(`Variable '${name}' déclarée de type ${dataType}.`, "success");
        break;
      }

      case "assign": {
        const { varName, expression } = block.props;
        if (!varName)         { log("Aucune variable cible.", "error"); break; }
        if (!memory[varName]) { log(`Variable '${varName}' non déclarée.`, "error"); break; }
        const val = evaluateExpr(expression, memory);
        if (val === undefined) { log(`Expression invalide : "${expression}".`, "error"); break; }
        const t = memory[varName].type;
        if (t === "Entier" && typeof val !== "number") {
          log(`Impossible d'affecter une valeur non numérique à '${varName}'.`, "error"); break;
        }
        memory[varName].value = t === "Entier" ? Math.trunc(val) : val;
        syncMemory();
        log(`${varName} <- ${memory[varName].value}`, "info");
        break;
      }

      case "display": {
        const val = evaluateExpr(block.props.value, memory);
        log(String(val !== undefined ? val : block.props.value), "output");
        break;
      }

      case "read": {
        const { varName } = block.props;
        if (!varName)         { log("Aucune variable cible.", "error"); break; }
        if (!memory[varName]) { log(`Variable '${varName}' non déclarée.`, "error"); break; }
        const raw = await requestInput(`Entrer la valeur pour '${varName}' (${memory[varName].type}) :`);
        let parsed = raw;
        if (memory[varName].type === "Entier")  parsed = parseInt(raw, 10);
        if (memory[varName].type === "Réel")    parsed = parseFloat(raw);
        if (memory[varName].type === "Booléen") parsed = raw.toLowerCase() === "vrai" || raw === "true";
        memory[varName].value = parsed;
        syncMemory();
        log(`Lecture : ${varName} = ${parsed}`, "info");
        break;
      }

      case "if": {
        const { left, op, right, thenBlocks, elseBlocks } = block.props;
        const condition = compareValues(evaluateExpr(left, memory), op, evaluateExpr(right, memory));
        log(`Condition (${left} ${op} ${right}) : ${condition ? "VRAIE" : "FAUSSE"}.`, condition ? "success" : "warn");
        await _run(
          condition ? (thenBlocks || []) : (elseBlocks || []),
          memory, log, syncMemory, requestInput, setActiveBlock, delay, abortRef, stepRef
        );
        break;
      }

      case "for": {
        const { varName, from, to, step, body } = block.props;
        let iter  = evaluateExpr(from, memory) ?? parseInt(from, 10);
        const end = evaluateExpr(to, memory)   ?? parseInt(to, 10);
        const inc = parseInt(step, 10) || 1;
        memory[varName] = memory[varName] || { type: "Entier", value: iter };
        let guard = 0;
        while (iter <= end && guard++ < 100000) {
          if (abortRef.current) break;
          memory[varName].value = iter;
          syncMemory();
          log(`Pour ${varName} = ${iter}`, "info");
          await _run(body || [], memory, log, syncMemory, requestInput, setActiveBlock, delay, abortRef, stepRef);
          iter += inc;
        }
        break;
      }

      case "while": {
        const { left, op, right, body } = block.props;
        let guard = 0;
        while (compareValues(evaluateExpr(left, memory), op, evaluateExpr(right, memory)) && guard++ < 100000) {
          if (abortRef.current) break;
          log(`Tant que (${left} ${op} ${right}) : VRAI`, "info");
          await _run(body || [], memory, log, syncMemory, requestInput, setActiveBlock, delay, abortRef, stepRef);
        }
        break;
      }

      case "repeat": {
        const { body, left, op, right } = block.props;
        let guard = 0;
        do {
          if (abortRef.current) break;
          await _run(body || [], memory, log, syncMemory, requestInput, setActiveBlock, delay, abortRef, stepRef);
          guard++;
        } while (!compareValues(evaluateExpr(left, memory), op, evaluateExpr(right, memory)) && guard < 100000);
        break;
      }

      default:
        log(`Type de bloc inconnu : ${block.type}.`, "warn");
    }
  }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }