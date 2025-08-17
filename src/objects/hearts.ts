import type { Vec2 } from "kaplay";
import { gameState } from "../gameState";
import { k } from "../kaplay";
import { getFirst } from "../util";

export function addHeartDisplay(pos: Vec2) {
  k.add([k.pos(pos), k.z(1000), "heart_display"]);

  updateHeartDisplay();
}

export function updateHeartDisplay() {
  console.log("Updating heart display with health:", gameState.health);

  const heartDisplay = getFirst("heart_display");

  if (!heartDisplay) return;

  heartDisplay.get("heart_item").forEach((heart) => {
    heart.destroy();
  });

  for (let i = 0; i < gameState.health; i++) {
    const heart = heartDisplay.add([
      k.sprite("heart"),
      k.pos(i * 48, 0),
      k.anchor("center"),
      k.z(1000),
      k.animate(),
      "heart_item",
    ]);

    heart.onUpdate(() => {
      heart.pos.y = k.wave(-2, 2, k.time() * 2 - i);
    });
  }
}
