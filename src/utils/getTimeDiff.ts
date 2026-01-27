export const getTimeDiff = (elapsedMs: number) => {
  if (!elapsedMs) return "00:00";

  return new Intl.DateTimeFormat("en-US", {
    minute: "2-digit",
    second: "numeric",
  }).format(elapsedMs);
};
