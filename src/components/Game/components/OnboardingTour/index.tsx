import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import { LOCAL_STORAGE_KEYS } from '@/constants';
import { useGameStore } from '@/store/game';
import { setOnboardingTourOpen } from '@/store/game/actions';
import { ControlModes, DigFlag, useSettingsStore } from '@/store/settings';
import {
  selectControlMode,
  selectDigFlag,
  selectIsTouchScreen,
} from '@/store/settings/selectors';
import { createCx, localStorageService } from '@/utils';
import {
  TOUR_STEP_ADVANCE_DELAY_MS,
  TOUR_STEP_COUNT,
  TOUR_STEP_IDS,
} from './constants';
import type { FlagStepPhase, TourCellTarget, TourTargetRect } from './types';
import {
  findClosedMineTarget,
  findOpeningCellTarget,
  findRevealedNumberTarget,
  getTourBlockerStyles,
  getTourCardStyle,
  getTourCellSelector,
  getTourStepContent,
  getTourTargetRect,
  isCellFlagged,
  isCellOpened,
  scrollTourTargetIntoView,
} from './utils';
import styles from './styles.module.scss';
import { useResizeObserver } from '@/hooks';

const cx = createCx(styles);

type OnboardingTourProps = {
  shouldReplay: boolean;
};

const markTourSeen = () => {
  localStorageService.set(LOCAL_STORAGE_KEYS.ONBOARDING_SEEN_V1, true);
};

const shouldDelayStepTransition = (
  currentStepIndex: number,
  nextStepIndex: number,
) => currentStepIndex !== nextStepIndex;

