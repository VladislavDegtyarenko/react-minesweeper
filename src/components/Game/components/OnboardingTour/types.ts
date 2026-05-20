export type TourTargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
};

export type TourCellTarget = {
  type: 'cell';
  rowIndex: number;
  cellIndex: number;
};

export type TourCellGroupTarget = {
  type: 'cell-group';
  cells: TourCellTarget[];
};

export type TourElementTarget = {
  type: 'tour-id';
  tourId: string;
};

export type TourTarget =
  | TourCellTarget
  | TourCellGroupTarget
  | TourElementTarget
  | null;

export type TourStepId =
  | 'open-cell'
  | 'read-number'
  | 'place-flag'
  | 'win-condition'
  | 'settings';

export type FlagStepPhase = 'control' | 'cell';

export type TourStepContent = {
  title: string;
  body: string;
  target: TourTarget;
  canUseNext: boolean;
};
