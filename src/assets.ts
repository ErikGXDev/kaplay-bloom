import { k } from "./kaplay";
import { loadMapAssets } from "./map";

k.loadSprite("mark", "sprites/mark.png");

k.loadSprite("bean", "sprites/bean.png");

k.loadSprite("butterfly", "sprites/butterfly.png");

k.loadSprite("gigagantrum", "sprites/gigagantrum.png");

k.loadSprite("small_gigagantrum", "sprites/small_gigagantrum.png");

k.loadSprite("heart", "sprites/heart.png");

k.loadSprite("ghostiny", "sprites/ghostiny.png");

k.loadSpriteAtlas("sprites/tileset.png", {
  dither1: { x: 192, y: 0, width: 4, height: 4 },
});

k.loadMusic(
  "between_the_dunes",
  "sounds/music/flowerhead_between_the_dunes.ogg"
);
k.loadMusic("brain_empty", "sounds/music/flowerhead_brain_empty.ogg");
k.loadMusic("summer", "sounds/music/flowerhead_summer.ogg");

k.loadSound("plop", "sounds/sfx/plop.mp3");

k.loadSound("quiet_click_eq", "sounds/sfx/quiet_click_eq.wav");

k.loadSound("strum2", "sounds/sfx/strum2.wav");
k.loadSound("strum3", "sounds/sfx/strum3.wav");

k.loadSound("bump", "sounds/sfx/bump.wav");

k.loadSound("click", "sounds/sfx/click.wav");

k.loadSound("blip", "sounds/sfx/blip.wav");

k.loadSpriteAtlas("sprites/items.png", {
  sword: { x: 117, y: 3, width: 30, height: 79 },
  water_gun: { x: 64, y: 9, width: 48, height: 40 },
  water_0: { x: 120, y: 37, width: 21, height: 16 },
  water_1: { x: 122, y: 21, width: 16, height: 13 },
  water_2: { x: 149, y: 23, width: 13, height: 10 },
  water_3: { x: 172, y: 24, width: 10, height: 9 },
  drop_shadow: { x: 62, y: 79, width: 62, height: 27 },
  curtain: { x: 240, y: 0, width: 16, height: 16 },
  ghostiny_bullet: { x: 205, y: 4, width: 32, height: 32 },
});

k.loadSpriteAtlas("sprites/flowers.png", {
  flower1: { x: 34, y: 0, width: 12, height: 16 },
  flower2: { x: 51, y: 1, width: 9, height: 14 },
  flower3: { x: 34, y: 17, width: 11, height: 14 },
  grass1: { x: 49, y: 16, width: 8, height: 8 },
  grass2: { x: 56, y: 16, width: 8, height: 8 },
});

k.loadSpriteAtlas("sprites/sunflower.png", {
  sunflower0: { x: 0, y: 0, width: 128, height: 128 },
  sunflower1: { x: 128, y: 0, width: 128, height: 128 },
  sunflower2: { x: 256, y: 0, width: 128, height: 128 },
  sunflower3: { x: 384, y: 0, width: 128, height: 128 },
  sunflower4: { x: 512, y: 0, width: 128, height: 128 },
});

k.loadShaderURL("ditherOpacity", null, "shaders/ditherOpacity.glsl");

k.loadBitmapFont("unscii", "fonts/unscii_8x8.png", 8, 8);

export const LEVELS = [
  "Level_0",
  "Level_1",
  "Level_2",
  "Level_3",
  "Level_4",
  "Level_5",
  "Level_6",
  "Level_7",
  "Level_8",
  "Level_9",
];

LEVELS.forEach((level) => {
  loadMapAssets(level);
});
