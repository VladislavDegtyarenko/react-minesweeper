import Link from 'next/link';
import classNames from 'classnames/bind';
import ROUTES from '@/config/routes.json';
import CellExample from './cell-example';
import styles from './content.module.scss';

const cx = classNames.bind(styles);

const DIFFICULTY_ROWS = [
  { name: 'Easy', board: '9 x 9', mines: '10', recommendedFor: 'New players' },
  {
    name: 'Medium',
    board: '16 x 16',
    mines: '40',
    recommendedFor: 'Regular practice',
  },
  {
    name: 'Expert',
    board: '16 x 30',
    mines: '99',
    recommendedFor: 'Advanced players',
  },
];

const HowToPlayContent = () => {
  return (
    <article className={cx('guide')} aria-labelledby="how-to-play-title">
      <header className={cx('hero')}>
        <h1 id="how-to-play-title">How to Play Minesweeper</h1>
        <p className={cx('lead')}>
          Open every safe cell and avoid every mine. Use the number clues to
          solve the board with logic.
        </p>
        <p className={cx('note')}>
          First move protection is enabled, so your opening click or tap will
          not lose the game.
        </p>
        <nav className={cx('toc')} aria-label="How to play sections">
          <p className={cx('tocTitle')}>On this page</p>
          <ul>
            <li>
              <a href="#objective">Objective</a>
            </li>
            <li>
              <a href="#numbers">Number clues</a>
            </li>
            <li>
              <a href="#controls">Controls</a>
            </li>
            <li>
              <a href="#markers">Flags and question marks</a>
            </li>
            <li>
              <a href="#difficulty">Difficulty levels</a>
            </li>
            <li>
              <a href="#tips">Strategy tips</a>
            </li>
          </ul>
        </nav>
      </header>

      <section id="objective" className={cx('section')}>
        <h2>Objective</h2>
        <p>
          You win when every non-mine cell is revealed. You can also win by
          correctly flagging all mines.
        </p>
        <ol className={cx('steps')}>
          <li>Open a cell to reveal what is underneath.</li>
          <li>Read the number clues around opened cells.</li>
          <li>Mark dangerous cells, then continue opening safe ones.</li>
        </ol>
        <ul className={cx('examples')}>
          <li>
            Numbered safe cell
            <CellExample variant="safe" />
          </li>
          <li>
            Mine cell
            <CellExample variant="mine" />
          </li>
          <li>
            Flagged cell
            <CellExample variant="flag" />
          </li>
        </ul>
      </section>

      <section id="numbers" className={cx('section')}>
        <h2>What the Numbers Mean</h2>
        <p>
          Each number shows how many mines are in the 8 surrounding cells,
          including diagonals.
        </p>
        <p>
          Example: a cell showing <strong>2</strong> means exactly two adjacent
          cells contain mines.
        </p>
        <p>
          Numbers are always accurate and are the main clues for every move.
        </p>
      </section>

      <section id="controls" className={cx('section')}>
        <h2>Controls</h2>
        <div className={cx('controlGrid')}>
          <article className={cx('controlCard')}>
            <h3>Desktop (Mouse)</h3>
            <ul>
              <li>
                <strong>Left click:</strong> open a cell.
              </li>
              <li>
                <strong>Right click:</strong> place or cycle markers.
              </li>
            </ul>
          </article>

          <article className={cx('controlCard')}>
            <h3>Mobile: Toggle Mode</h3>
            <ul>
              <li>
                Select <strong>Dig</strong> to open cells on tap.
              </li>
              <li>
                Select <strong>Flag</strong> to place markers on tap.
              </li>
            </ul>
          </article>

          <article className={cx('controlCard')}>
            <h3>Mobile: Gestures Mode</h3>
            <ul>
              <li>
                <strong>Tap:</strong> open a cell.
              </li>
              <li>
                <strong>Long press:</strong> place or cycle markers.
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section id="markers" className={cx('section')}>
        <h2>Flags and Question Marks</h2>
        <p>
          Use a flag when a mine location is certain. Use a question mark when
          you are still evaluating that cell.
        </p>
        <p>
          Marker cycle: <strong>Flag</strong> -&gt; <strong>Question</strong>{' '}
          -&gt; <strong>Empty</strong>.
        </p>
        <p>
          Question marks can be turned on or off in <strong>Settings</strong>.
        </p>
      </section>

      <section id="difficulty" className={cx('section')}>
        <h2>Difficulty Levels</h2>
        <table className={cx('table')}>
          <caption>Board sizes and mine counts</caption>
          <thead>
            <tr>
              <th scope="col">Level</th>
              <th scope="col">Board</th>
              <th scope="col">Mines</th>
              <th scope="col">Best for</th>
            </tr>
          </thead>
          <tbody>
            {DIFFICULTY_ROWS.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td>{row.board}</td>
                <td>{row.mines}</td>
                <td>{row.recommendedFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="tips" className={cx('section')}>
        <h2>Strategy Tips</h2>
        <ul>
          <li>Start near edges or corners to reveal larger safe areas.</li>
          <li>Do not rush. Confirm each number against all neighbors.</li>
          <li>Use flags to reduce mental load and avoid repeat mistakes.</li>
          <li>
            If stuck, mark uncertain spots with question marks and move to a
            different region.
          </li>
          <li>
            Use zoom settings (S, M, L, XL) for cleaner tapping on mobile.
          </li>
        </ul>
      </section>

      <section className={cx('ready')}>
        <h2>Ready to Play?</h2>
        <p>Open the game board and put the rules into practice.</p>
        <Link href={ROUTES.GAME} className={cx('ctaLink')}>
          Start a New Game
        </Link>
      </section>
    </article>
  );
};

export default HowToPlayContent;
