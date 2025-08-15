import type { GameObj } from "kaplay";
import { k } from "./kaplay";

export function getFirst(tag: string): GameObj | null {
  const objs = k.get(tag);
  return objs.length > 0 ? objs[0] : null;
}

export function getRandom(tag: string): GameObj | null {
  const objs = k.get(tag);
  if (objs.length === 0) return null;
  return k.choose(objs);
}
