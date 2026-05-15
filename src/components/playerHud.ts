import { Application, Text, TextStyle } from "pixi.js";

type PlayerHudState = {
  balance: number;
  win: number;
  betValue: number;
};

type PlayerHudOptions = {
  app: Application;
  fontFamily: string;
  initialState: PlayerHudState;
};

export function createPlayerHud({
  app,
  fontFamily,
  initialState,
}: PlayerHudOptions) {
  const style = new TextStyle({
    fill: "#e5d206",
    fontFamily,
    fontSize: 40,
    fontWeight: "bold",
    stroke: "#ff4d00",
  });

  const balanceText = new Text({
    text: initialState.balance,
    style,
  });

  balanceText.x = app.screen.width / 5.7;
  balanceText.y = app.screen.height / 1.1;

  const winText = new Text({
    text: initialState.win,
    style,
  });

  winText.x = app.screen.width / 2.7;
  winText.y = app.screen.height / 1.1;

  const betText = new Text({
    text: initialState.betValue,
    style,
  });

  betText.x = app.screen.width / 1.9;
  betText.y = app.screen.height / 1.1;

  return {
    balanceText,
    winText,
    betText,
    style,
    updateBalance: (value: number) => {
      balanceText.text = value;
    },
    updateWin: (value: number) => {
      winText.text = value;
    },
    updateBet: (value: number) => {
      betText.text = value;
    },
  };
}
