import "./style.css";

import { k } from "./kaplay";
import "./assets";

import "./scenes/game";
import "./scenes/mainMenu";
import { LEVELS } from "./assets";

k.onLoad(() => {
  k.go("mainMenu");
  // k.go("game", k.choose(LEVELS));
});
