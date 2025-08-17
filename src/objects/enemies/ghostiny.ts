import type { Vec2 } from "kaplay";
import { GLOBAL_SCALE } from "../../config";
import { gameState } from "../../gameState";
import { ditherOpacityShader } from "../../gfx/dither";
import { k } from "../../kaplay";
import { getCurrentMap } from "../../map";
import { getFirst } from "../../util";
import { pushBack, pushBackAngle } from "../fx/pushback";
import { addScore } from "../score";

export function addGhostinyRandom() {
  const map = getCurrentMap();

  if (!map) {
    return;
  }

  const spawnPos = findGhostinySpawnPosition();

  const ghostiny = k.add([
    k.sprite("ghostiny"),
    k.area({
      collisionIgnore: ["collision", "enemy", "player"],
    }),
    k.pos(spawnPos),
    k.z(103),
    k.anchor("center"),
    ditherOpacityShader("ghostiny"),
    k.health(3),
    k.rotate(0),
    k.animate(),
    "enemy",
    "flower_enemy",
    {
      uOpacity: 1,
      speed: 50 * GLOBAL_SCALE,
      lastShootTime: 0,
    },
  ]);

  let targetPos = findGhostinyPatrolPosition();

  ghostiny.onUpdate(() => {
    ghostiny.lastShootTime += k.dt();
    if (ghostiny.lastShootTime >= 5) {
      ghostiny.lastShootTime = 0;

      const player = getFirst("player");

      if (!player) {
        return;
      }

      shootGhostinyBullet(ghostiny.pos, player.pos.angle(ghostiny.pos));
    }

    ghostiny.moveTo(targetPos, ghostiny.speed);

    if (ghostiny.pos.dist(targetPos) < 10) {
      targetPos = findGhostinyPatrolPosition();
    }

    if (!ghostiny.uniform) {
      return;
    }
    ghostiny.uniform.u_opacity = ghostiny.uOpacity;
  });

  ghostiny.animate("uOpacity", [0.4, 1, 0.4], {
    duration: 1.6,
    easing: k.easings.easeInOutQuad,
  });

  ghostiny.onCollide("bullet", (bullet) => {
    pushBackAngle(ghostiny, bullet, 40);
    ghostiny.hp--;
    bullet.destroy();

    targetPos = findGhostinyPatrolPosition();
  });

  ghostiny.onDeath(() => {
    gameState.level.enemiesDefeated++;

    ghostiny.lastShootTime = -99;

    addScore(300);

    ghostiny.collisionIgnore = ["*"];

    ghostiny.speed = 0;

    ghostiny.unanimateAll();

    k.tween(1, 0, 0.8, (t) => {
      if (!ghostiny.uniform) {
        return;
      }
      ghostiny.uOpacity = t;
      ghostiny.uniform.u_opacity = t;
    }).then(() => {
      ghostiny.destroy();
    });
  });
}

export function shootGhostinyBullet(pos: Vec2, angle: number) {
  const bullet = k.add([
    k.sprite("ghostiny_bullet"),
    ditherOpacityShader("ghostiny_bullet"),
    k.pos(pos),
    k.anchor("center"),
    k.area(),
    k.rotate(0),
    k.offscreen({
      destroy: true,
    }),
    k.z(102),
    "enemy",
    "flower_enemy",
  ]);

  const angleVec = k.Vec2.fromAngle(angle);

  bullet.onUpdate(() => {
    bullet.angle += 40 * k.dt();
    bullet.move(angleVec.scale(80));

    if (bullet.uniform) {
      bullet.uniform.u_opacity = k.wave(0.2, 0.8, k.time() * 2);
    }
  });

  bullet.onCollide("bullet", (otherBullet) => {
    bullet.destroy();
    otherBullet.destroy();
  });

  bullet.onCollide("player", (player) => {
    bullet.destroy();
  });

  return bullet;
}

export function findGhostinySpawnPosition() {
  const map = getCurrentMap();

  if (!map) {
    return k.vec2(0, 0);
  }

  const pos = k.vec2(
    k.randi(0, map.data.width * GLOBAL_SCALE),
    k.randi(0, map.data.height * GLOBAL_SCALE)
  );

  const player = getFirst("player");

  if (!player) {
    return pos;
  }

  while (pos.dist(player.pos) < 200) {
    pos.x = k.randi(0, map.data.width * GLOBAL_SCALE);
    pos.y = k.randi(0, map.data.height * GLOBAL_SCALE);
  }

  return pos;
}

export function findGhostinyPatrolPosition() {
  const map = getCurrentMap();

  if (!map) {
    return k.vec2(0, 0);
  }

  const patches = k.get("grass_patch");

  const randomPatch = k.choose(patches);
  const pos = randomPatch.pos.add(
    k.randi(0, randomPatch.size.x),
    k.randi(0, randomPatch.size.y)
  );

  const player = getFirst("player");

  if (!player) {
    return pos;
  }

  while (pos.dist(player.pos) < 200) {
    const randomPatch = k.choose(patches);
    pos.x = randomPatch.pos.x + k.randi(0, randomPatch.size.x);
    pos.y = randomPatch.pos.y + k.randi(0, randomPatch.size.y);
  }

  return pos;
}
