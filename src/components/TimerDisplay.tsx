const TimerDisplay = ({ timeDiff }: { timeDiff: string }) => {
  return (
    <>
      <img src="/icons/timer.svg" className="header-icon" alt="timer" />
      {timeDiff}
    </>
  );
};

export default TimerDisplay;
