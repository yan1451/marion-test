import {
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  Text,
  Assets,
} from "pixi.js";
import {
  startAnimationLoop,
  type AnimationEntry,
  animateWinCounter,
  getTexturesByAnimation,
} from "./aux";
import { loadAnimationFramesFromMultipack } from "./multipackLoader";
import { AnimationDurationSeconds, DEFAULT_UNIFORM_SCALE } from "./constants";
import { paths } from "./constants";

type WinAnimationOptions = {
  atlasJsonPath?: string;
  bigWinAnimationName?: string;
  megaWinAnimationName?: string;
  superMegaWinAnimationName?: string;
  totalWinAnimationName?: string;
};

const WIN_CONFIG = {
  BIG_WIN: { anchor: { x: 0.5, y: 0.5 }, speed: 0.5 },
  MEGA_WIN: { anchor: { x: 0.5, y: 0.5 }, speed: 0.5 },
  SUPER_MEGA_WIN: { anchor: { x: 0.5, y: 0.54 }, speed: 0.5 },
  TOTAL_WIN: { anchor: { x: 0.5, y: 0.5 }, speed: 0.5 },
};

const WIN_OVERLAY = {
  color: 0x000000,
  alpha: 0.7,
} as const;

export async function createWinAnimations(
  _app: Application,
  {
    atlasJsonPath = paths.wins,
    bigWinAnimationName = "Big_Win",
    megaWinAnimationName = "Mega_Win",
    superMegaWinAnimationName = "Super_Mega_Win",
    totalWinAnimationName = "Total_Win",
  }: WinAnimationOptions = {},
) {
  const container = new Container();

  const font = await Assets.load(paths.font);

  const winCounterText = new Text({
    text: "0",
    style: {
      fill: "#e5d206",
      fontFamily: font.family,
      fontSize: 100,
      fontWeight: "bold",
      stroke: "#ff4d00",
    },
  });

  winCounterText.position.set(_app.screen.width / 2, _app.screen.height / 2.2);
  winCounterText.anchor.set(0.5, 0.5);

  container.visible = false;
  container.eventMode = "none";
  container.alpha = 0;

  const background = new Graphics();
  background
    .rect(0, 0, _app.screen.width, _app.screen.height)
    .fill({ color: WIN_OVERLAY.color, alpha: WIN_OVERLAY.alpha });
  container.addChild(background);

  const winFrames = await loadAnimationFramesFromMultipack({
    atlasJsonPath,
    animationNames: [
      bigWinAnimationName,
      megaWinAnimationName,
      superMegaWinAnimationName,
      totalWinAnimationName,
    ],
    sortFramesByIndex: true,
  });

  const bigWinTextures = getTexturesByAnimation(winFrames, bigWinAnimationName);
  const megaWinTextures = getTexturesByAnimation(
    winFrames,
    megaWinAnimationName,
  );
  const superMegaWinTextures = getTexturesByAnimation(
    winFrames,
    superMegaWinAnimationName,
  );
  const totalWinTextures = getTexturesByAnimation(
    winFrames,
    totalWinAnimationName,
  );

  const animatedSprite = new AnimatedSprite(bigWinTextures);
  animatedSprite.position.set(_app.screen.width / 2, _app.screen.height / 2);

  const loopSequence: AnimationEntry[] = [
    {
      textures: bigWinTextures,
      config: WIN_CONFIG.BIG_WIN,
      duration: AnimationDurationSeconds.BigWin,
      loop: true,
      scaleX: DEFAULT_UNIFORM_SCALE,
      scaleY: DEFAULT_UNIFORM_SCALE,
    },
    {
      textures: megaWinTextures,
      config: WIN_CONFIG.MEGA_WIN,
      duration: AnimationDurationSeconds.MegaWin,
      loop: true,
      scaleX: DEFAULT_UNIFORM_SCALE,
      scaleY: DEFAULT_UNIFORM_SCALE,
    },
    {
      textures: superMegaWinTextures,
      config: WIN_CONFIG.SUPER_MEGA_WIN,
      duration: AnimationDurationSeconds.SuperMegaWin,
      loop: true,
      scaleX: DEFAULT_UNIFORM_SCALE,
      scaleY: DEFAULT_UNIFORM_SCALE,
    },
    {
      textures: totalWinTextures,
      config: WIN_CONFIG.TOTAL_WIN,
      duration: AnimationDurationSeconds.TotalWin,
      loop: false,
      scaleX: DEFAULT_UNIFORM_SCALE,
      scaleY: DEFAULT_UNIFORM_SCALE,
    },
  ];

  const startWinLoop = (winAmount: number) => {
    container.addChild(animatedSprite);
    container.addChild(winCounterText);
    animateWinCounter(
      winCounterText,
      winAmount,
      AnimationDurationSeconds.FoxIdle,
    );
    return new Promise<void>((resolve) => {
      startAnimationLoop(animatedSprite, loopSequence, {
        repeat: false,
        onComplete: resolve,
      });
    });
  };

  const stopWinLoop = () => {
    animatedSprite.gotoAndStop(0);
    container.removeChild(animatedSprite);
  };

  return { container, startWinLoop, stopWinLoop };
}
