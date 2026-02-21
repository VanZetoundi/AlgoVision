import { useState, useRef, useCallback } from "react";
import { createBlock, generatePseudoCode } from "../utils/index.js";
import { interpret, interpretStepByStep } from "../utils/interpreter.js";

export function useAlgoStore() {
  const [algoName, setAlgoName]             = useState("MonAlgorithme");
  const [blocks, setBlocks]                 = useState([]);
  const [memory, setMemory]                 = useState({});
  const [logs, setLogs]                     = useState([]);
  const [running, setRunning]               = useState(false);
  const [stepping, setStepping]             = useState(false); // mode pas à pas actif
  const [activeBlockId, setActiveBlockId]   = useState(null);
  const [executionDelay, setExecutionDelay] = useState(500);
  const [inputModal, setInputModal]         = useState(null);

  const historyRef      = useRef([[]]);
  const histIdx         = useRef(0);
  const abortRef        = useRef(false);
  const stepRef         = useRef(null); // resolve de la promesse "pas suivant"
  const inputResolveRef = useRef(null);

  // ── Historique ────────────────────────────────────────────────────────────

  const pushHistory = useCallback((next) => {
    const h = historyRef.current.slice(0, histIdx.current + 1);
    h.push(JSON.parse(JSON.stringify(next)));
    historyRef.current = h;
    histIdx.current = h.length - 1;
  }, []);

  // ── Blocs ─────────────────────────────────────────────────────────────────

  const addBlock = useCallback((template) => {
    setBlocks((prev) => {
      const next = [...prev, createBlock(template)];
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const updateBlock = useCallback((id, updated) => {
    setBlocks((prev) => {
      const next = replaceById(prev, id, updated);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const deleteBlock = useCallback((id) => {
    setBlocks((prev) => {
      const next = removeById(prev, id);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Réordonner : déplacer le bloc à fromIndex vers toIndex
  const reorderBlocks = useCallback((fromIndex, toIndex) => {
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    if (histIdx.current > 0) {
      histIdx.current -= 1;
      setBlocks(JSON.parse(JSON.stringify(historyRef.current[histIdx.current])));
    }
  }, []);

  const redo = useCallback(() => {
    if (histIdx.current < historyRef.current.length - 1) {
      histIdx.current += 1;
      setBlocks(JSON.parse(JSON.stringify(historyRef.current[histIdx.current])));
    }
  }, []);

  const reset = useCallback(() => {
    setBlocks([]);
    setMemory({});
    setLogs([]);
    historyRef.current = [[]];
    histIdx.current = 0;
  }, []);

  // ── Logs ──────────────────────────────────────────────────────────────────

  const log = useCallback((msg, type = "info") => {
    setLogs((prev) => [...prev, { msg, type, id: Date.now() + Math.random() }]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  // ── Saisie (LIRE) ─────────────────────────────────────────────────────────

  const requestInput = useCallback((question) => new Promise((resolve) => {
    setInputModal({ question });
    inputResolveRef.current = resolve;
  }), []);

  const submitInput = useCallback((value) => {
    setInputModal(null);
    inputResolveRef.current?.(value ?? "");
  }, []);

  // ── Exécution normale ─────────────────────────────────────────────────────

  const run = useCallback(async () => {
    if (running) { abortRef.current = true; return; }
    abortRef.current = false;
    setStepping(false);
    setRunning(true);
    setLogs([]);
    const mem = {};
    setMemory(mem);
    log(`Démarrage : ${algoName}`, "system");
    try {
      await interpret(
        blocks, mem, log,
        () => setMemory({ ...mem }),
        requestInput, setActiveBlockId,
        executionDelay, abortRef
      );
      log("Exécution terminée.", "success");
    } catch (err) {
      log("Erreur : " + err.message, "error");
    }
    setActiveBlockId(null);
    setRunning(false);
  }, [running, blocks, algoName, log, requestInput, executionDelay]);

  // ── Exécution pas à pas ───────────────────────────────────────────────────

  const startStepByStep = useCallback(async () => {
    if (running) return;
    abortRef.current = false;
    stepRef.current = null;
    setStepping(true);
    setRunning(true);
    setLogs([]);
    const mem = {};
    setMemory(mem);
    log(`Démarrage pas à pas : ${algoName}`, "system");
    try {
      await interpretStepByStep(
        blocks, mem, log,
        () => setMemory({ ...mem }),
        requestInput, setActiveBlockId,
        abortRef, stepRef
      );
      log("Exécution terminée.", "success");
    } catch (err) {
      log("Erreur : " + err.message, "error");
    }
    setActiveBlockId(null);
    setRunning(false);
    setStepping(false);
  }, [running, blocks, algoName, log, requestInput]);

  // Avancer d'un pas
  const nextStep = useCallback(() => {
    if (stepRef.current) {
      const resolve = stepRef.current;
      stepRef.current = null;
      resolve();
    }
  }, []);

  // Arrêter (mode normal ou pas à pas)
  const stop = useCallback(() => {
    abortRef.current = true;
    // Débloquer le stepRef si on attend
    if (stepRef.current) {
      stepRef.current();
      stepRef.current = null;
    }
  }, []);

  // ── Persistence ───────────────────────────────────────────────────────────

  const save = useCallback(() => {
    const blob = new Blob([JSON.stringify({ algoName, blocks }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${algoName}.algov`;
    a.click();
  }, [algoName, blocks]);

  const loadFile = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".algov,.json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          setAlgoName(data.algoName || "MonAlgorithme");
          setBlocks(data.blocks || []);
          setMemory({});
          setLogs([]);
          historyRef.current = [data.blocks || []];
          histIdx.current = 0;
        } catch { log("Fichier invalide.", "error"); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [log]);

  const getPseudoCode = useCallback(() => generatePseudoCode(blocks).join("\n"), [blocks]);

  return {
    algoName, setAlgoName,
    blocks, memory, logs, running, stepping, activeBlockId,
    executionDelay, setExecutionDelay,
    inputModal,
    addBlock, updateBlock, deleteBlock, reorderBlocks,
    undo, redo, reset,
    run, startStepByStep, nextStep, stop,
    log, clearLogs,
    save, loadFile,
    getPseudoCode,
    requestInput,   // <-- ajouter
    submitInput,   // <-- ajouter
  };
}

// ── Helpers récursifs ─────────────────────────────────────────────────────────

function replaceById(blocks, id, updated) {
  return blocks.map((b) => {
    if (b.id === id) return updated;
    const nested = {};
    for (const key of Object.keys(b.props || {})) {
      if (Array.isArray(b.props[key]) && b.props[key].some?.((x) => x?.id)) {
        nested[key] = replaceById(b.props[key], id, updated);
      }
    }
    return Object.keys(nested).length ? { ...b, props: { ...b.props, ...nested } } : b;
  });
}

function removeById(blocks, id) {
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => {
      const nested = {};
      for (const key of Object.keys(b.props || {})) {
        if (Array.isArray(b.props[key]) && b.props[key].some?.((x) => x?.id)) {
          nested[key] = removeById(b.props[key], id);
        }
      }
      return Object.keys(nested).length ? { ...b, props: { ...b.props, ...nested } } : b;
    });
}