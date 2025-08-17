import type { Vec2 } from "kaplay";
import { k } from "../kaplay";
import { getFirst } from "../util";
import { gameState } from "../gameState";

export function addScoreText(pos: Vec2) {
  const text = k.add([
    k.pos(pos),
    k.text("0", {
      size: 24,
      align: "right",
    }),
    k.anchor("topright"),
    k.z(1000),
    k.color(k.rgb("#323c39")),
    "score_text",
  ]);

  text.onUpdate(() => {
    text.pos = pos.add(k.vec2(Math.floor(k.wave(-2, 2, k.time() * 2)), 0));
  });

  setScore(gameState.score);
}

export function setScore(number: number) {
  const scoreText = getFirst("score_text");
  if (!scoreText) {
    return;
  }
  scoreText.text = Math.floor(number).toString();
  gameState.score = number;
}

export function addScore(number: number) {
  setScore(gameState.score + number);
}
