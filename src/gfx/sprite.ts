import { k } from "../kaplay";

export function getSpriteUV(sprite: string, frame: number = 0) {
  const spriteData = k.getSprite(sprite);

  if (spriteData && spriteData.data) {
    return spriteData.data.frames[frame];
  } else {
    throw new Error(`Sprite "${sprite}" not found`);
  }
}

// Get pixel dimensions of a sprite
export function getSpriteDimensions(sprite: string) {
  const spriteData = k.getSprite(sprite);

  if (spriteData && spriteData.data) {
    return k
      .vec2(spriteData.data.width, spriteData.data.height)
      .scale(1 / spriteData.data.frames.length);
  } else {
    throw new Error(`Sprite "${sprite}" not found`);
  }
}
