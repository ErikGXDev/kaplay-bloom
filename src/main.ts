import "./style.css";

import { k } from "./kaplay";
import "./assets";

import "./scenes/game";

k.onLoad(() => {
  k.go("game");
});
