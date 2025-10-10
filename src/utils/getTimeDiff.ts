export const getTimeDiff = (timeNow: Date | null, timeStarted: Date | null) => {
  if (timeNow === null || timeStarted === null) return "00:00";

  return new Intl.DateTimeFormat("en-US", {
    minute: "2-digit",
    second: "numeric",
  }).format(timeNow.getTime() - timeStarted.getTime());
};
