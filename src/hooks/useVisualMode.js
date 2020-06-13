import { useState } from "react";

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  function transition(newMode, replace = false) {
    setMode(newMode);
    if (replace) {
      const tempHistory = [...history];
      tempHistory.splice(tempHistory.length - 1, 1, newMode);
      setHistory(tempHistory);
    } else {
      setHistory((prev) => [...prev, newMode]);
    }
  }

  function back() {
    const tempHistory = [...history];
    if (tempHistory.length <= 1) {
      return;
    }
    tempHistory.pop();
    setHistory(tempHistory);
    setMode(tempHistory[tempHistory.length - 1]);
  }

  return {
    mode,
    transition,
    back,
  };
}
