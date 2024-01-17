uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform float uScreenAspect;
varying vec2 vUv;

void main() {
  // アスペクト比からテクスチャの比率を計算
  // ~ 1.0 までの値になる
  vec2 ratio = vec2(
    min(uScreenAspect / uTextureAspect, 1.0),
    min(uTextureAspect / uScreenAspect, 1.0)
  );
  // 中央に配置するためのオフセットを計算
  vec2 textureUv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

  vec4 color = texture2D(uTexture, textureUv);

  gl_FragColor = color;
}