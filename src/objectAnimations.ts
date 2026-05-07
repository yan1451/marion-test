import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  Sprite,
  Spritesheet,
  Texture,
} from "pixi.js";
import { gsap } from "gsap";
import { LayoutContainer } from "@pixi/layout/components";
import { createWinAnimations } from "./winAnimation";

type ObjectAnimationOptions = {
  atlasJsonPath?: string;
  frameTexture?: Texture;
};

export async function createObjectAnimations(
  app: Application,
  {
    atlasJsonPath = "/assets/bank_roberry_slot/animation/objects/objects-1.json",
    frameTexture,
  }: ObjectAnimationOptions = {},
) {
  const objectsFramesData = await Assets.load(atlasJsonPath);
  const atlasImageFileName = objectsFramesData.data.meta.image
    .split("?")[0]
    .split("#")[0];
  const atlasBasePath = atlasJsonPath.substring(
    0,
    atlasJsonPath.lastIndexOf("/") + 1,
  );
  const atlasImagePath = `${atlasBasePath}${atlasImageFileName}`;
  const textureObjects = await Assets.load(atlasImagePath);
  const bgSprite = new Sprite(frameTexture);
  bgSprite.scale.set(1.7, 1);
  bgSprite.anchor.set(0, 1.6);

  bgSprite.layout = {
    position: "relative",
    top: 10,
    bottom: 0,
    maxHeight: 800,
    maxWidth: 1000,
  };

  const spriteSheet = new Spritesheet(textureObjects, objectsFramesData.data);
  await spriteSheet.parse();
  const InitialSpaceBetweenRows = 170;
  let spaceBetweenColumns = 90;

  const container = new LayoutContainer({
    layout: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      maxHeight: 800,
      maxWidth: 1000,
      gap: 50,
    },
  });
  container.sortableChildren = true;
  const animatedSprites: AnimatedSprite[] = [];
  const animations = Object.keys(spriteSheet.animations);
  const { container: winContainer, startWinLoop } =
    await createWinAnimations(app);
  winContainer.zIndex = 1000;

  let globalDelay = 0;

  function showWinAnimation() {
    startWinLoop();
    winContainer.visible = true;
    winContainer.alpha = 0;
    winContainer.position.set(500, 380);

    // Adiciona só uma vez e mantém no topo
    if (!winContainer.parent) {
      container.addChild(winContainer);
    } else {
      container.setChildIndex(winContainer, container.children.length - 1);
    }

    gsap.to(winContainer, {
      alpha: 1,
      duration: 0.8,
      ease: "power2.out",
    });
  }

  for (let i = 0; i < 6; i++) {
    const columnContainer = new Container();
    columnContainer.position.set(spaceBetweenColumns, InitialSpaceBetweenRows);
    container.addChild(columnContainer);

    [0, 1, 2, 3, 4].forEach((index) => {
      const animationKey =
        animations[Math.floor(Math.random() * animations.length)];
      const sprite = new AnimatedSprite(spriteSheet.animations[animationKey]);

      const targetY = index * 120;

      sprite.x = 0;
      sprite.y = -500;
      sprite.anchor.set(0.45, 0.45);
      sprite.scale.set(0.67);
      sprite.animationSpeed = 0.4;

      columnContainer.addChild(sprite);
      animatedSprites.push(sprite);

      gsap.to(sprite, {
        y: targetY,
        duration: 1.2,
        delay: globalDelay * 0.1,
        ease: "back.out(1.5)",
        onComplete: async () => {
          if (i === 5 && index === 4) {
            gsap.delayedCall(2, () => {
              showWinAnimation();
            });
          }
        },
      });
      sprite.play();
      globalDelay++;
    });

    spaceBetweenColumns += 160;
  }

  container.addChildAt(bgSprite, 0);
  return { container, animatedSprites };
}
