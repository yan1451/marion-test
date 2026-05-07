import { AnimatedSprite, Texture } from "pixi.js";
import { gsap } from "gsap";

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
  sprite.animationSpeed = config.speed;
  sprite.scale.set(scaleX || 1, scaleY || 1);
  sprite.anchor.set(config.anchor.x, config.anchor.y);
  sprite.gotoAndPlay(0);
}

export function startAnimationLoop(
  sprite: AnimatedSprite,
  sequence: AnimationEntry[],
) {
  if (!sequence.length) return;

  const runStep = (index: number) => {
    const step = sequence[index % sequence.length];
    playTextures(sprite, step.textures, step.config, step.scaleX, step.scaleY);

    if (step.loop) {
      gsap.delayedCall(step.duration, () => {
        runStep(index + 1);
      });
    } else {
      gsap.delayedCall(step.duration, () => {
        sprite.gotoAndStop(0);
      });
    }
  };

  runStep(0);
}
