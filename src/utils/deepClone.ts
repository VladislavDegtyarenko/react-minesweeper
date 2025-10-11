/**
 * Deep clone utility that uses structuredClone when available,
 * falls back to JSON.parse/stringify for older browsers
 * @param obj - The object to deep clone
 * @returns A deep copy of the input object
 */

export const deepClone = <T>(obj: T): T => {
  // Check if structuredClone is available (modern browsers)
  if (typeof window !== "undefined" && "structuredClone" in window) {
    return window.structuredClone(obj);
  }

  // Fallback for older browsers
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn("Deep clone failed, returning original object:", error);
    return obj;
  }
};
