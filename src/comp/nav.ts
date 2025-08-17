import type { GameObj } from "kaplay";
import { k } from "../kaplay";
import { getCurrentMap } from "../map";

export function nav() {
  const map = getCurrentMap();

  if (!map) {
    return;
  }

  const navMesh = map.navMesh;

  return {
    _frame: 0,
    enableNavigation: true,

    add(this: GameObj) {
      this.use(
        k.pathfinder({
          graph: navMesh,
          navigationOpt: {
            type: "edges",
          },
        })
      );
    },

    updateNavigation(this: GameObj) {
      if (!this.exists()) return;

      this._frame++;
      // Theoretically 144hz players have it harder now
      if (this._frame % 60 === 0) {
        this._frame = 0;

        try {
          const players = k.get("player").sort((a, b) => {
            return a.pos.dist(this.pos) - b.pos.dist(this.pos);
          });

          if (players.length == 0) return;

          const player = players[0];

          const path = this.navigateTo(player.pos);

          if (!path) return;
          if (path.length === 0) return;

          this.waypoints = path;
        } catch (error) {}
      }
    },

    update(this: GameObj) {
      if (!this.exists()) return;

      this.updateNavigation();
    },
  };
}
