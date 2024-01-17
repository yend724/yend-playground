uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform float uScreenAspect;
varying vec2 vUv;

void main() {
  // アスペクト比からテクスチャの比率を計算
  // 1.0 ~　の値になる
  vec2 ratio = vec2(
    max(uScreenAspect / uTextureAspect, 1.0),
    max(uTextureAspect / uScreenAspect, 1.0)
  );
  // 中央に配置するための計算
  vec2 textureUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  vec4 color = texture2D(uTexture, textureUv);

  // テクスチャの範囲外は黒にする
  vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
  float outOfBounds = float(textureUv.x < 0.0 || textureUv.x > 1.0 || textureUv.y < 0.0 || textureUv.y > 1.0);

  gl_FragColor = mix(color, black, outOfBounds);
}