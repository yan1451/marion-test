import { AnimatedSprite, Texture } from "pixi.js";
import { gsap } from "gsap";
import { Text } from "pixi.js";

export type AnimationConfig = {
  anchor: { x: number; y: number };
  speed: number;
};

export type AnimationEntry = {
  textures: Texture[];
  config: AnimationConfig;
  duration: number;
  scaleX?: number;
  scaleY?: number;
  loop?: boolean;
};

export function playTextures(
  sprite: AnimatedSprite,
  textures: Texture[],
  config: AnimationConfig,
  scaleX?: number,
  scaleY?: number,
) {
  sprite.textures = textures;
  sprite.animationSpeed = 0.5;
  sprite.scale.set(scaleX ?? 1, scaleY ?? 1);
  sprite.anchor.set(config.anchor.x, config.anchor.y);
  sprite.gotoAndPlay(0);
}

let activeDelayedCalls: gsap.core.Tween[] = [];

export function startAnimationLoop(
  sprite: AnimatedSprite,
  sequence: AnimationEntry[],
  options: {
    repeat?: boolean;
    onComplete?: () => void;
  },
) {
  const { repeat = true, onComplete } = options;

  if (!sequence.length) return;

  activeDelayedCalls.forEach((call) => call.kill());
  activeDelayedCalls = [];

  const runStep = (index: number) => {
    if (index >= sequence.length) {
      sprite.stop();
      return;
    }

    const step = sequence[index];

    sprite.loop = step.loop ?? false;

    sprite.onComplete = undefined;

    playTextures(sprite, step.textures, step.config, step.scaleX, step.scaleY);

    const call = gsap.delayedCall(step.duration, () => {
      if (index < sequence.length - 1) {
        runStep(index + 1);
        return;
      }
      if (repeat) {
        runStep(0);
        return;
      }
      sprite.stop();
      onComplete?.();
    });

    activeDelayedCalls.push(call);
  };

  runStep(0);
}

export function animateWinCounter(
  textSprite: Text,
  targetValue: number,
  durationSeconds: number,
) {
  const counterProxy = { value: 0 };
  gsap.to(counterProxy, {
    value: targetValue,
    duration: durationSeconds,
    ease: "power1.out",
    onUpdate: () => {
      const currentValue = counterProxy.value.toFixed(2);

      textSprite.text = `$ ${currentValue}`;
    },
    onComplete: () => {
      textSprite.text = `$ ${targetValue}`;
    },
  });
}

export const getTexturesByAnimation = (
  frames: { frameName: string; texture: Texture }[],
  animationName: string,
): Texture[] =>
  frames
    .filter((frame) => frame.frameName.startsWith(`${animationName}_`))
    .map((frame) => frame.texture);
