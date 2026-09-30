"use client";

import { createContext, useContext } from "react";

// Coordinates the navbar's entrance with whatever runs before it.
//
// Today nothing does, so the provider always reports "ready" and the navbar
// animates as soon as it mounts. The splash screen will own this later: it
// holds the stage at "waiting" while it is on screen and flips it to "ready" as
// it leaves, so the splash ending and the navbar arriving read as one movement.
//
// The context exists now rather than later so adding the splash does not mean
// reopening the navbar.
export type EntranceStage = "waiting" | "ready";

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
