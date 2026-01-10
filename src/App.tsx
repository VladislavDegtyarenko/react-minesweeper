// UI
import Header from "./components/Header";
import Board from "./components/Board";
import SelectLevel from "./components/SelectLevel";
import WinOverlay from "./components/WinOverlay";

// Styles
import "./App.css";

function App() {
  return (
    <>
      <div className="game">
        <Header />
        <Board />
        <SelectLevel />
        <WinOverlay />
      </div>
    </>
  );
}

export default App;
