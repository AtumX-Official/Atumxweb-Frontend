"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import serialService from "../services/Serialservice";

/**
 * Route → board runtime mapping.
 *
 * Blockly is the DEFAULT board runtime. "/" and "/blocks" map to it. "/cpp"
 * maps to the C++ runtime — a DISTINCT logical state from Blockly even though
 * both share the native USB ids (303a:1001 / 2e8a:000a). "/python" maps to the
 * Python runtime (303a:817a / 2e8a:0005). SerialService.switchToMode() owns
 * the Blockly ↔ C++ ↔ Python transitions, including 'cswitch' when entering
 * C++ and 'bswitch' when leaving it back to the Blockly default.
 *
 * Any route NOT listed here is left untouched — board modes are never changed
 * on non-mode pages (games, AI, RC car, …).
 */
const BOARD_MODE_BY_ROUTE: Record<
  string,
  "Blockly Mode" | "Python Mode" | "Cpp Mode"
> = {
  "/": "Blockly Mode",
  "/blocks": "Blockly Mode",
  "/python": "Python Mode",
  "/cpp": "Cpp Mode",
};

/**
 * Single place where navigation drives the board firmware runtime.
 *
 * - When a route is entered, the board is transitioned to that route's runtime
 *   exactly once (switchToMode() no-ops when the board already satisfies it and
 *   serializes concurrent requests, so React Strict Mode / Fast Refresh / double
 *   effects can never fire duplicate commands).
 * - When C++ is left (to "/", "/blocks", or "/python"), the board is switched
 *   back out of the C++ runtime ('bswitch') to the default Blockly runtime —
 *   or straight on to Python, which the firmware reaches via Blockly.
 * - A plain effect cleanup / re-render never triggers a transition because we
 *   key on the pathname, not on mount/unmount.
 */
export default function BoardModeManager() {
  const pathname = usePathname();

  // Only transition once per route entry — NOT on re-render, Strict Mode
  // double-mounting, or effect cleanup of the previous route.
  const lastHandledPath = useRef<string | null>(null);

  useEffect(() => {
    const target = BOARD_MODE_BY_ROUTE[pathname];

    if (!target) {
      // Not a mode page (games/AI/etc). Leave the board exactly as it is.
      lastHandledPath.current = pathname;
      return;
    }

    // Same route was already handled — a re-render or a navigation to the exact
    // same pathname must not fire the transition a second time.
    if (lastHandledPath.current === pathname) {
      return;
    }

    lastHandledPath.current = pathname;

    void serialService.switchToMode(target).catch((error) => {
      console.warn(`[BoardModeManager] switchToMode(${target}) failed:`, error);
    });
  }, [pathname]);

  return null;
}