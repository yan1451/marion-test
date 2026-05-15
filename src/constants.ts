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
  TotalWin: 2,
} as const;

export const paths = {
  font: "/assets/bank_roberry_slot/fonts/GROBOLD.TTF",
  background: "/assets/bank_roberry_slot/animation/BACKGROUND.png",
  topBackgroundFrame: "/assets/bank_roberry_slot/animation/main_game.png",
  bottomBackgroundFrame:
    "/assets/bank_roberry_slot/animation/footer_main_game.png",
  fox: "/assets/bank_roberry_slot/animation/fox/fox-1.json",
  objects: "/assets/bank_roberry_slot/animation/objects/objects-1.json",
  wins: "/assets/bank_roberry_slot/animation/wins/win-0.json",
  button: "/assets/bank_roberry_slot/animation/button.png",
  buttonBet: "/assets/bank_roberry_slot/animation/button_bet.png",
  buttonReroll: "/assets/bank_roberry_slot/animation/button_reroll.png",
} as const;

export const DEFAULT_UNIFORM_SCALE = 0.8;

export const OBJECT_LAYOUT = {
  bgScaleX: 1.7,
  bgScaleY: 1,
  bgAnchorX: 0,
  bgAnchorY: 1.6,
  bgTop: 10,
  bgBottom: 0,
  maxHeight: 800,
  maxWidth: 1000,
  containerGap: 50,
  startY: 170,
  startX: 90,
  columnCount: 6,
  rowCount: 5,
  rowSpacing: 120,
  columnSpacing: 152,
  spriteStartX: 0,
  spriteAnchorX: 0.45,
  spriteAnchorY: 0.45,
  spriteScale: 0.67,
  spriteSpeed: 0.4,
  winFadeDuration: 0.4,
  dropDuration: 0.02,
  dropEase: "none",
} as const;
