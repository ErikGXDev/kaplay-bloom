import { type Vec2 } from "kaplay";
import { k } from "../kaplay";
import { GLOBAL_SCALE } from "../config";
import { pushBack } from "./pushback";

export function addMark(pos: Vec2) {
  const mark = k.add([
    k.sprite("mark"),
    k.pos(pos),
    k.anchor("center"),
    k.area({
      shape: new k.Circle(k.vec2(0, 0), (24 * GLOBAL_SCALE) / 2),
    }),
    k.body(),
    k.scale(GLOBAL_SCALE / 2),
    k.z(100),
    "player",
    "local_player",
  ]);

  const MOVE_SPEED = 200;

  mark.onUpdate(() => {
    const moveDirection = k.vec2(0, 0);

    if (k.isKeyDown("a") || k.isKeyDown("left")) {
      moveDirection.x -= 1;
    }
    if (k.isKeyDown("d") || k.isKeyDown("right")) {
      moveDirection.x += 1;
    }
    if (k.isKeyDown("w") || k.isKeyDown("up")) {
      moveDirection.y -= 1;
    }
    if (k.isKeyDown("s") || k.isKeyDown("down")) {
      moveDirection.y += 1;
    }

    mark.move(moveDirection.unit().scale(MOVE_SPEED));
  });

  const markRotator = mark.add([k.pos(0, 0), k.rotate(0)]);

  markRotator.onUpdate(() => {
    markRotator.angle = k.toWorld(k.mousePos()).angle(mark.pos);

    if (markRotator.angle > 90 || markRotator.angle < -90) {
      waterGun.flipY = true;
    } else {
      waterGun.flipY = false;
    }
  });

  const waterGun = markRotator.add([
    k.sprite("water_gun"),
    k.pos(30, 0),
    k.z(101),
    k.anchor("left"),
  ]);

  const WATER_SPEED = 300;

  let lastShotTime = 0;

  mark.onMousePress("left", () => {
    const currentTime = k.time();
    if (currentTime - lastShotTime < 0.2) {
      return; // Prevent rapid firing
    }
    lastShotTime = currentTime;

    const angle = markRotator.angle;

    const angleVec = k.Vec2.fromAngle(angle);

    const waterPos = mark.pos.add(angleVec.scale(70));

    addWaterBullet(waterPos, angle);
  });

  mark.onCollide("enemy", (enemy) => {
    pushBack(mark, enemy);
  });

  /*
  mark.onMousePress("left", () => {
    const rotator = mark.add([k.pos(0, 0), k.rotate(0)]);

    rotator.add([k.sprite("sword"), k.pos(0, -32), k.anchor("bot"), k.z(100)]);

    k.tween(0, 360, 0.75, (t) => {
      rotator.angle = t;
    }).then(() => {
      rotator.destroy();
    });
  });*/
}

const WATER_SPEED = 300;

function addWaterBullet(pos: Vec2, angle: number) {
  const water = k.add([
    k.sprite("water_1"),
    k.pos(pos),
    k.anchor("center"),
    k.area({
      scale: 0.5,
    }),
    k.scale(GLOBAL_SCALE / 2),
    k.z(100),
    k.rotate(angle),
    "bullet",
  ]);

  const angleVec = k.Vec2.fromAngle(angle);

  water.onUpdate(() => {
    water.move(angleVec.scale(WATER_SPEED));
  });

  k.tween(
    water.scale.x,
    0.3,
    1,
    (t) => {
      water.scale = k.vec2(t);
    },
    k.easings.easeInExpo
  ).then(() => {
    water.destroy();
  });

  water.onCollide("collision", () => {
    water.destroy();
  });

  water.onDestroy(() => {
    addWaterSplash(water.pos);
  });

  return water;
}

function addWaterSplash(pos: Vec2) {
  let splashAngle = k.randi(0, 90);
  for (let i = 0; i < 6; i++) {
    addWaterSplashDrop(pos, splashAngle + 60 * i);
  }
}

async function addWaterSplashDrop(pos: Vec2, angle: number) {
  const splash = k.add([
    k.sprite("water_3"),
    k.pos(pos),
    k.anchor("center"),
    k.rotate(k.randi(0, 360)),
    k.area({
      scale: 0.5,
    }),
    k.scale(GLOBAL_SCALE / 2),
    "splash",
  ]);

  const angleVec = k.Vec2.fromAngle(angle);

  splash.onCollide("collision", () => {
    splash.destroy();
  });

  splash.onUpdate(() => {
    splash.move(angleVec.scale(WATER_SPEED * 0.5));
  });

  await k.tween(
    splash.scale.x,
    0.3,
    0.3,
    (t) => {
      splash.scale = k.vec2(t);
    },
    k.easings.easeInExpo
  );

  splash.destroy();
}
