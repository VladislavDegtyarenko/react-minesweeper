import { useMemo } from "react";
import Confetti from "react-confetti";
import { useGameStore } from "@/store/game";
import useWindowSize from "@/hooks/useWindowSize";

const CSS_COLOR_VARIABLES = [
  "--one",
  "--two",
  "--three",
  "--four",
  "--five",
  "--six",
  //   "--seven",
  //   "--eight",
  "--red",
  "--green",
] as const;

const WinOverlay = () => {
  const isGameWin = useGameStore((state) => state.isGameWin);
  const { width, height } = useWindowSize();

  const confettiColors = useMemo(() => {
    const rootStyles = getComputedStyle(document.documentElement);

    return CSS_COLOR_VARIABLES.map((variable) =>
      rootStyles.getPropertyValue(variable).trim()
    );
  }, []);

  if (!isGameWin) {
    return null;
  }

  return <Confetti width={width} height={height} colors={confettiColors} />;
};

export default WinOverlay;
