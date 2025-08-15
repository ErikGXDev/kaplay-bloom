import type { Vec2 } from "kaplay";
import { GLOBAL_SCALE } from "../../config";
import { ditherOpacityShader } from "../../gfx/dither";
import { k } from "../../kaplay";
import { getCurrentMap } from "../../map";
import { getRandom } from "../../util";
import { pushBack } from "../pushback";
import { addScore } from "../score";

export function addButterflyRandom() {
  const map = getCurrentMap();

  if (!map) {
    return;
  }

  const spawnPos = findButterflySpawnPosition();

  const butterfly = k.add([
    k.sprite("butterfly"),
    k.area({
      collisionIgnore: ["collision", "enemy"],
    }),

    ditherOpacityShader("butterfly"),

    k.pos(spawnPos),
    k.z(103),
    k.anchor("center"),
    k.health(3),
    k.rotate(0),
    k.animate(),
    "enemy",
    "flower_enemy",
    {
      angleAdd: 0,
      speed: 50 * GLOBAL_SCALE,
    },
  ]);

  let targetPos = findButterflyRandomPosition();

  butterfly.onUpdate(() => {
    butterfly.moveTo(targetPos, butterfly.speed);
    butterfly.angle = targetPos.angle(butterfly.pos) + 90 + butterfly.angleAdd;

    if (butterfly.pos.dist(targetPos) < 10) {
      targetPos = findButterflyRandomPosition();
    }
  });

  butterfly.animate("angleAdd", [-5, 5, -5], {
    duration: 1.3,
    easing: k.easings.easeInOutQuad,
  });

  butterfly.onCollide("bullet", (bullet) => {
    pushBack(butterfly, bullet, 40);
    butterfly.hp--;
    bullet.destroy();

    if (k.chance(0.5)) {
      targetPos = findButterflyRandomPosition();
    }
  });

  butterfly.onDeath(() => {
    addScore(200);

    butterfly.collisionIgnore = ["*"];

    butterfly.speed = 0;

    butterfly.unanimateAll();

    k.tween(1, 0, 0.8, (t) => {
      if (!butterfly.uniform) {
        return;
      }
      butterfly.uniform.u_opacity = t;
    }).then(() => {
      butterfly.destroy();
    });
  });
}

function findButterflySpawnPosition() {
  const map = getCurrentMap();

  if (!map) {
    return k.vec2(0, 0);
  }

  const SPAWN_PAD = 64;

  const mapSize = k.vec2(map.data.width, map.data.height).scale(GLOBAL_SCALE);

  const spawnLoc = k.choose(["left", "right", "top", "bottom"]);

  let spawnX = 0;
  let spawnY = 0;

  // Spawn left
  if (spawnLoc === "left") {
    spawnX = -SPAWN_PAD;
    spawnY = k.randi(-SPAWN_PAD, mapSize.y + SPAWN_PAD);
  } else if (spawnLoc === "right") {
    spawnX = mapSize.x + SPAWN_PAD;
    spawnY = k.randi(-SPAWN_PAD, mapSize.y + SPAWN_PAD);
  } else if (spawnLoc === "top") {
    spawnX = k.randi(-SPAWN_PAD, mapSize.x + SPAWN_PAD);
    spawnY = -SPAWN_PAD;
  } else if (spawnLoc === "bottom") {
    spawnX = k.randi(-SPAWN_PAD, mapSize.x + SPAWN_PAD);
    spawnY = mapSize.y + SPAWN_PAD;
  }

  const spawnPos = k.vec2(spawnX, spawnY);

  return spawnPos;
}

function findButterflyRandomPosition() {
  const map = getCurrentMap();
  if (!map) {
    return k.vec2(0, 0);
  }

  if (k.chance(0.5)) {
    const mapSize = k.vec2(map.data.width, map.data.height).scale(GLOBAL_SCALE);
    const x = k.randi(0, mapSize.x);
    const y = k.randi(0, mapSize.y);

    return k.vec2(x, y);
  } else {
    const ambushTarget = k.choose(["player", "grass_patch"]);

    const ambush = getRandom(ambushTarget);

    if (ambush) {
      if (ambushTarget === "grass_patch") {
        return ambush.pos.add(
          k.vec2(k.randi(0, ambush.size.x), k.randi(0, ambush.size.y))
        );
      }

      return ambush.pos;
    }
    return k.vec2(0, 0);
  }
}
