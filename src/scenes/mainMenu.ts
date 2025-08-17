import type { Vec2 } from "kaplay";
import { GLOBAL_SCALE } from "../config";
import { ditherOpacityShader } from "../gfx/dither";
import { k } from "../kaplay";
import { LEVELS } from "../assets";
import { addWaterSplash } from "../objects/player";
import { drawCircleOptimized } from "../gfx/draw";
import { Difficulties, gameState, GraphicsQualities } from "../gameState";

k.scene("mainMenu", () => {
  const title = k.add([
    k.text("DUALTONE FIELDS", {
      size: 40,
      align: "center",
    }),
    k.anchor("center"),
    k.pos(k.width() / 2, k.height() / 2 - 200),
    k.z(1000),
    k.color(k.rgb("#323c39")),
  ]);

  const titleBg = k.add([
    k.rect(title.width + 8, title.height + 8),
    k.anchor("center"),
    k.color(k.rgb("#a4b26f")),
    k.pos(title.pos),
    k.z(999),
  ]);

  const controls = k.add([
    k.text("Controls:\n\nWASD - Move\nMouse - Aim\nLeft Click - Shoot Water", {
      size: 20,
      align: "left",
      lineSpacing: 3,
    }),
    k.color(k.rgb("#323c39")),
    k.anchor("center"),
    k.pos(k.width() / 2, k.height() / 2 + 200),
  ]);

  k.loop(5, () => {
    addBackgroundFlower();
  });

  const btn1 = addButton(
    "Play",
    k.vec2(k.width() / 2, k.height() / 2 - 60),
    () => {
      btn1.paused = true;
      btn2.paused = true;

      k.setCursor("default");
      playGame();
    },
    {
      wavy: true,
    }
  );

  let difficultyIndex = Difficulties.indexOf(gameState.difficulty);

  const btn2 = addButton(
    "Difficulty: " + gameState.difficulty,
    k.vec2(k.width() / 2, k.height() / 2),
    () => {
      difficultyIndex = (difficultyIndex + 1) % Difficulties.length;
      gameState.difficulty = Difficulties[difficultyIndex];

      const title = btn2.get("buttonTitle")[0];
      title.text = `Difficulty: ${gameState.difficulty}`;
    }
  );

  let graphicsIndex = GraphicsQualities.indexOf(gameState.graphicsQuality);

  const btn3 = addButton(
    "Graphics: " + gameState.graphicsQuality,
    k.vec2(k.width() / 2, k.height() / 2 + 60),
    () => {
      graphicsIndex = (graphicsIndex + 1) % GraphicsQualities.length;
      gameState.graphicsQuality = GraphicsQualities[graphicsIndex];

      const title = btn3.get("buttonTitle")[0];
      title.text = `Graphics: ${gameState.graphicsQuality}`;
    }
  );

  k.onMousePress(() => {
    if (k.get("background_flower_small").length >= 24) {
      return;
    }

    const mp = k.mousePos();
    addWaterSplash(mp);

    const offset = k.randi(0, 360);
    k.wait(0.3, () => {
      for (let i = 0; i < 6; i++) {
        const flower = "flower" + k.randi(1, 4);

        const flowerObj = k.add([
          k.sprite(flower),
          k.pos(mp.add(k.Vec2.fromAngle((360 / 6) * i + offset).scale(48))),
          k.anchor("center"),
          ditherOpacityShader(flower),
          k.z(-1),
          k.scale(GLOBAL_SCALE),
          "background_flower_small",
        ]);

        k.wait(k.rand(0.5, 1), () => {
          k.tween(1, 0, 0.8, (t) => {
            if (!flowerObj.uniform) {
              return;
            }
            flowerObj.uniform.u_opacity = t;
          }).then(() => {
            flowerObj.destroy();
          });
        });
      }
    });
  });
});

