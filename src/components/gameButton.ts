import { Assets, Sprite } from "pixi.js";

type GameButtonOptions = {
  texturePath: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  anchor?: number;
  interactive?: boolean;
};

export async function createGameButton({
  texturePath,
  x,
  y,
  scaleX,
  scaleY,
  anchor,
  interactive = true,
}: GameButtonOptions) {
  const button = new Sprite(await Assets.load(texturePath));

  if (anchor !== undefined) {
    button.anchor.set(anchor);
  }

  button.x = x;
  button.y = y;
  button.scale.set(scaleX, scaleY);

  if (interactive) {
    button.eventMode = "static";
    button.cursor = "pointer";
  }

  return button;
}
