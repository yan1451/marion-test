import { Container, Graphics, Text, TextStyle } from "pixi.js";

type BetMenuOptions = {
  values: readonly number[];
  style: TextStyle;
  x: number;
  y: number;
  onSelect: (value: number) => void;
};

const BET_MENU_LAYOUT = {
  width: 170,
  itemHeight: 40,
  padding: 12,
  borderRadius: 12,
} as const;

export function createBetMenu({
  values,
  style,
  x,
  y,
  onSelect,
}: BetMenuOptions) {
  const container = new Container();
  container.visible = false;
  container.x = x;
  container.y = y;
  const menuHeight =
    BET_MENU_LAYOUT.padding * 2 + values.length * BET_MENU_LAYOUT.itemHeight;
  const background = new Graphics()
    .roundRect(
      0,
      0,
      BET_MENU_LAYOUT.width,
      menuHeight,
      BET_MENU_LAYOUT.borderRadius,
    )
    .fill({ color: 0x1a0f06, alpha: 0.92 })
    .stroke({ color: 0xe5d206, width: 3 });
  container.addChild(background);
  values.forEach((value, index) => {
    const optionText = new Text({
      text: value,
      style,
    });
    optionText.anchor.set(0.5);
    optionText.x = BET_MENU_LAYOUT.width / 2;
    optionText.y =
      BET_MENU_LAYOUT.padding +
      BET_MENU_LAYOUT.itemHeight * index +
      BET_MENU_LAYOUT.itemHeight / 2;
    optionText.eventMode = "static";
    optionText.cursor = "pointer";
    optionText.on("pointerdown", () => {
      onSelect(value);
      container.visible = false;
    });
    container.addChild(optionText);
  });
  return container;
}
