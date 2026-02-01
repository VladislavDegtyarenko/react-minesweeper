import ToggleGroup from '@/components/ui/ToggleGroup';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';
import LabelWithInfoDialog from '@/components/ui/LabelWithInfoDialog';
import { useSettingsStore } from '@/store/settings';
import { setIsQuestionMarkEnabled } from '@/store/settings/actions';
import {
  selectIsQuestionMarkEnabled,
  selectIsTouchScreen,
} from '@/store/settings/selectors';

const QUESTION_MARK_TOGGLE_VALUES = {
  On: 'on',
  Off: 'off',
} as const;

const QUESTION_MARK_OPTION_LABELS = {
  On: 'On',
  Off: 'Off',
} as const;

const QUESTION_MARK_TOGGLE_OPTIONS = [
  { value: QUESTION_MARK_TOGGLE_VALUES.On, label: QUESTION_MARK_OPTION_LABELS.On },
  { value: QUESTION_MARK_TOGGLE_VALUES.Off, label: QUESTION_MARK_OPTION_LABELS.Off },
] as const;

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
  const questionMarkValue = isQuestionMarkEnabled
    ? QUESTION_MARK_TOGGLE_VALUES.On
    : QUESTION_MARK_TOGGLE_VALUES.Off;

  const handleQuestionMarkChange = (value: string) => {
    if (!value) {
      return undefined;
    }

    setIsQuestionMarkEnabled(value === QUESTION_MARK_TOGGLE_VALUES.On);
  };

  return (
    <ToggleGroup
      label={
        <LabelWithInfoDialog
          label={QUESTION_MARK_LABEL}
          dialogTitle={QUESTION_MARK_DIALOG_TITLE}
          items={questionMarkInfoItems}
        />
      }
      type="single"
      value={questionMarkValue}
      defaultValue={questionMarkValue}
      aria-label={QUESTION_MARK_ARIA_LABEL}
      onValueChange={handleQuestionMarkChange}
      loop={true}
    >
      {QUESTION_MARK_TOGGLE_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          label={option.label}
        />
      ))}
    </ToggleGroup>
  );
};

export default ToggleQuestionMark;
