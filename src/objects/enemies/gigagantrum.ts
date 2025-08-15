import type { Vec2 } from "kaplay";
import { k } from "../../kaplay";
import { getCurrentMap } from "../../map";
import { nav } from "../../comp/nav";
import { GLOBAL_SCALE } from "../../config";
import { pushBack, pushBackAngle } from "../pushback";
import { ditherOpacityShader } from "../../gfx/dither";
import { doSpawnAnimation } from "../spawnAnim";
import { addScore } from "../score";

export function addGigagantrum(pos: Vec2) {
  const gigagantrum = k.add([
    k.pos(pos),
    k.sprite("gigagantrum"),

    k.health(5),

    ditherOpacityShader("gigagantrum"),

    k.z(100),

    k.area({
      //collisionIgnore: ["collision"],
      shape: new k.Circle(k.vec2(0, 0), 38),
      scale: 0.9,
    }),

    k.anchor("center"),

    k.rotate(0),

    k.animate(),

    k.body({
      mass: 6,
    }),
    k.tile(),

    k.patrol({
      speed: 50,
    }),
    nav(),

    "enemy",
    "flower_enemy",
  ]);

  doSpawnAnimation(gigagantrum, pos);

  gigagantrum.animate("angle", [-10, 10, -10], {
    duration: 1.8,
    easing: k.easings.easeInOutQuad,
  });

  gigagantrum.animation.seek(k.randi(0, 1.8));

  gigagantrum.onCollide("bullet", (bullet) => {
    pushBackAngle(gigagantrum, bullet, 40);
    gigagantrum.hp--;
    bullet.destroy();
  });

  gigagantrum.onCollide("splash", (splash) => {
    //pushBack(gigagantrum, splash);
    splash.destroy();
  });

  gigagantrum.onDeath(() => {
    addScore(200);

    gigagantrum.collisionIgnore = ["*"];

    gigagantrum.patrolSpeed = 0;

    gigagantrum.unanimateAll();

    k.tween(1, 0, 0.8, (t) => {
      if (!gigagantrum.uniform) {
        return;
      }
      gigagantrum.uniform.u_opacity = t;
    }).then(() => {
      gigagantrum.destroy();
    });
  });

  return gigagantrum;
}
