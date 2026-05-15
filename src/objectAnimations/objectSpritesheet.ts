import { Assets, Spritesheet } from "pixi.js";
import type { SpritesheetData } from "pixi.js";

type AtlasData = SpritesheetData & {
  meta: {
    image: string;
  };
};

type AtlasAsset = {
  data: AtlasData;
};

function getBasePath(path: string) {
  return path.substring(0, path.lastIndexOf("/") + 1);
}

function removeUrlSearchAndHash(path: string) {
  return path.split("?")[0].split("#")[0];
}

export async function loadObjectSpritesheet(atlasJsonPath: string) {
  const objectsFramesData = (await Assets.load(atlasJsonPath)) as AtlasAsset;
  const atlasBasePath = getBasePath(atlasJsonPath);
  const atlasImageFileName = removeUrlSearchAndHash(
    objectsFramesData.data.meta.image,
  );
  const atlasImagePath = `${atlasBasePath}${atlasImageFileName}`;
  const textureObjects = await Assets.load(atlasImagePath);
  const spriteSheet = new Spritesheet(textureObjects, objectsFramesData.data);

  await spriteSheet.parse();

  return spriteSheet;
}
