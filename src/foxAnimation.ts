import { AnimatedSprite, Application, Container } from "pixi.js";
import {
  startAnimationLoop,
  type AnimationEntry,
  getTexturesByAnimation,
} from "./aux";
import { loadAnimationFramesFromMultipack } from "./multipackLoader";
import { AnimationDurationSeconds, DEFAULT_UNIFORM_SCALE } from "./constants";

const FOX_CONFIG = {
  IDLE: { anchor: { x: 1, y: -0.85 }, speed: 0.5 },
  WIN: { anchor: { x: 0.935, y: -0.82 }, speed: 0.5 },
};

const FOX_LAYOUT = {
  scaleX: -DEFAULT_UNIFORM_SCALE,
  scaleY: DEFAULT_UNIFORM_SCALE,
  wrapperWidth: 300,
  wrapperHeight: 1000,
} as const;

type FoxAnimationOptions = {
  atlasJsonPath: string;
  idleAnimationName?: string;
  winAnimationName?: string;
};

export async function createFoxAnimation(
  _app: Application,
  {
    atlasJsonPath,
    idleAnimationName = "Fox-Idle",
    winAnimationName = "Idle",
  }: FoxAnimationOptions,
) {
  const foxFrames = await loadAnimationFramesFromMultipack({
    atlasJsonPath,
    animationNames: [idleAnimationName, winAnimationName],
    sortFramesByIndex: true,
  });

  const idleTextures = getTexturesByAnimation(foxFrames, idleAnimationName);
  const winTextures = getTexturesByAnimation(foxFrames, winAnimationName);

  if (!idleTextures.length || !winTextures.length) {
    throw new Error("Animacoes do fox nao encontradas no atlas multipack.");
  }

  const animatedSprite = new AnimatedSprite(idleTextures);

  const loopSequence: AnimationEntry[] = [
    {
      scaleX: FOX_LAYOUT.scaleX,
      textures: idleTextures,
      config: FOX_CONFIG.IDLE,
      duration: AnimationDurationSeconds.FoxIdle,
      loop: true,
      scaleY: FOX_LAYOUT.scaleY,
    },
    {
      scaleX: FOX_LAYOUT.scaleX,
      textures: winTextures,
      config: FOX_CONFIG.WIN,
      duration: AnimationDurationSeconds.FoxWin,
      loop: true,
      scaleY: FOX_LAYOUT.scaleY,
    },
  ];

  startAnimationLoop(animatedSprite, loopSequence, { repeat: true });

  const foxWrapper = new Container({
    layout: {
      width: FOX_LAYOUT.wrapperWidth,
      height: FOX_LAYOUT.wrapperHeight,
    },
  });

  foxWrapper.addChild(animatedSprite);

  return foxWrapper;
}