const OnboardingTour = ({ shouldReplay }: OnboardingTourProps) => {
  const board = useGameStore((state) => state.board);
  const minesLeft = useGameStore(
    (state) => state.level.totalMines - state.totalFlags,
  );
  const controlMode = useSettingsStore(selectControlMode);
  const digFlag = useSettingsStore(selectDigFlag);
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TourTargetRect | null>(null);
  const [openCellTarget, setOpenCellTarget] = useState<TourCellTarget | null>(
    null,
  );
  const [flagCellTarget, setFlagCellTarget] = useState<TourCellTarget | null>(
    null,
  );
  const [flagPhase, setFlagPhase] = useState<FlagStepPhase>('control');
  const [hasAdvancedFromOpenStep, setHasAdvancedFromOpenStep] = useState(false);
  const [hasAdvancedFromFlagStep, setHasAdvancedFromFlagStep] = useState(false);
  const [pendingStepIndex, setPendingStepIndex] = useState<number | null>(null);
  const stepTransitionTimeoutRef = useRef<number | null>(null);
  const stepId = TOUR_STEP_IDS[stepIndex] ?? TOUR_STEP_IDS[0];
  const isStepTransitionPending = pendingStepIndex !== null;
  const numberCellTarget = useMemo(
    () => findRevealedNumberTarget(board),
    [board],
  );
  const stepContent = useMemo(
    () =>
      getTourStepContent({
        board,
        controlMode,
        digFlag,
        flagCellTarget,
        flagPhase,
        isTouchScreen,
        numberCellTarget,
        openCellTarget,
        stepId,
      }),
    [
      board,
      controlMode,
      digFlag,
      flagCellTarget,
      flagPhase,
      isTouchScreen,
      numberCellTarget,
      openCellTarget,
      stepId,
    ],
  );
  const isLastStep = stepIndex === TOUR_STEP_IDS.length - 1;
  const cardStyle = useMemo(() => getTourCardStyle(targetRect), [targetRect]);
  const blockerStyles = useMemo(
    () => getTourBlockerStyles(targetRect),
    [targetRect],
  );
  const clearStepTransitionDelay = useCallback((shouldResetPending = true) => {
    if (stepTransitionTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(stepTransitionTimeoutRef.current);
    stepTransitionTimeoutRef.current = null;

    if (shouldResetPending) {
      setPendingStepIndex(null);
    }
  }, []);
  const moveToStep = useCallback(
    (nextStepIndex: number) => {
      if (
        pendingStepIndex !== null ||
        stepTransitionTimeoutRef.current !== null
      ) {
        return;
      }

      clearStepTransitionDelay();

      if (!shouldDelayStepTransition(stepIndex, nextStepIndex)) {
        setStepIndex(nextStepIndex);

        return;
      }

      setPendingStepIndex(nextStepIndex);
      stepTransitionTimeoutRef.current = window.setTimeout(() => {
        stepTransitionTimeoutRef.current = null;
        setPendingStepIndex(null);
        setStepIndex(nextStepIndex);
      }, TOUR_STEP_ADVANCE_DELAY_MS);
    },
    [clearStepTransitionDelay, pendingStepIndex, stepIndex],
  );

  useEffect(
    () => () => {
      clearStepTransitionDelay(false);
      setOnboardingTourOpen(false);
    },
    [clearStepTransitionDelay],
  );

  useEffect(() => {
    setOnboardingTourOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const hasSeenTour =
      localStorageService.get<boolean>(LOCAL_STORAGE_KEYS.ONBOARDING_SEEN_V1) ??
      false;

    if (!shouldReplay && hasSeenTour) {
      return undefined;
    }

    setStepIndex(0);
    setOpenCellTarget(null);
    setFlagCellTarget(null);
    setFlagPhase('control');
    setHasAdvancedFromOpenStep(false);
    setHasAdvancedFromFlagStep(false);
    clearStepTransitionDelay();
    setIsOpen(true);
  }, [clearStepTransitionDelay, shouldReplay]);

  useEffect(() => {
    if (!isOpen || stepId !== 'open-cell' || openCellTarget) {
      return undefined;
    }

    setOpenCellTarget(findOpeningCellTarget(board));
  }, [board, isOpen, openCellTarget, stepId]);

  useEffect(() => {
    if (!isOpen || stepId !== 'place-flag') {
      return undefined;
    }

    setFlagPhase(
      controlMode === ControlModes.Toggle && digFlag !== DigFlag.Flag
        ? 'control'
        : 'cell',
    );
  }, [controlMode, digFlag, isOpen, stepId]);

  useEffect(() => {
    if (
      !isOpen ||
      stepId !== 'place-flag' ||
      flagPhase !== 'cell' ||
      flagCellTarget ||
      minesLeft <= 0
    ) {
      return undefined;
    }

    setFlagCellTarget(findClosedMineTarget(board));
  }, [board, flagCellTarget, flagPhase, isOpen, minesLeft, stepId]);

  useEffect(() => {
    if (
      !isOpen ||
      stepId !== 'open-cell' ||
      !openCellTarget ||
      hasAdvancedFromOpenStep ||
      !isCellOpened(board, openCellTarget)
    ) {
      return undefined;
    }

    setHasAdvancedFromOpenStep(true);
    moveToStep(1);
  }, [
    board,
    hasAdvancedFromOpenStep,
    isOpen,
    moveToStep,
    openCellTarget,
    stepId,
  ]);

  useEffect(() => {
    if (
      !isOpen ||
      stepId !== 'place-flag' ||
      !flagCellTarget ||
      hasAdvancedFromFlagStep ||
      !isCellFlagged(board, flagCellTarget)
    ) {
      return undefined;
    }

    setHasAdvancedFromFlagStep(true);
    moveToStep(3);
  }, [
    board,
    flagCellTarget,
    hasAdvancedFromFlagStep,
    isOpen,
    moveToStep,
    stepId,
  ]);

  useEffect(() => {
    if (!isOpen || stepId !== 'read-number' || !numberCellTarget) {
      return undefined;
    }

    const selector = getTourCellSelector(numberCellTarget);
    const handlePointerUp = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element) || !target.closest(selector)) {
        return undefined;
      }

      moveToStep(2);
    };

    document.addEventListener('pointerup', handlePointerUp, true);

    return () => {
      document.removeEventListener('pointerup', handlePointerUp, true);
    };
  }, [isOpen, moveToStep, numberCellTarget, stepId]);

  const updateTargetRect = useCallback(() => {
    setTargetRect(getTourTargetRect(stepContent.target));
  }, [stepContent.target]);

  useResizeObserver(
    () => [document.body],
    () => {
      updateTargetRect();
      scrollTourTargetIntoView(stepContent.target);
    },
    [stepContent.target],
  );

  if (!isOpen) {
    return null;
  }

  const closeTour = () => {
    clearStepTransitionDelay();
    markTourSeen();
    setIsOpen(false);
  };

  const handleNextClick = () => {
    if (!stepContent.canUseNext) {
      return undefined;
    }

    if (isLastStep) {
      closeTour();

      return undefined;
    }

    moveToStep(Math.min(TOUR_STEP_IDS.length - 1, stepIndex + 1));
  };

  const handleBackClick = () => {
    moveToStep(Math.max(0, stepIndex - 1));
  };

  return (
    <div className={cx('tourLayer')} role="presentation">
      {blockerStyles.map((style, index) => (
        <div
          key={`${style.top}-${style.left}-${index}`}
          className={cx('blocker')}
          style={style}
        />
      ))}

      {targetRect ? (
        <div
          className={cx('spotlight')}
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
          }}
        />
      ) : null}

      <section
        aria-modal="true"
        className={cx('card', !targetRect && 'centered')}
        role="dialog"
        style={cardStyle}
      >
        <button
          aria-label="Skip tutorial"
          className={cx('closeButton')}
          type="button"
          onClick={closeTour}
        >
          <Cross2Icon />
        </button>

        <p className={cx('eyebrow')}>
          Step {stepIndex + 1} of {TOUR_STEP_COUNT}
        </p>
        <h2>{stepContent.title}</h2>
        <p className={cx('body')}>{stepContent.body}</p>

        <div className={cx('progress')} aria-hidden="true">
          {TOUR_STEP_IDS.map((tourStepId, index) => (
            <span
              key={tourStepId}
              className={cx('progressDot', index === stepIndex && 'activeDot')}
            />
          ))}
        </div>

        <div className={cx('actions')}>
          <Button
            className={cx('skipButton')}
            type="button"
            variant="secondary"
            onClick={closeTour}
          >
            Skip
          </Button>
          <Button
            type="button"
            variant="ghost"
            isDisabled={stepIndex === 0 || isStepTransitionPending}
            onClick={handleBackClick}
          >
            Back
          </Button>
          <Button
            type="button"
            variant="primary"
            isDisabled={!stepContent.canUseNext || isStepTransitionPending}
            onClick={handleNextClick}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default OnboardingTour;
