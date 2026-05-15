import { Application } from "pixi.js";
import { gsap } from "gsap";
import { LayerZIndex } from "../constants";
import { createWinAnimations } from "../winAnimation";
import { OBJECT_LAYOUT } from "../constants";

export async function createWinOverlayController(app: Application) {
  const {
    container: winContainer,
    startWinLoop,
    stopWinLoop,
  } = await createWinAnimations(app);

  winContainer.zIndex = LayerZIndex.WinOverlay;

  async function showWinAnimation(winAmount: number) {
    winContainer.visible = true;
    winContainer.alpha = 0;
    winContainer.position.set(0, 0);

    app.stage.sortableChildren = true;

    if (!winContainer.parent) {
      app.stage.addChild(winContainer);
    } else {
      app.stage.setChildIndex(winContainer, app.stage.children.length - 1);
    }

    const animationFinished = startWinLoop(winAmount);

    gsap.to(winContainer, {
      alpha: 1,
      duration: OBJECT_LAYOUT.winFadeDuration,
      delay: 0.2,
      ease: "power2.out",
    });

    await animationFinished;
    stopWinLoop();
    winContainer.visible = false;
  }

  return { showWinAnimation };
}
