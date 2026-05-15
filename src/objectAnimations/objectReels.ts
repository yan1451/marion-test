import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { gsap } from "gsap";
import { OBJECT_LAYOUT } from "../constants";

type StartReelsOptions = {
  animate: boolean;
  matrix: string[][];
  onComplete: () => void;
};

export function createObjectReelsController(
  reelsContainer: Container,
  spriteSheet: Spritesheet,
) {
  const animatedSprites: AnimatedSprite[] = [];
  const animations = Object.keys(spriteSheet.animations);

  function clearReels() {
    animatedSprites.forEach((sprite) => sprite.destroy());
    animatedSprites.length = 0;

    while (reelsContainer.children.length > 0) {
      reelsContainer.children[0].destroy({ children: true });
    }
  }

  function startReels({ animate, matrix, onComplete }: StartReelsOptions) {
    clearReels();

    let columnX = OBJECT_LAYOUT.startX;

    for (
      let columnIndex = 0;
      columnIndex < OBJECT_LAYOUT.columnCount;
      columnIndex++
    ) {
      const columnDelay = columnIndex * 0.15;
      const columnContainer = new Container();
      columnContainer.position.set(columnX, OBJECT_LAYOUT.startY);
      reelsContainer.addChild(columnContainer);

      for (let rowIndex = 0; rowIndex < OBJECT_LAYOUT.rowCount; rowIndex++) {
        const isLastColumn = columnIndex === OBJECT_LAYOUT.columnCount - 1;
        const isLastRow = rowIndex === OBJECT_LAYOUT.rowCount - 1;
        const animationKey =
          matrix.length > 0
            ? matrix[columnIndex][rowIndex]
            : animations[Math.floor(Math.random() * animations.length)];
        const sprite = new AnimatedSprite(spriteSheet.animations[animationKey]);
        const targetY = rowIndex * OBJECT_LAYOUT.rowSpacing;

        sprite.x = OBJECT_LAYOUT.spriteStartX;
        sprite.y = OBJECT_LAYOUT.startY;
        sprite.anchor.set(
          OBJECT_LAYOUT.spriteAnchorX,
          OBJECT_LAYOUT.spriteAnchorY,
        );
        sprite.scale.set(OBJECT_LAYOUT.spriteScale);
        sprite.animationSpeed = OBJECT_LAYOUT.spriteSpeed;

        columnContainer.addChild(sprite);
        animatedSprites.push(sprite);

        if (animate) {
          sprite.scale.set(OBJECT_LAYOUT.spriteScale, 0);
          sprite.alpha = 0;

          gsap.to(sprite.scale, {
            x: OBJECT_LAYOUT.spriteScale,
            y: OBJECT_LAYOUT.spriteScale,
            duration: OBJECT_LAYOUT.dropDuration,
            delay: columnDelay,
            ease: OBJECT_LAYOUT.dropEase,
          });

          gsap.to(sprite, {
            y: targetY,
            alpha: 1,
            duration: OBJECT_LAYOUT.dropDuration,
            delay: columnDelay,
            ease: OBJECT_LAYOUT.dropEase,
            onComplete: () => {
              if (isLastColumn && isLastRow) {
                onComplete();
              }
            },
          });
        } else {
          sprite.y = targetY;

          if (isLastColumn && isLastRow) {
            onComplete();
          }
        }

        sprite.play();
      }

      columnX += OBJECT_LAYOUT.columnSpacing;
    }
  }

  return { animatedSprites, startReels };
}
