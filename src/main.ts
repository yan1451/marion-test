import { Application, Assets, Sprite } from "pixi.js";
import "@pixi/layout";
import { LayoutContainer } from "@pixi/layout/components";
import { createFoxAnimation } from "./foxAnimation";
import { createObjectAnimations } from "./objectAnimations";
import { LayerZIndex } from "./animationConstants";

const MAIN_LAYOUT = {
  rootGap: 2,
  groupGap: 20,
  groupBottom: 0,
} as const;

(async () => {
  // Create a new application
  const app = new Application();

  await app.init({
    background: "#1099bb",
    resizeTo: document.getElementById("pixi-container")!,
  });

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const textureBackground = await Assets.load(
    "/assets/bank_roberry_slot/animation/BACKGROUND.png",
  );
  const bgSprite = new Sprite(textureBackground);
  const frameTexture = await Assets.load(
    "/assets/bank_roberry_slot/animation/main_game.png",
  );

  app.stage.layout = {
    width: app.screen.width,
    height: app.screen.height,
  };

  const container = new LayoutContainer({
    layout: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      flexDirection: "row",
      alignContent: "center",
      flexWrap: "wrap",
      gap: MAIN_LAYOUT.rootGap,
    },
    background: bgSprite,
  });

  const groupContainer = new LayoutContainer({
    layout: {
      position: "relative",
      width: app.screen.width,
      height: app.screen.height,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: MAIN_LAYOUT.groupGap,
      bottom: MAIN_LAYOUT.groupBottom,
    },
    sortableChildren: true,
  });

  app.stage.addChild(container);

  const fox = await createFoxAnimation(app);
  const { container: objectsContainer } = await createObjectAnimations(app, {
    frameTexture,
  });

  fox.zIndex = LayerZIndex.Fox;
  objectsContainer.zIndex = LayerZIndex.Objects;
  groupContainer.addChild(objectsContainer);
  groupContainer.addChild(fox);

  container.addChild(groupContainer);
})();
