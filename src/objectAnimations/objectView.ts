import { Container, Sprite, Texture } from "pixi.js";
import { LayoutContainer } from "@pixi/layout/components";
import { OBJECT_LAYOUT } from "../constants";

type ObjectViewOptions = {
  topBackgroundFrameTexture?: Texture;
  bottomBackgroundFrameTexture?: Texture;
};

export function createObjectView({
  topBackgroundFrameTexture,
  bottomBackgroundFrameTexture,
}: ObjectViewOptions) {
  const bottomBgSprite = new Sprite(bottomBackgroundFrameTexture);
  const topBgSprite = new Sprite(topBackgroundFrameTexture);

  topBgSprite.scale.set(OBJECT_LAYOUT.bgScaleX, OBJECT_LAYOUT.bgScaleY);
  topBgSprite.anchor.set(OBJECT_LAYOUT.bgAnchorX, OBJECT_LAYOUT.bgAnchorY);
  bottomBgSprite.scale.set(OBJECT_LAYOUT.bgScaleX, OBJECT_LAYOUT.bgScaleY);
  bottomBgSprite.anchor.set(OBJECT_LAYOUT.bgAnchorX, OBJECT_LAYOUT.bgAnchorY);

  topBgSprite.layout = {
    position: "relative",
    top: OBJECT_LAYOUT.bgTop,
    bottom: OBJECT_LAYOUT.bgBottom,
    maxHeight: OBJECT_LAYOUT.maxHeight,
    maxWidth: OBJECT_LAYOUT.maxWidth,
  };

  bottomBgSprite.layout = {
    position: "absolute",
    bottom: -10,
    width: "100%",
    height: "100%",
  };

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

  const reelsContainer = new Container();
  container.addChild(reelsContainer);
  container.addChildAt(topBgSprite, 0);
  container.addChildAt(bottomBgSprite, 1);

  return { container, reelsContainer };
}
