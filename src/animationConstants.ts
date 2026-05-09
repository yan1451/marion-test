export enum LayerZIndex {
  Fox = 2,
  Objects = 1,
  WinOverlay = 1000,
}

export const AnimationDurationSeconds = {
  FoxIdle: 6,
  FoxWin: 2,
  BigWin: 4,
  MegaWin: 3,
  SuperMegaWin: 3,
  TotalWin: 3,
} as const;

export const DEFAULT_UNIFORM_SCALE = 0.8;
