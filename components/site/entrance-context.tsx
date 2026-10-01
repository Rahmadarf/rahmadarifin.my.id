"use client";

import { createContext, useContext } from "react";

// Drives the opening scene, so the splash leaving, the hero's dots filling in
// and the navbar arriving read as one movement rather than three.
//
//   waiting   the splash is on screen, or is being pressed in
//   opening   the circular gap is growing; the hero is coming into view
//   closing   the hero's dots are filling back in from the edges
//   ready     everything may settle: the navbar enters, the magnetic dots live
//
// Without a splash the stage is "ready" from the start, which is what makes a
// return visit skip straight to the finished page.
export type EntranceStage = "waiting" | "opening" | "closing" | "ready";

const EntranceContext = createContext<EntranceStage>("ready");

export function EntranceProvider({
  stage = "ready",
  children,
}: {
  stage?: EntranceStage;
  children: React.ReactNode;
}) {
  return (
    <EntranceContext.Provider value={stage}>
      {children}
    </EntranceContext.Provider>
  );
}

export function useEntranceStage() {
  return useContext(EntranceContext);
}
