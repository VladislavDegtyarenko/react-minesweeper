import LabelWithInfoDialog from '@/components/ui/LabelWithInfoDialog';
import Switch from '@/components/ui/Switch';
import { useSettingsStore } from '@/store/settings';
import { setIsQuestionMarkEnabled } from '@/store/settings/actions';
import {
  selectIsQuestionMarkEnabled,
  selectIsTouchScreen,
} from '@/store/settings/selectors';
import { createCx } from '@/utils';
import styles from '../styles.module.scss';

const cx = createCx(styles);

const QUESTION_MARK_OPTION_LABELS = {
  On: 'On',
  Off: 'Off',
} as const;

const QUESTION_MARK_LABEL = 'Question Marks';
const QUESTION_MARK_ARIA_LABEL = 'Question marks';
const QUESTION_MARK_DIALOG_TITLE = 'Question Mark Modes';
const QUESTION_MARK_INPUT_LABELS = {
  Touch: 'Long-press',
  Pointer: 'Right-click',
} as const;
const QUESTION_MARK_DESC_PREFIX = 'cycles through Flag, Question, then empty.';
const QUESTION_MARK_DESC_TOGGLE = 'toggles between Flag and empty only.';

const getQuestionMarkInfoItems = (inputLabel: string) => {
  return [
    {
      title: QUESTION_MARK_OPTION_LABELS.On,
      description: `${inputLabel} ${QUESTION_MARK_DESC_PREFIX}`,
    },
    {
      title: QUESTION_MARK_OPTION_LABELS.Off,
      description: `${inputLabel} ${QUESTION_MARK_DESC_TOGGLE}`,
    },
  ];
};

const ToggleQuestionMark = () => {
  const isQuestionMarkEnabled = useSettingsStore(selectIsQuestionMarkEnabled);
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);
  const questionMarkInputLabel = isTouchScreen
    ? QUESTION_MARK_INPUT_LABELS.Touch
    : QUESTION_MARK_INPUT_LABELS.Pointer;
  const questionMarkInfoItems = getQuestionMarkInfoItems(
    questionMarkInputLabel,
  );

  return (
    <div className={cx('row')}>
      <span className={cx('label')}>
        <LabelWithInfoDialog
          label={QUESTION_MARK_LABEL}
          dialogTitle={QUESTION_MARK_DIALOG_TITLE}
          items={questionMarkInfoItems}
        />
      </span>
      <Switch
        checked={isQuestionMarkEnabled}
        onCheckedChange={setIsQuestionMarkEnabled}
        ariaLabel={QUESTION_MARK_ARIA_LABEL}
      />
    </div>
  );
};

export default ToggleQuestionMark;
