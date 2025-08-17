import { k } from "../kaplay";
import { getSpriteUV, getSpriteDimensions } from "./sprite";

export function ditherOpacityShader(sprite: string) {
  const uniform = ditherOpacityShaderUniform(sprite);

  return k.shader("ditherOpacity", uniform);
}

export function ditherOpacityShaderUniform(sprite: string) {
  const spriteUV = getSpriteUV(sprite);
  const spriteDim = getSpriteDimensions(sprite);

  return {
    u_quad_pos: k.vec2(spriteUV.x, spriteUV.y),
    u_quad_size: k.vec2(spriteUV.w, spriteUV.h),
    u_resolution: spriteDim,
    u_dither_scale: 1,
    u_opacity: 1,
  };
}
