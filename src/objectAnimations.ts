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
import { LayerZIndex } from "./animationConstants";

type ObjectAnimationOptions = {
  atlasJsonPath?: string;
  frameTexture?: Texture;
};

const OBJECT_LAYOUT = {
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
  spriteStartY: -500,
  spriteAnchorX: 0.45,
  spriteAnchorY: 0.45,
  spriteScale: 0.67,
  spriteSpeed: 0.4,
  winFadeDuration: 0.4,
  dropDuration: 0.1,
  delayStep: 0.02,
  dropEase: "none",
  showWinDelay: 0.5,
  winLoopDuration: 12,
} as const;

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
  bgSprite.scale.set(OBJECT_LAYOUT.bgScaleX, OBJECT_LAYOUT.bgScaleY);
  bgSprite.anchor.set(OBJECT_LAYOUT.bgAnchorX, OBJECT_LAYOUT.bgAnchorY);

  bgSprite.layout = {
    position: "relative",
    top: OBJECT_LAYOUT.bgTop,
    bottom: OBJECT_LAYOUT.bgBottom,
    maxHeight: OBJECT_LAYOUT.maxHeight,
    maxWidth: OBJECT_LAYOUT.maxWidth,
  };

  const spriteSheet = new Spritesheet(textureObjects, objectsFramesData.data);
  await spriteSheet.parse();
  const initialY = OBJECT_LAYOUT.startY;

  const container = new LayoutContainer({
    layout: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      maxHeight: OBJECT_LAYOUT.maxHeight,
      maxWidth: OBJECT_LAYOUT.maxWidth,
      gap: OBJECT_LAYOUT.containerGap,
      marginLeft: 130,
    },
  });

  container.sortableChildren = true;
  const animatedSprites: AnimatedSprite[] = [];
  const animations = Object.keys(spriteSheet.animations);
  const {
    container: winContainer,
    startWinLoop,
    stopWinLoop,
  } = await createWinAnimations(app);
  winContainer.zIndex = LayerZIndex.WinOverlay;

  function showWinAnimation(onFinished: () => void) {
    startWinLoop();
    winContainer.visible = true;
    winContainer.alpha = 0;
    winContainer.position.set(0, 0);

    app.stage.sortableChildren = true;

    // Adiciona só uma vez e mantém no topo
    if (!winContainer.parent) {
      app.stage.addChild(winContainer);
    } else {
      app.stage.setChildIndex(winContainer, app.stage.children.length - 1);
    }

    gsap.to(winContainer, {
      alpha: 1,
      duration: OBJECT_LAYOUT.winFadeDuration,
      ease: "power2.out",
      onComplete: () => {
        gsap.delayedCall(OBJECT_LAYOUT.winLoopDuration, () => {
          stopWinLoop();
          winContainer.visible = false;
          onFinished();
        });
      },
    });
  }

  const startObjectAnimations = ({ animate }: { animate: boolean }) => {
    return new Promise((resolve) => {
      animatedSprites.forEach((sprite) => sprite.destroy());
      animatedSprites.length = 0;
      let columnX = OBJECT_LAYOUT.startX;
      let globalDelay = 0;

      for (let i = 0; i < OBJECT_LAYOUT.columnCount; i++) {
        const columnContainer = new Container();
        columnContainer.position.set(columnX, initialY);
        container.addChild(columnContainer);

        Array.from(
          { length: OBJECT_LAYOUT.rowCount },
          (_, rowIndex) => rowIndex,
        ).forEach((rowIndex) => {
          const animationKey =
            animations[Math.floor(Math.random() * animations.length)];
          const sprite = new AnimatedSprite(
            spriteSheet.animations[animationKey],
          );

          const targetY = rowIndex * OBJECT_LAYOUT.rowSpacing;

          sprite.x = OBJECT_LAYOUT.spriteStartX;
          sprite.y = OBJECT_LAYOUT.spriteStartY;
          sprite.anchor.set(
            OBJECT_LAYOUT.spriteAnchorX,
            OBJECT_LAYOUT.spriteAnchorY,
          );
          sprite.scale.set(OBJECT_LAYOUT.spriteScale);
          sprite.animationSpeed = OBJECT_LAYOUT.spriteSpeed;

          columnContainer.addChild(sprite);
          animatedSprites.push(sprite);

          if (animate) {
            gsap.to(sprite, {
              y: targetY,
              duration: OBJECT_LAYOUT.dropDuration,
              delay: globalDelay * OBJECT_LAYOUT.delayStep,
              ease: OBJECT_LAYOUT.dropEase,
              onComplete: async () => {
                if (
                  i === OBJECT_LAYOUT.columnCount - 1 &&
                  rowIndex === OBJECT_LAYOUT.rowCount - 1
                ) {
                  gsap.delayedCall(OBJECT_LAYOUT.showWinDelay, () => {
                    showWinAnimation(() => {
                      resolve(true);
                    });
                  });
                }
              },
            });
          } else {
            sprite.y = targetY;
          }

          sprite.play();
          globalDelay++;
        });
        console.log(columnX);
        columnX += OBJECT_LAYOUT.columnSpacing;
      }
    });
  };

  startObjectAnimations({ animate: false });

  container.addChildAt(bgSprite, 0);
  return { container, animatedSprites, startObjectAnimations };
}
