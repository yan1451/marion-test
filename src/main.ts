import { Application, Assets, Sprite } from "pixi.js";
import "@pixi/layout";
import { LayoutContainer } from "@pixi/layout/components";
import { createFoxAnimation } from "./foxAnimation";
import { createObjectAnimations } from "./objectAnimations";
import { LayerZIndex } from "./constants";
import { mockSpinAPI } from "./mockbackend";
import { paths } from "./constants";
import { createBetMenu } from "./components/betMenu";
import { createGameButton } from "./components/gameButton";
import { createPlayerHud } from "./components/playerHud";

const defaultPlayerState = { balance: 1000, win: 0, betValue: 10 };

const MAIN_LAYOUT = {
  rootGap: 2,
  groupGap: 20,
  groupBottom: 0,
} as const;

const BET_OPTIONS = [10, 20, 50, 100] as const;
const AUTO_SPIN_OPTIONS = [0, 5, 10, 25, 50] as const;

const BET_MENU_OFFSET = {
  offsetX: -10,
  offsetY: -200,
} as const;

const AUTO_SPIN_MENU_OFFSET = {
  offsetX: -10,
  offsetY: -240,
} as const;

(async () => {
  const app = new Application();

  await app.init({
    resizeTo: document.getElementById("pixi-container")!,
    backgroundAlpha: 0,
  });

  const font = await Assets.load(paths.font);

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const textureBackground = await Assets.load(paths.background);
  const bgSprite = new Sprite(textureBackground);
  const topBackgroundFrameTexture = await Assets.load(paths.topBackgroundFrame);
  const bottomBackgroundFrameTexture = await Assets.load(
    paths.bottomBackgroundFrame,
  );
  const buttonBetSprite = await createGameButton({
    texturePath: paths.buttonBet,
    x: app.screen.width / 1.72,
    y: app.screen.height / 1.14,
    scaleX: 1.05,
    scaleY: 0.8,
  });

  const buttonRerollSprite = await createGameButton({
    texturePath: paths.buttonReroll,
    x: app.screen.width / 1.28,
    y: app.screen.height / 1.14,
    scaleX: 1.05,
    scaleY: 0.8,
  });

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
  let spinAnimation = false;
  let selectedAutoSpinCount = 0;
  let remainingAutoSpins = 0;
  let isAutoSpinRunning = false;
  let shouldStopAutoSpin = false;

  const fox = await createFoxAnimation(app, { atlasJsonPath: paths.fox });
  const { container: objectsContainer, startObjectAnimations } =
    await createObjectAnimations(app, {
      atlasJsonPath: paths.objects,
      topBackgroundFrameTexture,
      bottomBackgroundFrameTexture,
    });

  fox.zIndex = LayerZIndex.Fox;
  objectsContainer.zIndex = LayerZIndex.Objects;
  groupContainer.addChild(objectsContainer);
  groupContainer.addChild(fox);

  const playerHud = createPlayerHud({
    app,
    fontFamily: font.family,
    initialState: defaultPlayerState,
  });

  const playerState = new Proxy(
    { ...defaultPlayerState },
    {
      set(
        target: typeof defaultPlayerState,
        property: keyof typeof defaultPlayerState,
        value: number,
      ) {
        target[property] = value;
        if (property === "balance") {
          playerHud.updateBalance(value);
        }
        if (property === "win") {
          playerHud.updateWin(value);
        }
        if (property === "betValue") {
          playerHud.updateBet(value);
        }
        return true;
      },
    },
  );

  const betMenuContainer = createBetMenu({
    values: BET_OPTIONS,
    style: playerHud.style,
    x: buttonBetSprite.x + BET_MENU_OFFSET.offsetX,
    y: buttonBetSprite.y + BET_MENU_OFFSET.offsetY,
    onSelect: (value: number) => {
      playerState.betValue = value;
    },
  });

  const autoSpinMenuContainer = createBetMenu({
    values: AUTO_SPIN_OPTIONS,
    style: playerHud.style,
    x: buttonRerollSprite.x + AUTO_SPIN_MENU_OFFSET.offsetX,
    y: buttonRerollSprite.y + AUTO_SPIN_MENU_OFFSET.offsetY,
    onSelect: (value: number) => {
      selectedAutoSpinCount = value;
    },
  });

  const button = await createGameButton({
    texturePath: paths.button,
    x: app.screen.width / 1.378,
    y: app.screen.height / 1.095,
    scaleX: 0.9,
    scaleY: 0.8,
    anchor: 0.5,
  });

  button.on("pointerdown", handleSpin);
  buttonBetSprite.on("pointerdown", handleButtonBet);
  buttonRerollSprite.on("pointerdown", handleAutoSpinButton);

  container.addChild(groupContainer);
  container.addChild(button);
  container.addChild(buttonBetSprite);
  container.addChild(buttonRerollSprite);
  container.addChild(playerHud.balanceText);
  container.addChild(playerHud.winText);
  container.addChild(playerHud.betText);
  container.addChild(betMenuContainer);
  container.addChild(autoSpinMenuContainer);

  function handleButtonBet() {
    if (spinAnimation || isAutoSpinRunning) return;

    autoSpinMenuContainer.visible = false;
    betMenuContainer.visible = !betMenuContainer.visible;
  }

  function handleAutoSpinButton() {
    if (spinAnimation || isAutoSpinRunning) return;

    betMenuContainer.visible = false;
    autoSpinMenuContainer.visible = !autoSpinMenuContainer.visible;
  }

  function setSpinButtonState(isSpinning: boolean) {
    button.alpha = isSpinning ? 0.5 : 1;
  }

  async function runSpinRound() {
    betMenuContainer.visible = false;
    autoSpinMenuContainer.visible = false;
    spinAnimation = true;
    setSpinButtonState(true);

    const result = await mockSpinAPI(playerState.betValue);

    playerState.balance = playerState.balance - playerState.betValue;
    playerState.win = result.winAmount;

    await startObjectAnimations({
      animate: true,
      matrix: result.matrix,
      winAmount: result.winAmount,
    });

    if (result.isWin) {
      playerState.balance = playerState.balance + result.winAmount;
    }

    spinAnimation = false;
    setSpinButtonState(false);
  }

  async function runAutoSpins() {
    isAutoSpinRunning = true;
    shouldStopAutoSpin = false;
    remainingAutoSpins = selectedAutoSpinCount;

    while (remainingAutoSpins > 0 && !shouldStopAutoSpin) {
      await runSpinRound();
      remainingAutoSpins--;
    }

    remainingAutoSpins = 0;
    isAutoSpinRunning = false;
    shouldStopAutoSpin = false;
    setSpinButtonState(false);
  }

  async function handleSpin() {
    if (isAutoSpinRunning) {
      shouldStopAutoSpin = true;
      return;
    }

    if (spinAnimation) return;

    if (selectedAutoSpinCount > 0) {
      await runAutoSpins();
      return;
    }

    await runSpinRound();
  }
})();
