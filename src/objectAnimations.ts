import { Application, Texture } from "pixi.js";
import { createObjectReelsController } from "./objectAnimations/objectReels";
import { loadObjectSpritesheet } from "./objectAnimations/objectSpritesheet";
import { createObjectView } from "./objectAnimations/objectView";
import { createWinOverlayController } from "./objectAnimations/winOverlayController";

type ObjectAnimationOptions = {
  atlasJsonPath: string;
  topBackgroundFrameTexture?: Texture;
  bottomBackgroundFrameTexture?: Texture;
};

type StartObjectAnimationsOptions = {
  animate: boolean;
  matrix: string[][];
  winAmount: number;
};

export async function createObjectAnimations(
  app: Application,
  {
    atlasJsonPath,
    topBackgroundFrameTexture,
    bottomBackgroundFrameTexture,
  }: ObjectAnimationOptions,
) {
  const spriteSheet = await loadObjectSpritesheet(atlasJsonPath);

  const { container, reelsContainer } = createObjectView({
    topBackgroundFrameTexture,
    bottomBackgroundFrameTexture,
  });
  const { animatedSprites, startReels } = createObjectReelsController(
    reelsContainer,
    spriteSheet,
  );
  const { showWinAnimation } = await createWinOverlayController(app);

  const startObjectAnimations = ({
    animate,
    matrix,
    winAmount,
  }: StartObjectAnimationsOptions) => {
    return new Promise<boolean>((resolve) => {
      startReels({
        animate,
        matrix,
        onComplete: async () => {
          if (winAmount > 0) {
            await showWinAnimation(winAmount);
          }
          resolve(true);
        },
      });
    });
  };

  startObjectAnimations({ animate: false, matrix: [], winAmount: 0 });

  return { container, animatedSprites, startObjectAnimations };
}
