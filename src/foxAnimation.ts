import { AnimatedSprite, Application, Container, Texture } from "pixi.js";
import { startAnimationLoop, type AnimationEntry } from "./aux";
import { loadAnimationFramesFromMultipack } from "./multipackLoader";

const FOX_CONFIG = {
  IDLE: { anchor: { x: 1, y: -0.85 }, speed: 0.5 },
  WIN: { anchor: { x: 0.935, y: -0.82 }, speed: 0.5 },
};

type FoxAnimationOptions = {
  atlasJsonPath?: string;
  idleAnimationName?: string;
  winAnimationName?: string;
};

export async function createFoxAnimation(
  _app: Application,
  {
    atlasJsonPath = "/assets/bank_roberry_slot/animation/fox/fox-1.json",
    idleAnimationName = "Fox-Idle",
    winAnimationName = "Idle",
  }: FoxAnimationOptions = {},
) {
  const foxFrames = await loadAnimationFramesFromMultipack({
    atlasJsonPath,
    animationNames: [idleAnimationName, winAnimationName],
    sortFramesByIndex: true,
  });

  const getTexturesByAnimation = (animationName: string): Texture[] =>
    foxFrames
      .filter((frame) => frame.frameName.startsWith(`${animationName}_`))
      .map((frame) => frame.texture);

  const idleTextures = getTexturesByAnimation(idleAnimationName);
  const winTextures = getTexturesByAnimation(winAnimationName);

  if (!idleTextures.length || !winTextures.length) {
    throw new Error("Animacoes do fox nao encontradas no atlas multipack.");
  }

  const animatedSprite = new AnimatedSprite(idleTextures);

  const loopSequence: AnimationEntry[] = [
    {
      scaleX: -0.8,
      textures: idleTextures,
      config: FOX_CONFIG.IDLE,
      duration: 6,
      loop: true,
      scaleY: 0.8,
    },
    {
      scaleX: -0.8,
      textures: winTextures,
      config: FOX_CONFIG.WIN,
      duration: 2,
      loop: true,
      scaleY: 0.8,
    },
  ];

  startAnimationLoop(animatedSprite, loopSequence);

  const foxWrapper = new Container({
    layout: {
      width: 300,
      height: 1000,
    },
  });

  foxWrapper.addChild(animatedSprite);

  return foxWrapper;
}
