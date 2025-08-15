import type { AreaComp, GameObj, PosComp, Vec2 } from "kaplay";
import { k } from "../kaplay";
import { ditherOpacityShader } from "../gfx/dither";

export async function doSpawnAnimation(
  obj: GameObj<AreaComp | PosComp>,
  pos: Vec2
) {
  const dropShadow = k.add([
    k.pos(pos.add(0, 40)),
    k.sprite("drop_shadow"),

    ditherOpacityShader("drop_shadow"),

    k.z(22),

    k.anchor("center"),
  ]);

  k.tween(0, 0.7, 0.2, (t) => {
    if (!dropShadow.uniform) {
      return;
    }
    dropShadow.uniform.u_opacity = t;
  });

  k.wait(2.3, async () => {
    await k.tween(0.7, 0, 0.2, (t) => {
      if (!dropShadow.uniform) {
        return;
      }
      dropShadow.uniform.u_opacity = t;
    });
    dropShadow.destroy();
  });

  const startPos = pos.add(0, -2000);
  const endPos = pos;

  const colIgnore = Array.from(obj.collisionIgnore);

  obj.collisionIgnore = ["*"];
  obj.paused = true;

  await k.tween(startPos, endPos, 2.5, (t) => {
    obj.pos = t;
  });

  obj.collisionIgnore = colIgnore;
  obj.paused = false;
}
