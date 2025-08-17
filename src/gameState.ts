export const Difficulties = ["Easy", "Hard"];

export const GraphicsQualities = ["Low", "High"];

export const gameState = {
  score: 0,

  health: 3,

  highScore: 0,

  /** How many levels were completed so far */
  completedLevels: 0,

  difficulty: "Easy",

  graphicsQuality: "High",

  level: {
    /**  How many enemies will spawn in total in the current level */
    totalEnemies: 0,

    /** How many enemies have spawned so far in the current level */
    enemiesSpawned: 0,

    /** How many enemies have been defeated so far in the current level */
    enemiesDefeated: 0,
  },
};

export function resetGameState() {
  gameState.score = 0;
  gameState.health = 3;
  gameState.completedLevels = 0;
  resetLevelGameState();
}

export function resetLevelGameState() {
  gameState.level.totalEnemies = 0;
  gameState.level.enemiesSpawned = 0;
  gameState.level.enemiesDefeated = 0;
}

export function diffMultiplier() {
  const difficulty = gameState.difficulty;
  if (difficulty === "Easy") {
    return 1;
  } else if (difficulty === "Hard") {
    return 2;
  }

  // Default multiplier
  return 1;
}
