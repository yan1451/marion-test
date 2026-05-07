import {
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  Texture,
} from "pixi.js";
import { playTextures, startAnimationLoop, type AnimationEntry } from "./aux";
import { loadAnimationFramesFromMultipack } from "./multipackLoader";

type WinAnimationOptions = {
  atlasJsonPath?: string;
  bigWinAnimationName?: string;
  megaWinAnimationName?: string;
  superMegaWinAnimationName?: string;
  totalWinAnimationName?: string;
};

const WIN_CONFIG = {
  BIG_WIN: { anchor: { x: 0.5, y: 0.5 }, speed: 0.5 },
  MEGA_WIN: { anchor: { x: 0.5, y: 0.5 }, speed: 0.5 },
  SUPER_MEGA_WIN: { anchor: { x: 0.5, y: 0.5 }, speed: 0.5 },
  TOTAL_WIN: { anchor: { x: 0.5, y: 0.5 }, speed: 0.5 },
};

export async function createWinAnimations(
  _app: Application,
  {
    atlasJsonPath = "/assets/bank_roberry_slot/animation/wins/win-0.json",
    bigWinAnimationName = "Big_Win",
    megaWinAnimationName = "Mega_Win",
    superMegaWinAnimationName = "Super_Mega_Win",
    totalWinAnimationName = "Total_Win",
  }: WinAnimationOptions = {},
) {
  const container = new Container();
  container.visible = false;
  container.eventMode = "none";
  container.alpha = 0;

  // --- ADICIONANDO O FUNDO ESCURO ---
  const background = new Graphics();
  background.beginFill(0x000000, 0.7); // Cor preta com 70% de opacidade

  // Define o tamanho do fundo baseado no tamanho da aplicação (tela cheia)
  background.drawRect(0, 0, _app.screen.width * 2, _app.screen.height * 2);
  background.endFill();

  // Centraliza o ponto de registro do fundo para facilitar o posicionamento do container
  background.pivot.set(_app.screen.width / 2, _app.screen.height / 2);

  // Adiciona o fundo primeiro (fica atrás de tudo no container)
  container.addChild(background);

  const winFrames = await loadAnimationFramesFromMultipack({
    atlasJsonPath,
    animationNames: [
      bigWinAnimationName,
      megaWinAnimationName,
      superMegaWinAnimationName,
      totalWinAnimationName,
    ],
    sortFramesByIndex: true,
  });

  const getTexturesByAnimation = (animationName: string): Texture[] =>
    winFrames
      .filter((frame) => frame.frameName.startsWith(`${animationName}_`))
      .map((frame) => frame.texture);

  const bigWinTextures = getTexturesByAnimation(bigWinAnimationName);
  const megaWinTextures = getTexturesByAnimation(megaWinAnimationName);
  const superMegaWinTextures = getTexturesByAnimation(
    superMegaWinAnimationName,
  );
  const totalWinTextures = getTexturesByAnimation(totalWinAnimationName);

  const animatedSprite = new AnimatedSprite(bigWinTextures);

  playTextures(animatedSprite, bigWinTextures, WIN_CONFIG.BIG_WIN);

  const loopSequence: AnimationEntry[] = [
    {
      textures: bigWinTextures,
      config: WIN_CONFIG.BIG_WIN,
      duration: 4,
      loop: true,
      scaleX: 0.8,
      scaleY: 0.8,
    },
    {
      textures: megaWinTextures,
      config: WIN_CONFIG.MEGA_WIN,
      duration: 3,
      loop: true,
      scaleX: 0.8,
      scaleY: 0.8,
    },
    {
      textures: superMegaWinTextures,
      config: WIN_CONFIG.SUPER_MEGA_WIN,
      duration: 3,
      loop: true,
      scaleX: 0.8,
      scaleY: 0.8,
    },
    {
      textures: totalWinTextures,
      config: WIN_CONFIG.TOTAL_WIN,
      duration: 3,
      loop: false,
      scaleX: 0.8,
      scaleY: 0.8,
    },
  ];

  container.addChild(animatedSprite);

  const startWinLoop = () => {
    playTextures(animatedSprite, bigWinTextures, WIN_CONFIG.BIG_WIN);
    startAnimationLoop(animatedSprite, loopSequence);
  };

  const stopWinLoop = () => {
    animatedSprite.gotoAndStop(0);
  };

  return { container, startWinLoop, stopWinLoop };
}