export function addButton(
  text: string,
  pos: Vec2,
  onClick: () => void,
  mod: {
    wavy?: boolean;
  } = {}
) {
  const button = k.add([
    k.rect(200, 50),
    k.anchor("center"),
    k.pos(pos),
    k.area(),
    k.color(k.rgb("#a4b26f")),
  ]);

  const buttonTitle = button.add([
    k.text(text, {
      size: 24,
      align: "center",
    }),
    k.anchor("center"),
    k.pos(0, 0),
    k.color(k.rgb("#323c39")),
    "buttonTitle",
  ]);

  button.width = buttonTitle.width + 78;

  const leftBracketPos = k.vec2(-buttonTitle.width / 2 - 16, 0);

  const rightBracketPos = k.vec2(buttonTitle.width / 2 + 16, 0);

  const leftBracket = buttonTitle.add([
    k.text("[", {
      size: 24,
    }),
    k.anchor("center"),
    k.pos(leftBracketPos),
    k.color(k.rgb("#323c39")),
  ]);

  const rightBracket = buttonTitle.add([
    k.text("]", {
      size: 24,
    }),
    k.anchor("center"),
    k.pos(rightBracketPos),
    k.color(k.rgb("#323c39")),
  ]);

  button.onHover(() => {
    k.setCursor("pointer");
  });

  button.onHoverEnd(() => {
    k.setCursor("default");
  });

  button.onUpdate(() => {
    let offsetL = 0;
    let offsetR = 0;
    if (button.isHovering()) {
      offsetL = -10;
      offsetR = 10;
    }

    button.width = buttonTitle.width + 78;

    const leftBracketPos = k.vec2(-buttonTitle.width / 2 - 16, 0);

    const rightBracketPos = k.vec2(buttonTitle.width / 2 + 16, 0);

    leftBracket.pos = k.lerp(
      leftBracket.pos,
      leftBracketPos.add(k.vec2(offsetL, 0)),
      0.1
    );

    rightBracket.pos = k.lerp(
      rightBracket.pos,
      rightBracketPos.add(k.vec2(offsetR, 0)),
      0.1
    );

    if (mod.wavy) {
      leftBracket.pos.x += k.wave(-0.5, 0, k.time() * 3);

      rightBracket.pos.x += k.wave(0.5, 0, k.time() * 3);
    }
  });

  button.onClick(() => {
    onClick();
  });

  return button;
}

function addBackgroundFlower() {
  const randPos = k.vec2(k.randi(0, k.width()), k.randi(0, k.height()));

  const flower = "sunflower" + k.randi(1, 5);

  const bgFlower = k.add([
    k.sprite(flower),
    k.pos(randPos),
    k.anchor("center"),
    ditherOpacityShader(flower),
    k.rotate(k.randi(0, 360)),
    k.z(-1),
    k.scale(k.randi(1, 3) * GLOBAL_SCALE),
    "background_flower",
  ]);

  const targetOpacity = k.randi(2, 4) / 10;

  bgFlower.uniform!.u_opacity = 0;

  k.tween(0, targetOpacity, 2, (t) => {
    if (!bgFlower.uniform) {
      return;
    }
    bgFlower.uniform.u_opacity = t;
  });

  k.wait(10, () => {
    k.tween(targetOpacity, 0, 0.8, (t) => {
      if (!bgFlower.uniform) {
        return;
      }
      bgFlower.uniform.u_opacity = t;
    }).then(() => {
      bgFlower.destroy();
    });
  });
}

async function playGame() {
  const flowers = k.get("background_flower");

  for (const flower of flowers) {
    k.tween(flower.uniform!.u_opacity, 0, 0.8, (t) => {
      if (!flower.uniform) {
        return;
      }
      flower.uniform.u_opacity = t;
    }).then(() => {
      flower.destroy();
    });
  }

  const curtainCircle = k.add([
    k.z(999),
    k.pos(k.mousePos()),
    k.z(9999),
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

  await k.tween(0, k.width() / 1.5, 1.7, (t) => {
    curtainCircle.circleRadius = t;
  });

  k.go("game", k.choose(LEVELS), {
    slowBoot: true,
  });
}
