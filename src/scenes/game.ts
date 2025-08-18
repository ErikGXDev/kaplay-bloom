import type { GameObj, Vec2 } from "kaplay";
import { GLOBAL_SCALE } from "../config";
import { k } from "../kaplay";
import { addMap, getCurrentMap, getEntities } from "../map";
import { addMark } from "../objects/player";
import { addGrassPatch } from "../objects/grass";
import { addGigagantrum } from "../objects/enemies/gigagantrum";
import { addButterflyRandom } from "../objects/enemies/butterfly";
import { addScore, addScoreText } from "../objects/score";
import { addProgressBar } from "../objects/progressBar";
import { diffMultiplier, gameState, resetLevelGameState } from "../gameState";
import { ditherOpacityShader } from "../gfx/dither";
import { getFirst } from "../util";
import { drawCircleOptimized } from "../gfx/draw";
import { LEVELS } from "../assets";
import { addGhostinyRandom } from "../objects/enemies/ghostiny";
import { addSmallGigagantrum } from "../objects/enemies/smallGigagantrum";
import { addHeartDisplay } from "../objects/hearts";

k.scene(
  "game",
  (mapId: string = "Level_0", mod: { slowBoot?: boolean } = {}) => {
    // MODIFIERS
    const modifiers = {
      flipX: k.chance(0.3),
    };

    console.log(`Loading level: ${mapId}`);
    const map = addMap(mapId, modifiers);

    if (!map) {
      console.error(`Failed to load map: ${mapId}`);
      return;
    }

    const fadeIns = k.get("map_part");

    const fadeInTime = mod.slowBoot ? 1.3 : 0.5;

    fadeIns.forEach((obj) => {
      obj.use(ditherOpacityShader(obj.sprite));

      obj.uniform!.u_opacity = 0;
      k.tween(0, 1, fadeInTime, (t) => {
        if (!obj.uniform) {
          return;
        }
        obj.uniform.u_opacity = t;
      }).then(() => {
        obj.unuse("shader");
      });
    });

    const mapSize = k.vec2(map.data.width, map.data.height).scale(GLOBAL_SCALE);
    k.setCamPos(mapSize.x / 2, mapSize.y / 2);

    const spawns = getEntities(map.data, "PlayerSpawn", modifiers);

    const playerSpawn = k.choose(spawns);

    if (playerSpawn) {
      addMark(k.vec2(playerSpawn.x, playerSpawn.y).scale(GLOBAL_SCALE));
    }

    //gameRNG.seed = map.data.x + map.data.y;

    addScoreText(k.vec2(mapSize.x - 16, 12));

    const progressBar = addProgressBar(k.vec2(mapSize.x / 2, 30));

    progressBar.onUpdate(() => {
      const newProgress = k.clamp(
        k.map(
          gameState.level.enemiesDefeated,
          0,
          gameState.level.totalEnemies,
          0,
          100
        ),
        0,
        100
      );

      if (progressBar.progress === newProgress) {
        return;
      }

      progressBar.progress = newProgress;
    });

    resetLevelGameState();
    gameState.level.totalEnemies =
      10 +
      Math.floor((gameState.completedLevels / 1.3) * diffMultiplier()) +
      Math.floor(gameState.completedLevels / 3) * diffMultiplier(); // Set total enemies for the level

    if (gameState.completedLevels > 8) {
      gameState.level.totalEnemies += Math.floor(gameState.completedLevels / 4);
    }

    const levelText = "Level " + (gameState.completedLevels + 1);
    const levelTitle = k.add([
      k.text(levelText, { size: 32 }),
      k.color(k.rgb("#323c39")),
      k.anchor("center"),
      k.scale(1),
      k.pos(k.getCamPos()),
      k.z(1000),
    ]);

    const levelTitleBg = k.add([
      k.rect(levelTitle.width + 16, levelTitle.height + 16, {
        radius: 8,
      }),
      k.color(k.rgb("#a4b26f")),
      k.scale(1),
      k.anchor("center"),
      k.pos(levelTitle.pos),
      k.z(999),
    ]);

    k.tween(0, levelText.length, 1, (t) => {
      const len = Math.floor(t);
      levelTitle.text = levelText.slice(0, len);
      levelTitleBg.width = levelTitle.width + 16;
    }).then(async () => {
      await k.wait(1);
      await k.tween(levelText.length, 0, 0.5, (t) => {
        levelTitle.text = levelText.slice(0, Math.floor(t));
        levelTitleBg.width = levelTitle.width + 16;
      });
      levelTitleBg.destroy();
      levelTitle.destroy();
    });

    if (window.location.port === "5173") {
      k.add([
        k.text("FPS", { size: 16 }),
        k.color(k.rgb("#323c39")),
        k.pos(0, -24),
        k.z(1000),
        {
          update(this: GameObj) {
            this.text = `FPS: ${k.debug.fps()}`;
          },
        },
      ]);
    }

    addHeartDisplay(k.vec2(24, 24));

    getEntities(map.data, "GrassPatch", modifiers).forEach((patch) => {
      const pos = k.vec2(patch.x, patch.y).scale(GLOBAL_SCALE);
      const width = patch.width * GLOBAL_SCALE;
      const height = patch.height * GLOBAL_SCALE;

      addGrassPatch(pos, width, height);
    });

    // getEntities(map.data, "Enemy").forEach((enemy) => {
    //   addGigagantrum(k.vec2(enemy.x, enemy.y).scale(GLOBAL_SCALE));
    // });

    const timerEntity = k.add([
      k.timer(),
      {
        lastSpawn: mod.slowBoot ? 5 : 9,
      },
      "timer_entity",
    ]);

    timerEntity.onUpdate(() => {
      timerEntity.lastSpawn += k.dt();

      if (
        timerEntity.lastSpawn >= 10 ||
        (k.get("enemy").length == 0 && gameState.level.enemiesDefeated > 0)
      ) {
        if (gameState.level.enemiesSpawned >= gameState.level.totalEnemies) {
          timerEntity.destroy();
          return;
        }

        const spawnPositions = getEntities(map.data, "Enemy", modifiers);

        console.log(
          `Spawning enemies: ${gameState.level.enemiesSpawned} / ${gameState.level.totalEnemies}`
        );

        if (spawnPositions.length > 0) {
          const lowerBound =
            2 + Math.floor(gameState.completedLevels / 5) * diffMultiplier();
          const upperBound =
            4 + Math.floor((gameState.completedLevels / 5) * diffMultiplier());

          let spawnAmount = k.randi(
            lowerBound,
            Math.min(upperBound, spawnPositions.length)
          );

          if (
            gameState.level.enemiesSpawned + spawnAmount >
              gameState.level.totalEnemies ||
            gameState.level.enemiesSpawned + upperBound + 1 >
              gameState.level.totalEnemies
          ) {
            spawnAmount =
              gameState.level.totalEnemies - gameState.level.enemiesSpawned;
          }

          const randomSpawn = k.chooseMultiple(spawnPositions, spawnAmount);
          randomSpawn.forEach((spawn) => {
            const pos = k.vec2(spawn.x, spawn.y).scale(GLOBAL_SCALE);
            spawnRandomEnemy(pos);
          });

          console.log(`Spawned ${spawnAmount} enemies`);

          gameState.level.enemiesSpawned += spawnAmount;
        }

        timerEntity.lastSpawn = 0;
      }
    });

    //addButterflyRandom();

    //k.setCamScale(0.8);

    const update = k.onUpdate(() => {
      if (gameState.level.enemiesDefeated >= gameState.level.totalEnemies) {
        console.log("Level complete!");
        update.paused = true;
        update.cancel();
        k.wait(1, () => {
          endStage();
        });
      }
    });

    k.onKeyPress("ö", () => {
      gameState.level.enemiesDefeated++;
    });

    k.onKeyPress("ä", () => {
      const player = getFirst("player");
      if (player) {
        player.hp--;
      }
    });

    k.onKeyPress("ü", () => {
      const index = LEVELS.indexOf(map.data.identifier);
      k.go("game", LEVELS[(index + 1) % LEVELS.length]);
    });
  }
);

