import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { createCx } from '@/utils';
import CellExample from './cell-example';
import NumberClueDemo from './number-clue-demo';
import styles from './content.module.scss';

const cx = createCx(styles);

const DIFFICULTY_ROWS = [
  { name: 'Easy', board: '9 x 9', mines: '10', recommendedFor: 'New players' },
  {
    name: 'Medium',
    board: '16 x 16',
    mines: '40',
    recommendedFor: 'Regular play',
  },
  {
    name: 'Expert',
    board: '16 x 30',
    mines: '99',
    recommendedFor: 'Experienced players',
  },
];

const TOC_ITEMS = [
  { href: '#objective', label: 'Objective' },
  { href: '#numbers', label: 'Number clues' },
  { href: '#controls', label: 'Controls' },
  { href: '#markers', label: 'Flags and question marks' },
  { href: '#ready-to-play', label: 'Ready to play' },
  { href: '#difficulty', label: 'Difficulty levels' },
  { href: '#tips', label: 'Strategy tips' },
];

const HowToPlayContent = () => {
  return (
    <article className={cx('guide')} aria-labelledby="how-to-play-title">
      <aside className={cx('sidebar')}>
        <nav className={cx('toc')} aria-label="How to play sections">
          <p className={cx('tocTitle')}>Jump to a section</p>
          <ul className={cx('tocList')}>
            {TOC_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={item.href} className={cx('tocLink')}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className={cx('main')}>
        <header className={cx('hero')}>
          <div className={cx('heroCopy')}>
            <p className={cx('eyebrow')}>Player Guide</p>
            <h1 id="how-to-play-title">How to Play Minesweeper</h1>
            <p className={cx('lead')}>
              Learn the rules, controls, and clue patterns that guide every
              move.
            </p>
          </div>
        </header>

        <section id="objective" className={cx('section')}>
          <div className={cx('sectionHeader')}>
            <p className={cx('sectionEyebrow')}>Basics</p>
            <h2>Objective</h2>
          </div>
          <p>Reveal all safe cells to win the game.</p>
          <p>
            Use the numbers as clues and flag cells where you think mines are
            hidden.
          </p>
          <ol className={cx('steps')}>
            <li>Open a cell to see what&apos;s inside.</li>
            <li>Numbers show how many mines are around that cell.</li>
            <li>
              Flag cells that likely contain mines, then continue opening safe
              ones.
            </li>
          </ol>
          <ul className={cx('examples')}>
            <li className={cx('exampleCard')}>
              <div>
                <p className={cx('exampleTitle')}>Numbered safe cell</p>
                <p>
                  A number shows how many mines are in the surrounding cells.
                </p>
              </div>
              <CellExample variant="safe" />
            </li>
            <li className={cx('exampleCard')}>
              <div>
                <p className={cx('exampleTitle')}>Mine cell</p>
                <p>Opening a mine ends the round.</p>
              </div>
              <CellExample variant="mine" />
            </li>
            <li className={cx('exampleCard')}>
              <div>
                <p className={cx('exampleTitle')}>Flagged cell</p>
                <p>Flags mark cells where you believe a mine is located.</p>
              </div>
              <CellExample variant="flag" />
            </li>
          </ul>
        </section>

        <section id="numbers" className={cx('section')}>
          <div className={cx('sectionHeader')}>
            <p className={cx('sectionEyebrow')}>Reading the board</p>
            <h2>What the Numbers Mean</h2>
          </div>
          <p>
            Each number shows how many mines are in the 8 surrounding cells,
            including diagonals.
          </p>
          <p>
            For example, if a cell shows <strong>2</strong>, exactly two nearby
            cells contain mines.
          </p>
          <NumberClueDemo />
          <p>
            These numbers are always accurate and give you the clues you need
            to make safe moves.
          </p>
        </section>

        <section id="controls" className={cx('section')}>
          <div className={cx('sectionHeader')}>
            <p className={cx('sectionEyebrow')}>Input modes</p>
            <h2>Controls</h2>
          </div>
          <div className={cx('controlGrid')}>
            <article className={cx('controlCard')}>
              <p className={cx('controlLabel')}>Desktop</p>
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
              <p className={cx('controlLabel')}>Mobile</p>
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
              <p className={cx('controlLabel')}>Mobile</p>
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
          <aside className={cx('note')}>
            <span className={cx('noteLabel')}>First move protection</span>
            Your opening click or tap will not lose the game unless it is a
            restarted game.
          </aside>
        </section>

        <section id="markers" className={cx('section')}>
          <div className={cx('sectionHeader')}>
            <p className={cx('sectionEyebrow')}>Markers</p>
            <h2>Flags and Question Marks</h2>
          </div>
          <p>
            Use a flag when you are confident a cell contains a mine. Use a
            question mark when you are not sure yet.
          </p>
          <div className={cx('markerCycle')} aria-label="Marker cycle">
            <span className={cx('markerChip')}>
              <CellExample variant="flag" />
              <span>Flag</span>
            </span>
            <span className={cx('markerArrow')} aria-hidden>
              &rarr;
            </span>
            <span className={cx('markerChip')}>
              <CellExample variant="question" />
              <span>Question</span>
            </span>
            <span className={cx('markerArrow')} aria-hidden>
              &rarr;
            </span>
            <span className={cx('markerChip')}>
              <span className={cx('emptyMarker')}>Empty</span>
            </span>
          </div>
          <p>
            Question marks can be turned on or off in <strong>Settings</strong>.
          </p>
        </section>

        <section id="difficulty" className={cx('section')}>
          <div className={cx('sectionHeader')}>
            <p className={cx('sectionEyebrow')}>Choose a board</p>
            <h2>Difficulty Levels</h2>
          </div>
          <div className={cx('difficultyGrid')}>
            {DIFFICULTY_ROWS.map((row) => (
              <article key={row.name} className={cx('difficultyCard')}>
                <div className={cx('difficultyHeader')}>
                  <h3>{row.name}</h3>
                  <span className={cx('difficultyBadge')}>{row.mines} mines</span>
                </div>
                <dl className={cx('difficultyMeta')}>
                  <div>
                    <dt>Board</dt>
                    <dd>{row.board}</dd>
                  </div>
                  <div>
                    <dt>Best for</dt>
                    <dd>{row.recommendedFor}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section id="tips" className={cx('section')}>
          <div className={cx('sectionHeader')}>
            <p className={cx('sectionEyebrow')}>Play smarter</p>
            <h2>Strategy Tips</h2>
          </div>
          <ul className={cx('tipsList')}>
            <li>Start near edges or corners to uncover larger safe areas.</li>
            <li>
              Take your time. Check each number against its surrounding cells.
            </li>
            <li>Use flags to stay organized and avoid repeated mistakes.</li>
            <li>
              If you get stuck, mark uncertain cells and explore another area.
            </li>
            <li>
              On mobile, zoom levels (S, M, L, XL) can make tapping easier.
            </li>
          </ul>
        </section>

        <section id="ready-to-play" className={cx('ready')}>
          <p className={cx('sectionEyebrow')}>Start a round</p>
          <h2>Ready to Play?</h2>
          <p>Open the board and put these rules into practice.</p>
          <Link href={ROUTES.GAME} className={cx('ctaLink')}>
            Start a New Game
          </Link>
        </section>
      </div>
    </article>
  );
};

export default HowToPlayContent;
