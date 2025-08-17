import kaplay from "kaplay";

const k = kaplay({
  crisp: true,
  background: "#a4b26f",
  pixelDensity: Math.max(window.devicePixelRatio, 2),
  font: "unscii",
  //width: 512 * 2,
  //height: 384 * 2,
  //letterbox: true,
});

export { k };
