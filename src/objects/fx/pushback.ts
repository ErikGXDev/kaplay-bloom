import type { GameObj } from "kaplay";
import { k } from "../../kaplay";

export function pushBack(
  target: GameObj,
  from: GameObj,
  distance = 30,
  time = 0.2
) {
  const pushbackVec = target.pos.sub(from.pos).unit().scale(distance);

  k.tween(
    target.pos,
    target.pos.add(pushbackVec),
    time,
    (t) => {
      target.pos = t;
    },
    k.easings.easeOutExpo
  );
}

export function pushBackAngle(target: GameObj, from: GameObj, distance = 20) {
  const pushbackVec = k.Vec2.fromAngle(from.angle).unit().scale(distance);

  k.tween(
    target.pos,
    target.pos.add(pushbackVec),
    0.2,
    (t) => {
      target.pos = t;
    },
    k.easings.easeOutExpo
  );
}
