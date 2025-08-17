import type { Vec2 } from "kaplay";
import { k } from "../kaplay";
import { getFirst } from "../util";

export function addProgressBar(pos: Vec2) {
  const WIDTH = 450;
  const HEIGHT = 20;

  const PAD = 10;

  const progressBar = k.add([
    k.rect(WIDTH + PAD, HEIGHT + PAD),
    k.color(k.rgb("#323c39")),
    k.pos(pos.add(k.vec2(-PAD - WIDTH / 2, -PAD - HEIGHT / 2))),
    k.z(1000),
    {
      progress: 50,
    },
    "progress_bar",
  ]);

  progressBar.onDraw(() => {
    k.drawRect({
      pos: k.vec2(PAD / 2, PAD / 2),
      width: WIDTH * (progressBar.progress / 100),
      height: 20,
      color: k.rgb("#a4b26f"),
    });
  });

  return progressBar;
}

function setProgress(percentage: number) {
  const progressBar = getFirst("progress_bar");
  if (!progressBar) {
    return;
  }
  progressBar.progress = Math.max(0, Math.min(100, percentage));
}

export function addProgress(percentage: number) {
  setProgress(getProgress() + percentage);
}

export function getProgress(): number {
  const progressBar = getFirst("progress_bar");
  if (!progressBar) {
    return 0;
  }
  return progressBar.progress;
}
