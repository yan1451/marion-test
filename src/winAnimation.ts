import {
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  Texture,
} from "pixi.js";
import { playTextures, startAnimationLoop, type AnimationEntry } from "./aux";
import { loadAnimationFramesFromMultipack } from "./multipackLoader";
import {
  AnimationDurationSeconds,
  DEFAULT_UNIFORM_SCALE,
} from "./animationConstants";

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
  SUPER_MEGA_WIN: { anchor: { x: 0.5, y: 0.5 }, speed: 0.5 },
  TOTAL_WIN: { anchor: { x: 0.5, y: 0.5 }, speed: 0.5 },
};

const WIN_OVERLAY = {
  color: 0x000000,
  alpha: 0.7,
} as const;

export async function createWinAnimations(
  _app: Application,
  {
    atlasJsonPath = "/assets/bank_roberry_slot/animation/wins/win-0.json",
    bigWinAnimationName = "Big_Win",
    megaWinAnimationName = "Mega_Win",
    superMegaWinAnimationName = "Super_Mega_Win",
    totalWinAnimationName = "Total_Win",
  }: WinAnimationOptions = {},
) {
  const container = new Container();
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

  const getTexturesByAnimation = (animationName: string): Texture[] =>
    winFrames
      .filter((frame) => frame.frameName.startsWith(`${animationName}_`))
      .map((frame) => frame.texture);

  const bigWinTextures = getTexturesByAnimation(bigWinAnimationName);
  const megaWinTextures = getTexturesByAnimation(megaWinAnimationName);
  const superMegaWinTextures = getTexturesByAnimation(
    superMegaWinAnimationName,
  );
  const totalWinTextures = getTexturesByAnimation(totalWinAnimationName);

  const animatedSprite = new AnimatedSprite(bigWinTextures);
  animatedSprite.position.set(_app.screen.width / 2, _app.screen.height / 2);

  playTextures(animatedSprite, bigWinTextures, WIN_CONFIG.BIG_WIN);

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

  container.addChild(animatedSprite);

  const startWinLoop = () => {
    playTextures(animatedSprite, bigWinTextures, WIN_CONFIG.BIG_WIN);
    startAnimationLoop(animatedSprite, loopSequence);
  };

  const stopWinLoop = () => {
    animatedSprite.gotoAndStop(0);
  };

  return { container, startWinLoop, stopWinLoop };
}
