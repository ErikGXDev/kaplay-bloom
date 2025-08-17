import { k } from "./kaplay";

let currentlyPlayingMusic: string | null = null;

export function playMusic() {
  const nextMusic = chooseNextMusic();
  currentlyPlayingMusic = nextMusic;

  const song = k.play(currentlyPlayingMusic, {
    volume: 0.3,
  });

  song.volume = 0.3;

  song.onEnd(() => {
    playMusic();
  });
}

export function chooseNextMusic() {
  const musicList = ["summer", "brain_empty", "between_the_dunes"];

  let nextMusic = k.choose(musicList);

  while (nextMusic === currentlyPlayingMusic) {
    nextMusic = k.choose(musicList);
  }

  return nextMusic;
}
