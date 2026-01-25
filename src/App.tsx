import { useEffect } from "react";

// UI
import Header from "./components/Header";
import Board from "./components/Board";
import SelectLevel from "./components/SelectLevel";
import SelectControlMode from "./components/SelectControlMode";
import SelectDigFlag from "./components/SelectDigFlag";
import WinOverlay from "./components/WinOverlay";
import SelectZoom from "./components/SelectZoom";

// Store
import { initTouchScreenListener } from "@/store/settings";

// Styles
import "./App.css";

function App() {
  useEffect(() => {
    const cleanup = initTouchScreenListener();

    return cleanup;
  }, []);

  return (
    <>
      <div className="game">
        <Header />
        <Board />
        <SelectLevel />
        <WinOverlay />
        <SelectControlMode />
        <SelectDigFlag />
        <SelectZoom />
      </div>
    </>
  );
}

export default App;
