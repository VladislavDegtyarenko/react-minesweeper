import { useState } from 'react';
import Button from '@/components/ui/Button';
import { CELL_MARKERS } from '@/config';
import type { CellMarkerState } from '@/types';
import CanvasCell from '../CanvasCell';
import styles from './styles.module.scss';

const InteractiveMarker = () => {
  const [marker, setMarker] = useState<CellMarkerState>(null);

  return (
    <div className={styles.example}>
      <CanvasCell value="mine" isOpened={false} marker={marker} />
      <Button onClick={() => setMarker(marker ? null : CELL_MARKERS.FLAG)}>
        {marker ? 'Remove flag' : 'Place flag'}
      </Button>
    </div>
  );
};

export default InteractiveMarker;
