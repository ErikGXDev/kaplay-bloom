import { type Vec2 } from "kaplay";
import { k } from "../kaplay";
import { GLOBAL_SCALE } from "../config";
import { pushBack } from "./fx/pushback";
import { gameState } from "../gameState";
import { ditherOpacityShader } from "../gfx/dither";
import { updateHeartDisplay } from "./hearts";
import { fadeOutStage } from "../scenes/game";

export function addMark(pos: Vec2) {
  const mark = k.add([
    k.sprite("mark"),
    k.pos(pos),
    k.anchor("center"),
    k.area({
      shape: new k.Circle(k.vec2(0, 0), (24 * GLOBAL_SCALE) / 2),
    }),
    ditherOpacityShader("mark"),
    k.body(),
    k.scale(GLOBAL_SCALE / 2),
    k.health(gameState.health),
    k.z(100),
    "player",
    "local_player",
    {
      invincible: false,
      lastInvincibleTime: 0,
    },
  ]);

  mark.onHurt((deltaHP = 1) => {
    console.log("Mark hurt, deltaHP:", deltaHP);

    if (mark.invincible) {
      k.play("bump", {
        volume: 0.2,
        detune: 1200,
      });

      mark.hp += deltaHP;
      return;
    }

    k.play("bump", {
      volume: 0.3,
      detune: 200,
    });

    mark.invincible = true;
    mark.lastInvincibleTime = k.time();

    mark.hp = Math.min(mark.hp, 3);

    gameState.health = mark.hp;

    updateHeartDisplay();
  });

  mark.onDeath(async () => {
    k.play("bump", {
      volume: 0.5,
      detune: -400,
    });

    fadeOutStage();

    await k.wait(2);

    k.go("gameOver");
  });

  const MOVE_SPEED = 200;

  mark.onUpdate(() => {
    if (mark.invincible) {
      if (mark.uniform) {
        mark.uniform!.u_opacity = k.wave(0.5, 1, k.time() * 10);
      }
      if (k.time() - mark.lastInvincibleTime > 1.5) {
        mark.invincible = false;
        mark.uniform!.u_opacity = 1;
      }
    }

    waterGun.uniform!.u_opacity = mark.uniform!.u_opacity;

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
    ditherOpacityShader("water_gun"),
    k.pos(30, 0),
    k.z(101),
    k.anchor("left"),
  ]);

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
    mark.hp--;
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
    k.play("quiet_click_eq", {
      volume: 0.5,
    });
    water.destroy();
  });

  water.onDestroy(() => {
    addWaterSplash(water.pos);
  });

  return water;
}

export function addWaterSplash(pos: Vec2) {
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
