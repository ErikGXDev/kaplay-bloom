import "./style.css";

import { k } from "./kaplay";
import "./assets";

import "./scenes/game";
import "./scenes/mainMenu";
import "./scenes/gameOver";
import { playMusic } from "./music";

k.onLoad(() => {
  k.go("mainMenu");
  playMusic();
  // k.go("game", k.choose(LEVELS));
});
