type OpenedCell = {
  isOpened: true;
  mark: null;
};

type ClosedCell = {
  isOpened: false;
  mark: "flag" | "question" | null;
};

type MineCell = {
  value: "mine";
  hightlight?: "red" | "green";
};

type NumberCell = {
  value: number;
};

export type OpenedMineCell = OpenedCell & MineCell;
type ClosedMineCell = ClosedCell & MineCell;
export type OpenedNumberCell = OpenedCell & NumberCell;
type ClosedNumberCell = ClosedCell & NumberCell;

type EmptyCell = {
  value: null;
  mark: null;
  isOpened: false;
};

export type GameCell =
  | OpenedMineCell
  | ClosedMineCell
  | OpenedNumberCell
  | ClosedNumberCell
  | EmptyCell;

export type Board = GameCell[][];
