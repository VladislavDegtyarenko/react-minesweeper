import { useEffect } from 'react';

// UI
import Header from './components/Header';
import Board from './components/Board';
import SelectLevel from './components/Game/SelectLevel';
import SelectDigFlag from './components/Game/SelectDigFlag';
import WinOverlay from './components/WinOverlay';

// Store
import { initTouchScreenListener } from '@/store/settings';

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
        <SelectDigFlag />
      </div>
    </>
  );
}

export default App;
