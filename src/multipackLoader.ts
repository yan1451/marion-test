import { Assets, Spritesheet, Texture } from "pixi.js";
import type { SpritesheetData } from "pixi.js";

type AtlasMeta = {
  image: string;
  related_multi_packs?: string[];
};

type AtlasData = SpritesheetData & {
  animations?: Record<string, string[]>;
  meta: AtlasMeta;
};

type AtlasAsset = {
  data: AtlasData;
};

type ParsedAtlas = {
  atlasData: AtlasData;
  spriteSheet: Spritesheet;
};

type LoadAnimationFramesOptions = {
  atlasJsonPath: string;
  animationNames: string[] | string;
  sortFramesByIndex?: boolean;
};

function getBasePath(path: string) {
  return path.substring(0, path.lastIndexOf("/") + 1);
}

function resolveRelativePath(basePath: string, filePath: string) {
  if (filePath.startsWith("/") || filePath.startsWith("http")) {
    return filePath;
  }

  return `${basePath}${filePath}`;
}

function removeUrlSearchAndHash(filePath: string) {
  return filePath.split("?")[0].split("#")[0];
}

function extractFrameIndex(frameName: string) {
  const nameWithoutExtension = frameName.split(".")[0];
  const splitedName = nameWithoutExtension.split("_");
  return Number.parseInt(splitedName[splitedName.length - 1], 10);
}

function normalizeAnimationName(animationName: string) {
  return animationName.replace(/_\d+$/, "");
}

function resolveAnimationKey(
  animations: Record<string, string[]> | undefined,
  animationName: string,
) {
  if (!animations) return null;

  if (animations[animationName]) {
    return animationName;
  }
  const normalizedName = normalizeAnimationName(animationName);
  if (animations[normalizedName]) {
    return normalizedName;
  }

  const keyByPrefix = Object.keys(animations).find(
    (key) =>
      animationName.startsWith(`${key}_`) ||
      key.startsWith(`${animationName}_`),
  );

  return keyByPrefix ?? null;
}

async function parseAtlas(atlasJsonPath: string): Promise<ParsedAtlas> {
  const atlasAsset = (await Assets.load(atlasJsonPath)) as AtlasAsset;

  const basePath = getBasePath(atlasJsonPath);
  const imagePath = resolveRelativePath(
    basePath,
    removeUrlSearchAndHash(atlasAsset.data.meta.image),
  );

  const texture = await Assets.load(imagePath);
  const spriteSheet = new Spritesheet(texture, atlasAsset.data);
  await spriteSheet.parse();

  return { atlasData: atlasAsset.data, spriteSheet };
}

export async function loadAnimationFramesFromMultipack({
  atlasJsonPath,
  animationNames,
  sortFramesByIndex = false,
}: LoadAnimationFramesOptions) {
  const rootAtlas = (await Assets.load(atlasJsonPath)) as AtlasAsset;
  const basePath = getBasePath(atlasJsonPath);
  const relatedPacks = rootAtlas.data.meta.related_multi_packs ?? [];
  const atlasPaths = [
    atlasJsonPath,
    ...relatedPacks.map((packPath) => resolveRelativePath(basePath, packPath)),
  ];

  const parsedAtlases = await Promise.all(atlasPaths.map(parseAtlas));

  const animationKeys = Array.isArray(animationNames)
    ? animationNames.map((name) =>
        resolveAnimationKey(rootAtlas.data.animations, name),
      )
    : [resolveAnimationKey(rootAtlas.data.animations, animationNames)];

  const requestedFrameNames = animationKeys.flatMap((key) =>
    key ? (rootAtlas.data.animations?.[key] ?? []) : [],
  );

  if (requestedFrameNames.length === 0) {
    throw new Error(
      `Animacao  nao encontrada nos atlases de ${atlasJsonPath}.`,
    );
  }

  const texturesByFrameName: Record<string, Texture> = {};

  parsedAtlases.forEach(({ spriteSheet }) => {
    Object.entries(spriteSheet.textures).forEach(([frameName, texture]) => {
      if (texture && !texturesByFrameName[frameName]) {
        texturesByFrameName[frameName] = texture;
      }
    });
  });

  const frames = requestedFrameNames.flatMap((frameName) => {
    const texture = texturesByFrameName[frameName];
    return texture ? [{ frameName, texture }] : [];
  });

  if (frames.length === 0) {
    throw new Error(
      `Nenhum frame encontrado para as animacoes em ${atlasJsonPath}.`,
    );
  }

  if (sortFramesByIndex) {
    frames.sort(
      (a, b) => extractFrameIndex(a.frameName) - extractFrameIndex(b.frameName),
    );
  }

  return frames.map((frame) => ({
    frameName: frame.frameName,
    texture: frame.texture,
  }));
}
