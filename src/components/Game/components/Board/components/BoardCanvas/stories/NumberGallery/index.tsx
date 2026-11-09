import CanvasCell from '../CanvasCell';
import styles from './styles.module.scss';

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

const NumberGallery = () => (
  <div className={styles.gallery}>
    {NUMBERS.map((value) => (
      <figure key={value} className={styles.sample}>
        <CanvasCell value={value} isOpened marker={null} />
        <figcaption>
          {value} adjacent {value === 1 ? 'mine' : 'mines'}
        </figcaption>
      </figure>
    ))}
  </div>
);

export default NumberGallery;
