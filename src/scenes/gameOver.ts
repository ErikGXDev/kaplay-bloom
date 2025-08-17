import { gameState } from "../gameState";
import { ditherOpacityShader } from "../gfx/dither";
import { k } from "../kaplay";

k.scene("gameOver", () => {
  k.add([
    k.text("Game Over!", { size: 48 }),
    k.pos(k.center().add(k.vec2(0, -180))),
    k.anchor("center"),
    k.color(k.rgb("#323c39")),
  ]);

  k.add([
    k.text(
      `Your score: ${gameState.score}\n\n\nPress any key to return\nto the main menu.`,
      {
        size: 24,
        width: 700,
        lineSpacing: 8,
        align: "center",
      }
    ),
    k.pos(k.center().add(k.vec2(0, -40))),
    k.anchor("center"),
    k.color(k.rgb("#323c39")),
  ]);

  if (gameState.score >= gameState.highScore) {
    console.log("New high score!");
    k.add([
      k.text(`[wavy]New high score![/wavy]`, {
        size: 16,
        width: 700,
        lineSpacing: 8,
        align: "center",
        styles: {
          wavy: () => ({
            angle: k.wave(-10, 10, k.time() * 2),
          }),
        },
      }),
      k.pos(k.center().add(k.vec2(0, -65))),
      k.anchor("center"),
      k.color(k.rgb("#323c39")),
    ]);

    k.wait(1, () => {
      gameState.highScore = gameState.score;
    });
  }

  k.add([
    k.text("Tip: Water all flowers in a level to gain health!", {
      size: 16,
      width: 500,
      lineSpacing: 6,
      align: "center",
    }),
    k.pos(k.center().add(k.vec2(0, 100))),
    k.anchor("center"),
    k.color(k.rgb("#323c39")),
  ]);

  const mark = k.add([
    k.sprite("mark"),
    k.pos(k.center().add(k.vec2(0, 230))),
    k.anchor("center"),
    ditherOpacityShader("mark"),
    k.scale(2),
    k.z(100),
    k.animate(),
  ]);
  mark.animate("angle", [-10, 10, -10], {
    duration: 3,
    easing: k.easings.easeInOutQuad,
  });

  mark.onUpdate(() => {
    mark.uniform!.u_opacity = k.wave(0.4, 0.9, k.time());
  });

  k.wait(2, () => {
    k.onKeyPress(() => {
      k.go("mainMenu");
    });

    k.onClick(() => {
      k.go("mainMenu");
    });
  });
});
