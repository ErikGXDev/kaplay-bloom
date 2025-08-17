// Made primarily with
// https://en.wikipedia.org/wiki/Ordered_dithering

uniform vec2 u_quad_pos;

uniform vec2 u_quad_size;

uniform vec2 u_resolution;

uniform float u_dither_scale;

uniform float u_opacity;

// Convert global UV coordinates to local UV coordinates
vec2 toLocalUV(vec2 uv) {
  return (uv - u_quad_pos) / u_quad_size;
}

// Convert local UV coordinates to global UV coordinates
vec2 toGlobalUV(vec2 localUV) {
  return localUV * u_quad_size + u_quad_pos;
}

// Bayer dithering threshold matrix
float getBayerThreshold(vec2 pixel) {

  vec2 scaledPixel = pixel / u_dither_scale;

  int x = int(mod(scaledPixel.x, 4.0));
  int y = int(mod(scaledPixel.y, 4.0));

  if(x == 0 && y == 0)
    return 0.0 / 16.0;
  if(x == 0 && y == 1)
    return 12.0 / 16.0;
  if(x == 0 && y == 2)
    return 3.0 / 16.0;
  if(x == 0 && y == 3)
    return 15.0 / 16.0;

  if(x == 1 && y == 0)
    return 8.0 / 16.0;
  if(x == 1 && y == 1)
    return 4.0 / 16.0;
  if(x == 1 && y == 2)
    return 11.0 / 16.0;
  if(x == 1 && y == 3)
    return 7.0 / 16.0;

  if(x == 2 && y == 0)
    return 2.0 / 16.0;
  if(x == 2 && y == 1)
    return 14.0 / 16.0;
  if(x == 2 && y == 2)
    return 1.0 / 16.0;
  if(x == 2 && y == 3)
    return 13.0 / 16.0;

  if(x == 3 && y == 0)
    return 10.0 / 16.0;
  if(x == 3 && y == 1)
    return 6.0 / 16.0;
  if(x == 3 && y == 2)
    return 9.0 / 16.0;

  return 5.0 / 16.0; // x == 3 && y == 3
}

vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {

  // Sample the texture
  vec4 tcolor = texture2D(tex, uv);

  if(tcolor.a == 0.0 || u_opacity <= 0.0) {
    discard;
  }

  vec2 localUV = toLocalUV(uv);
  vec2 pixel = localUV * u_resolution;

  // Use the original alpha for dithering
  float brightness = u_opacity;

  // Get threshold from Bayer matrix
  float threshold = getBayerThreshold(pixel);

  // Dither: if threshold > brightness, make transparent, otherwise keep original color
  if(threshold > brightness) {
    discard; // Or return vec4(0.0)
  }

  // Return original color with full alpha (since we're using discard for transparency)
  return vec4(tcolor.rgb, 1.0);
}