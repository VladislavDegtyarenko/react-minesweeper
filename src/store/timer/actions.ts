import { useTimerStore } from ".";

const tick = () => {
  useTimerStore.setState({ timeNow: new Date() });
};

export const startTimer = () => {
  const { timerInterval } = useTimerStore.getState();

  if (timerInterval !== null) {
    stopTimer();
  }

  const newTimerInterval = window.setInterval(tick, 1000);

  useTimerStore.setState({
    timeStarted: new Date(),
    timerInterval: newTimerInterval,
  });
};

export const stopTimer = () => {
  const { timerInterval } = useTimerStore.getState();

  if (timerInterval !== null) {
    clearInterval(timerInterval);
  }

  useTimerStore.setState({ timerInterval: null });
};

export const resetTimer = () => {
  stopTimer();
  useTimerStore.setState({ timeStarted: null, timeNow: null });
};