function spawnRandomEnemy(pos: Vec2) {
  const enemyTypes = [
    "gigagantrum",
    "gigagantrum",
    "gigagantrum",
    "gigagantrum",
    "gigagantrum",
    "gigagantrum",
    "small_gigagantrum",
    "small_gigagantrum",
    "butterfly",
    "butterfly",
    "butterfly",
    "ghostiny",
  ];
  const randIndex = Math.floor(k.randi(0, enemyTypes.length));
  const enemyType = enemyTypes[randIndex];

  if (enemyType === "gigagantrum") {
    addGigagantrum(pos);
  } else if (enemyType === "small_gigagantrum") {
    addSmallGigagantrum(pos);
  } else if (enemyType === "butterfly") {
    addButterflyRandom();
  } else if (enemyType === "ghostiny") {
    addGhostinyRandom();
  }
}

async function endStage() {
  fadeOutStage();

  await k.wait(1);

  const map = getCurrentMap();

  const flowerCounter = k.add([
    k.text("0x", { size: 32, align: "center" }),
    k.anchor("center"),
    k.color(k.rgb("#323c39")),
    k.pos(k.getCamPos().add(0, 50)),
    k.z(998),
  ]);

  const flowerCounterBg = k.add([
    k.rect(flowerCounter.width + 16, flowerCounter.height + 16, {
      radius: 8,
    }),
    k.color(k.rgb("#a4b26f")),
    k.anchor("center"),
    k.pos(flowerCounter.pos),
    k.z(997),
  ]);

  const sunflower = k.add([
    k.sprite("sunflower0"),
    k.pos(k.getCamPos().add(0, -128)),
    ditherOpacityShader("sunflower0"),
    k.anchor("center"),
    k.scale(2),
    k.rotate(0),
    k.animate(),
    k.z(1000),
  ]);

  sunflower.uniform!.u_opacity = 0;
  await k.tween(0, 1, 0.5, (t) => {
    if (!sunflower.uniform) {
      return;
    }
    sunflower.uniform.u_opacity = t;
  });
  sunflower.uniform!.u_opacity = 1;

  sunflower.animate("angle", [-10, 10, -10], {
    duration: 1.8,
    easing: k.easings.easeInOutQuad,
  });

  const patches = k.get("grass_patch");

  const totalFlowers = patches.reduce(
    (acc, patch) => acc + patch.flowers.length,
    0
  );
  let wateredFlowers = 0;

  let goodJobText = "Good job!";

  let updateI = 0;
  const sunflowerUpdate = sunflower.onUpdate(() => {
    flowerCounterBg.width = flowerCounter.width + 16;

    if (wateredFlowers >= totalFlowers - 14) {
      sunflower.sprite = "sunflower4";
      if (gameState.health < 3) {
        goodJobText = "Amazing! (+1HP)";
      } else {
        goodJobText = "Amazing!";
      }
    } else if (wateredFlowers >= totalFlowers / 1.4) {
      sunflower.sprite = "sunflower3";
      goodJobText = "Great job!";
    } else if (wateredFlowers >= totalFlowers / 2.5) {
      sunflower.sprite = "sunflower2";
      goodJobText = "Keep it up!";
    } else if (wateredFlowers >= totalFlowers / 8) {
      sunflower.sprite = "sunflower1";
      goodJobText = "Good job!";
    } else {
      sunflower.sprite = "sunflower0";
    }

    updateI++;
    if (updateI % 10 === 0) {
      sunflower.scale = k.vec2(2.3);

      k.play("blip", {
        volume: 0.2,
        detune: 200,
      });
    }
    sunflower.scale = k.lerp(sunflower.scale, k.vec2(2), 0.2);
  });

  await Promise.all(
    patches.map(async (patch) => {
      const visited: Set<string> = patch.visited;

      while (visited.size > 0) {
        // remove entries one by one
        const flower = visited.values().next().value;
        if (!flower) {
          break;
        }
        visited.delete(flower);
        addScore(0.5);
        wateredFlowers++;
        flowerCounter.text = `${wateredFlowers}x`;
        await k.wait(0.04);
      }
    })
  );

  k.play("strum2", {
    volume: 0.5,
  });

  sunflowerUpdate.cancel();

  k.tween(k.vec2(2.4), k.vec2(2), 0.25, (t) => {
    sunflower.scale = t;
  });

  const goodJob = k.add([
    k.text(goodJobText, { size: 32, align: "center" }),
    k.anchor("center"),
    k.color(k.rgb("#323c39")),
    k.pos(k.getCamPos().add(0, 128)),
    k.z(998),
  ]);

  if (goodJobText.includes("+1HP")) {
    gameState.health = Math.min(gameState.health + 1, 3);
  }

  k.add([
    k.rect(goodJob.width + 16, goodJob.height + 16, {
      radius: 8,
    }),
    k.color(k.rgb("#a4b26f")),
    k.anchor("center"),
    k.pos(goodJob.pos),
    k.z(997),
  ]);

  await k.wait(2);

  const curtainCircle = k.add([
    k.z(999),
    k.pos(sunflower.pos),
    k.anchor("center"),
    {
      circleRadius: 0,
    },
  ]);

  curtainCircle.onDraw(() => {
    drawCircleOptimized({
      pos: k.vec2(0, 0),
      radius: curtainCircle.circleRadius,
      color: k.rgb("#a4b26f"),
    });
  });

  k.tween(1, 0, 1, (t) => {
    sunflower.uniform!.u_opacity = t;
  });

  await k.tween(0, k.width() / 1.5, 1.5, (t) => {
    curtainCircle.circleRadius = t;
  });

  const name = map?.data.identifier;

  let nextLevel = k.choose(LEVELS);

  while (nextLevel === name) {
    nextLevel = k.choose(LEVELS);
  }

  gameState.completedLevels++;

  k.go("game", nextLevel);
}

export async function fadeOutStage() {
  const progressBar = getFirst("progress_bar");

  if (progressBar) {
    k.tween(progressBar.pos.y, -200, 1, (t) => {
      progressBar.pos.y = t;
    });
  }

  const destroys = [
    ...k.get("bullet"),
    ...k.get("splash"),
    ...k.get("enemy"),
    ...k.get("timer_entity"),
  ];

  destroys.forEach((obj) => {
    obj.destroy();
  });

  const player = k.get("player")[0];

  player.paused = true;

  const fadeOuts = [
    ...k.get("map_part"),
    ...k.get("player"),
    //...player.get("*"),
    //...player.get("*").flatMap((obj) => obj.get("*")),
  ];

  fadeOuts.forEach((obj) => {
    if (!obj.sprite) {
      return;
    }

    obj.use(ditherOpacityShader(obj.sprite));

    obj.uniform!.u_opacity = 1;
    k.tween(1, 0, 0.8, (t) => {
      if (!obj.uniform) {
        return;
      }
      obj.uniform.u_opacity = t;
    }).then(() => {
      obj.destroy();
    });
  });
}
