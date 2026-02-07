"use client";

import dynamic from "next/dynamic";

/**
 * Dynamically imports the App component with SSR disabled.
 *
 * SSR is disabled because:
 * - Game uses browser-only APIs (localStorage, Audio, DOM events)
 * - Random board generation would cause hydration mismatches
 * - No SEO benefit for interactive game content
 */
const App = dynamic(() => import("../../App"), { ssr: false });

export function ClientOnly() {
  return <App />;
}
