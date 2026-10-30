import type { ComponentProps } from 'react';
import { useStoryValue } from '@/storybook/useStoryValue';
import ScoreSyncNotice from '../../index';

type Props = ComponentProps<typeof ScoreSyncNotice>;

const InteractiveRetry = ({
  isRetrying,
  message,
  onRetry,
  ...props
}: Props) => {
  const [pending, setPending] = useStoryValue(isRetrying);
  const [currentMessage, setCurrentMessage] = useStoryValue(message);

  const handleRetry = async () => {
    setPending(true);

    try {
      await onRetry();
    } catch (error) {
      setCurrentMessage(
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <ScoreSyncNotice
      {...props}
      isRetrying={pending}
      message={currentMessage}
      onRetry={handleRetry}
    />
  );
};

export default InteractiveRetry;
