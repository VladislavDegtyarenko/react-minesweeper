import { useState, useEffect, useRef } from "react";
import { getTimeDiff } from "../utils";

const useTimer = () => {
  const timerInterval = useRef<null | number>(null);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeNow, setTimeNow] = useState<Date | null>(null);
  const timeDiff = getTimeDiff(timeNow, timeStarted);
  const isTimerRunning = Boolean(timeStarted);

  const startTimer = () => {
    setTimeStarted(new Date());
  };

  const stopTimer = () => {
    clearInterval(timerInterval.current!);
  };

  const resetTimer = () => {
    setTimeStarted(null);
    setTimeNow(null);
  };

  useEffect(() => {
    if (!timeStarted) return;

    timerInterval.current = setInterval(() => {
      setTimeNow(new Date());
    }, 1000);

    return () => clearInterval(timerInterval.current!);
  }, [timeStarted]);

  return {
    timeDiff,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
};

export default useTimer;
