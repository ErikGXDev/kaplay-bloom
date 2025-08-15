import { join } from "path";
import {
  copyFileSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmdirSync,
  mkdirSync,
  rmSync,
} from "fs";

if (!__dirname) {
  throw new Error("This script must be run with Node.js");
}

const MAP_DIR = join(__dirname, "../maps/map/simplified");
const DEST_DIR = join(__dirname, "../public/maps");

const FILES = ["Terrain.png", "Decoration.png", "data.json", "_composite.png"];

const maps = readdirSync(MAP_DIR);

maps.forEach((map) => {
  if (existsSync(join(DEST_DIR, map))) {
    console.log(`Map ${map} already exists in destination directory`);
    rmdirSync(join(DEST_DIR, map), { recursive: true });
    mkdirSync(join(DEST_DIR, map), { recursive: true });
  } else {
    mkdirSync(join(DEST_DIR, map), { recursive: true });
  }

  FILES.forEach((file) => {
    let destFile = file;

    if (file === "_composite.png") {
      destFile = "Composite.png";
    }

    if (existsSync(join(DEST_DIR, map, destFile))) {
      rmSync(join(DEST_DIR, map, destFile));
    }

    copyFileSync(join(MAP_DIR, map, file), join(DEST_DIR, map, destFile));
  });

  const csv = readFileSync(join(MAP_DIR, map, "AgentGrid.csv"), "utf8");
  const rows = csv.split("\n");
  const data = rows
    .map((row) =>
      row
        .split(",")
        .filter((cell) => cell !== "")
        .map((cell) => parseInt(cell))
    )
    .filter((row) => row.length > 0);
  const json = JSON.stringify(data);

  writeFileSync(join(DEST_DIR, map, "agent.json"), json);

  console.log(`Copied map ${map}`);
});
