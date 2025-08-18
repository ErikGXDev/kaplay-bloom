import { type Vec2 } from "kaplay";
import { k } from "../kaplay";
import { getSpriteDimensions } from "../gfx/sprite";
import { addScore } from "./score";
import { gameState } from "../gameState";

export function addGrassPatch(pos: Vec2, width: number, height: number) {
  const patch = k.add([
    k.pos(pos),
    k.area({
      shape: new k.Rect(k.vec2(0, 0), width, height),
    }),
    {
      priorityFlowers: [] as Vec2[],
      flowers: [] as Vec2[],
      visited: new Set<string>(),
      visitedOnce: new Set<string>(),
      filled: false,
      size: k.vec2(width, height),
    },
    "grass_patch",
  ]);

  const flowerDim = getSpriteDimensions("flower1");

  /*
  for (let i = 0; i < density; i++) {
    const x = k.randi(12, width - 12) - flowerDim.x / 2;
    const y = k.randi(12, height - 12) - flowerDim.y / 2;

    patch.flowers.push(k.vec2(x, y));
  }*/

  // generate a grid of flowers
  // make every second row offset by half a flower width
  const gridW = flowerDim.x * 1.66 + 3;
  const gridH = 16;

  const cols = Math.floor(width / gridW);
  const rows = Math.floor(height / gridH);

  for (let row = 0; row < rows; row++) {
    let colEnd = cols;
    if (row % 2 === 0) {
      colEnd++;
    }
    for (let col = 0; col < colEnd; col++) {
      const x =
        col * gridW +
        (row % 2) * (gridW / 2) -
        flowerDim.x / 2 +
        k.randi(-2, 2);
      const y = row * gridH - flowerDim.y / 1.5;

      if (row === 0) {
        patch.priorityFlowers.push(k.vec2(x, y));
      }
      patch.flowers.push(k.vec2(x, y));
    }
  }

  patch.flowers.sort((a, b) => {
    return a.y - b.y;
  });

  let lastSoundTime = 0;

  function flowerVisitCheck(pos: Vec2) {
    for (const flower of patch.flowers) {
      if (
        flower.add(patch.pos).dist(pos) < 24 &&
        !patch.visited.has(flower.toString())
      ) {
        const flowerString = flower.toString();
        patch.visited.add(flowerString);

        if (k.time() - lastSoundTime > 0.08) {
          k.play("plop", {
            volume: 0.12,
            detune: k.randi(-3, 3) * 100,
          });

          lastSoundTime = k.time();
        }

        if (!patch.visitedOnce.has(flowerString)) {
          patch.visitedOnce.add(flowerString);
          // TODO: figure out score balancing
          addScore(5);
        }
      }
    }

    if (patch.visited.size > patch.flowers.length - 4) {
      patch.visited = new Set<string>(patch.flowers.map((f) => f.toString()));

      if (!patch.filled) {
        // reward the rest of the flowers that were auto-filled
        const remainingFlowers = patch.flowers.length - patch.visitedOnce.size;
        addScore(remainingFlowers * 5);

        patch.visitedOnce = new Set<string>(
          patch.flowers.map((f) => f.toString())
        );

        addScore(50);
      }
      patch.filled = true;
    }
  }

  function flowerBreakCheck(pos: Vec2) {
    for (const flower of patch.flowers) {
      if (
        flower.add(patch.pos).dist(pos) < 36 &&
        patch.visited.has(flower.toString())
      ) {
        patch.visited.delete(flower.toString());
      }
    }
  }

  patch.onCollideUpdate("bullet", (bullet) => {
    flowerVisitCheck(bullet.pos);
  });

  patch.onCollideUpdate("splash", (splash) => {
    flowerVisitCheck(splash.pos);
  });

  patch.onCollideUpdate("flower_enemy", (flowerEnemy) => {
    flowerBreakCheck(flowerEnemy.pos);
  });

  k.beginPicture(new k.Picture());

  k.drawRect({
    pos: k.vec2(-2, 0),
    color: k.Color.fromHex("#a4b26f"),
    width: width + 4,
    height: height + 4,
    outline: {
      color: k.Color.fromHex("#323c39"),
      width: 2,
    },
  });
  k.drawSprite({
    sprite: "dither1",
    pos: k.vec2(0, 0),
    width: width,
    height: height,
    tiled: true,
  });

  for (let i = 0; i < 16; i++) {
    const x = k.randi(2, width - 10);
    const y = k.randi(2, height - 10);

    k.drawSprite({
      sprite: k.choose(["grass1", "grass2"]),
      pos: k.vec2(x, y),
      scale: k.vec2(2),
    });
  }

  const picture = k.endPicture();

  patch.onDraw(() => {
    if (patch.visited.size !== patch.flowers.length) {
      k.drawPicture(picture, { pos: k.vec2(0, 0) });
    }

    for (const flower of patch.flowers) {
      if (patch.visited.has(flower.toString())) {
        drawFlower(flower);
      }
    }
  });

  const patchPriority = k.add([k.pos(patch.pos), k.z(60)]);

  patchPriority.onDraw(() => {
    for (const flower of patch.priorityFlowers) {
      if (patch.visited.has(flower.toString())) {
        drawFlower(flower);
      }
    }
  });
}

const grassRNG = new k.RNG(0);

export function drawFlower(flower: Vec2) {
  grassRNG.seed = flower.x + flower.y;
  const flowerIndex = k.clamp(Math.floor(grassRNG.genNumber(0, 3)) + 1, 1, 3);

  if (gameState.graphicsQuality === "High") {
    const waveOffsetX = k.wave(-2, 2, k.time() + flower.y / 70);
    const waveOffsetY = -k.wave(-2, 2, k.time() + flower.x / 70);
    const flooredOffsetX = Math.floor(waveOffsetX / 0.25) * 0.25;
    const flooredOffsetY = Math.floor(waveOffsetY / 0.25) * 0.25;

    flower = flower.add(flooredOffsetX, flooredOffsetY);
  }

  k.drawSprite({
    sprite: "flower" + flowerIndex,
    scale: k.vec2(2),
    pos: flower,
  });
}
