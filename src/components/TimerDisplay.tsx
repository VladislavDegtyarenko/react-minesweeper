import { useTimerStore } from "@/store/timer";
import { selectTimeDiff } from "@/store/timer/selectors";

const TimerDisplay = () => {
  const timeDiff = useTimerStore(selectTimeDiff);

  return (
    <>
      <img src="/icons/timer.svg" className="header-icon" alt="timer" />
      {timeDiff}
    </>
  );
};

export default TimerDisplay;
