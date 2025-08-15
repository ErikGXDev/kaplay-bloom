import type { GameObj } from "kaplay";
import { GLOBAL_SCALE } from "../config";
import { k } from "../kaplay";
import { addMap, getEntities } from "../map";
import { addMark } from "../objects/player";
import { addGrassPatch } from "../objects/grass";
import { addGigagantrum } from "../objects/enemies/gigagantrum";
import { addButterflyRandom } from "../objects/enemies/butterfly";
import { addScoreText } from "../objects/score";

k.scene("game", (mapId: string = "Level_0") => {
  console.log(`Loading level: ${mapId}`);
  const map = addMap(mapId);

  if (!map) {
    console.error(`Failed to load map: ${mapId}`);
    return;
  }

  const mapSize = k.vec2(map.data.width, map.data.height).scale(GLOBAL_SCALE);
  k.setCamPos(mapSize.x / 2, mapSize.y / 2);

  const spawns = getEntities(map.data, "PlayerSpawn");

  const playerSpawn = k.choose(spawns);

  if (playerSpawn) {
    addMark(k.vec2(playerSpawn.x, playerSpawn.y).scale(GLOBAL_SCALE));
  }

  addScoreText(k.vec2(mapSize.x - 16, 12));

  k.add([
    k.text("FPS", { size: 16 }),
    k.pos(10, 10),
    k.z(100),
    {
      update(this: GameObj) {
        this.text = `FPS: ${k.debug.fps()}`;
      },
    },
  ]);

  getEntities(map.data, "GrassPatch").forEach((patch) => {
    const pos = k.vec2(patch.x, patch.y).scale(GLOBAL_SCALE);
    const width = patch.width * GLOBAL_SCALE;
    const height = patch.height * GLOBAL_SCALE;
    const density = patch.customFields.density; // Default density if not specified

    addGrassPatch(pos, width, height, density);
  });

  getEntities(map.data, "Enemy").forEach((enemy) => {
    addGigagantrum(k.vec2(enemy.x, enemy.y).scale(GLOBAL_SCALE));
  });

  addButterflyRandom();
});
