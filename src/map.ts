import { GLOBAL_SCALE } from "./config";
//import { addDepthEffect, addTileDepthEffect } from "./gfx/depth";
import { k } from "./kaplay";

let _currentMap: ReturnType<typeof addMap> | null = null;

export function getCurrentMap() {
  return _currentMap;
}

export function loadMapAssets(mapId: string) {
  k.loadSprite(`map_${mapId}_decoration`, `maps/${mapId}/Decoration.png`);
  k.loadSprite(`map_${mapId}_terrain`, `maps/${mapId}/Terrain.png`);
  k.loadSprite(`map_${mapId}_composite`, `maps/${mapId}/Composite.png`);
  k.loadJSON(`map_${mapId}_data`, `maps/${mapId}/data.json`);
  k.loadJSON(`${mapId}_agent`, `maps/${mapId}/agent.json`);
}

export function addAgentMap(mapid: string, mod: { flipX?: boolean } = {}) {
  const navAsset = k.getAsset(mapid + "_agent");

  if (!navAsset?.loaded || !navAsset) {
    throw new Error("Nav data not loaded");
  }

  const navData = navAsset.data;

  const navMesh = new k.NavMesh();

  // NavData is a 2D array of 0s and 1s
  // 0 = not walkable
  // 1 = walkable

  let i = 0;

  navData.forEach((row: number[], y: number) => {
    if (mod.flipX) {
      row = row.reverse();
    }
    row.forEach((cell: number, x: number) => {
      if (cell === 1) {
        navMesh.addRect(
          k.vec2(x, y).scale(32).scale(GLOBAL_SCALE),
          k.vec2(32 * GLOBAL_SCALE)
        );

        i++;
      }
    });
  });

  console.log("Added", i, "navmesh rects");

  return navMesh;
}

export function addMap(mapId: string, mod: { flipX?: boolean } = {}) {
  const mapBackground = k.add([
    k.sprite(`map_${mapId}_composite`),
    k.layer("background"),
    k.scale(GLOBAL_SCALE),
    k.pos(0, 0),
    "map_background",
    "map_part",
  ]);

  const mapTerrain = k.add([
    k.sprite(`map_${mapId}_terrain`),
    k.z(10),
    k.scale(GLOBAL_SCALE),
    k.pos(0, 0),
    "map_terrain",
    "map_part",
  ]);

  const mapDecoration = k.add([
    k.sprite(`map_${mapId}_decoration`),
    k.z(20),
    k.scale(GLOBAL_SCALE),
    k.pos(0, 0),
    "map_decoration",
    "map_part",
  ]);

  if (mod.flipX) {
    mapBackground.flipX = true;
    mapTerrain.flipX = true;
    mapDecoration.flipX = true;
  }

  /*
  const mapTerrainDepth = k.add([
    k.sprite(`map_${mapId}_terrain`),
    k.z(5),
    k.scale(SCALE),
    //tileDepthShader(4, `map_${mapId}_tiles`),
    "map_tiles_depth",
  ]);*/

  const navMesh = addAgentMap(mapId, mod);

  const mapData = k.getAsset(`map_${mapId}_data`)?.data;

  if (!mapData) {
    console.error(`Map ${mapId} not found`);
    return;
  }

  getEntities(mapData, "Collision", mod).forEach((tile: any) => {
    k.add([
      k.rect(tile.width * GLOBAL_SCALE, tile.height * GLOBAL_SCALE),
      k.pos(tile.x * GLOBAL_SCALE, tile.y * GLOBAL_SCALE),
      k.area(),
      k.body({ isStatic: true }),
      k.opacity(0),
      "collision",
    ]);
  });

  const currentMap = {
    background: mapBackground,
    terrain: mapTerrain,
    decoration: mapDecoration,
    data: mapData,
    navMesh: navMesh,
  };

  _currentMap = currentMap;

  return currentMap;
}

export function fitCameraToMap() {
  const map = getCurrentMap();

  if (!map) {
    return;
  }
}

const ignoreWidth = ["Enemy", "PlayerSpawn"];

export function getEntities(
  mapData: any,
  entity: string,
  mod: { flipX?: boolean } = {}
): any[] {
  if (mod.flipX) {
    return (mapData.entities[entity] ?? []).map((e: any) => {
      let newX = mapData.width - e.x;

      if (!ignoreWidth.includes(entity)) {
        newX -= e.width;
      }

      return {
        ...e,
        x: newX,
      };
    });
  }
  return mapData.entities[entity] ?? [];
}
