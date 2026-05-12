import Game from './components/Game';
import { useEffect } from 'react';
import { initTouchScreenListener } from '@/store/settings';
// Initialize stats store subscriptions on app startup.
import '@/store/stats';
// Initialize daily store subscriptions on app startup.
import '@/store/daily';

function App() {
  useEffect(() => {
    const cleanup = initTouchScreenListener();

    return cleanup;
  }, []);

  return <Game />;
}

export default App;
