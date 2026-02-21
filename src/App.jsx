import React, { useState } from "react";
import Navbar           from "./components/Navbar.jsx";
import Toolbox          from "./components/Toolbox.jsx";
import WorkArea         from "./components/WorkArea.jsx";
import RightPanel       from "./components/RightPanel.jsx";
import InputModal       from "./components/InputModal.jsx";
import SuggestionsModal from "./components/SuggestionsModal.jsx";
import { useAlgoStore } from "./hooks/useAlgoStore.js";
import { extractDeclaredVars } from "./components/WorkArea.jsx";

export default function App() {
  const store = useAlgoStore();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const declaredVars = extractDeclaredVars(store.blocks);

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      fontSize: 13, color: "#1e293b",
    }}>
      {store.inputModal && (
        <InputModal question={store.inputModal.question} onSubmit={store.submitInput} />
      )}

      {showSuggestions && (
        <SuggestionsModal onClose={() => setShowSuggestions(false)} />
      )}

      <Navbar
        algoName={store.algoName}
        onRename={store.setAlgoName}
        running={store.running}
        stepping={store.stepping}
        onRun={store.run}
        onStartStep={store.startStepByStep}
        onNextStep={store.nextStep}
        onStop={store.stop}
        onUndo={store.undo}
        onRedo={store.redo}
        onReset={store.reset}
        onSave={store.save}
        onLoad={store.loadFile}
        executionDelay={store.executionDelay}
        onDelayChange={store.setExecutionDelay}
        onSuggestions={() => setShowSuggestions(true)}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Toolbox
          declaredVars={declaredVars}
          onAddBlock={store.addBlock}
        />
        <WorkArea
          algoName={store.algoName}
          blocks={store.blocks}
          activeBlockId={store.activeBlockId}
          onAdd={store.addBlock}
          onChange={store.updateBlock}
          onDelete={store.deleteBlock}
          onReorder={store.reorderBlocks}
        />
        <RightPanel
          logs={store.logs}
          memory={store.memory}
          getPseudoCode={store.getPseudoCode}
          onClearLogs={store.clearLogs}
        />
      </div>
    </div>
  );
}