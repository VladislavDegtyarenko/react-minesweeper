import { useEffect } from 'react';
import { initTouchScreenListener } from '@/store/settings';
import Game from './components/Game';

function App() {
  useEffect(() => {
    const cleanup = initTouchScreenListener();

    return cleanup;
  }, []);

  return <Game />;
}

export default App;
