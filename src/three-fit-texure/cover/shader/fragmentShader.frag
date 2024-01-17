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
  // 中央に配置するための計算
  vec2 textureUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  vec4 color = texture2D(uTexture, textureUv);

  gl_FragColor = color;
}