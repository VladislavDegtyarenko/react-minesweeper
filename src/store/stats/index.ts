export { useStatsStore } from './store';
export {
  selectBestTimeByLevel,
  selectBestTimesByLevel,
  selectHasPresentedWinDialog,
  selectIsWinDialogOpen,
  selectLastWinSummary,
} from './selectors';
export type {
  BestTimesByLevel,
  LastWinSummary,
  StatsState,
} from './types';

import './subscriptions';
