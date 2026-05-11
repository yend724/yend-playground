// =========================================
// Defaults
// =========================================
const DEFAULTS = Object.freeze({
  size: 3,
  density: 60,
  bg: '#000000',
  color1: '#868686',
  opacity1: 35,
  color2: '#FFFFFF',
  opacity2: 35,
  speed: 2,
});

// =========================================
// Pure: state に依存しない数学/文字列変換
// =========================================
// サイズ(px) → baseFrequency
// Figmaの「Size」はピクセル単位のスケールなので、それに対応させる。
// baseFrequencyは「viewBox 1単位あたりの周期数」だが、
// viewBoxを実表示サイズに合わせれば「1px粒なら周波数=0.5、Npx粒なら周波数=1/(N*2)」となる。
const sizeToBaseFrequency = (sizePx) => (1 / (sizePx * 2)).toFixed(4);

const hexToRgbNorm = (hex) => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
};

// 全体密度を各レイヤーの密度に変換する
// 独立な2レイヤーで「少なくとも片方が色付き」になる確率: P = 1 - (1 - p)²
// 逆算: p = 1 - √(1 - P)
//   例: 全体60% → 各レイヤー約37%
//       全体80% → 各レイヤー約55%
//       全体100% → 各レイヤー100%
const totalDensityToLayerDensity = (totalPct) =>
  (1 - Math.sqrt(1 - totalPct / 100)) * 100;

// 1レイヤー用のtableValuesを作る
// 「自分の密度」分だけセルに色を入れる(独立ノイズなので各レイヤーは独立に密度を持つ)
const buildLayerTables = (hex, opacityPct, perLayerDensityPct) => {
  const N = 14;
  const colored = Math.round(N * (perLayerDensityPct / 100));
  const empty = N - colored;
  const [r, g, b] = hexToRgbNorm(hex);
  const a = opacityPct / 100;
  const fmt = (arr) => arr.map(v => v.toFixed(3)).join(' ');
  const fill = (val) => fmt([...Array(empty).fill(0), ...Array(colored).fill(val)]);
  return { r: fill(r), g: fill(g), b: fill(b), a: fill(a) };
};

// state → 描画パラメータ
const deriveDrawParams = (state) => {
  const bf = sizeToBaseFrequency(state.size);
  const layerDensity = totalDensityToLayerDensity(state.density);
  return {
    bf,
    t1: buildLayerTables(state.color1, state.opacity1, layerDensity),
    t2: buildLayerTables(state.color2, state.opacity2, layerDensity),
  };
};

const buildSvgCode = (viewBox, bf, t1, t2) =>
`<!-- 注: viewBoxを実表示pxサイズに合わせるとサイズ指定がpx基準で働きます -->
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="${viewBox}" preserveAspectRatio="none">
  <defs>
    <filter id="noise1" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise"
        baseFrequency="${bf}" numOctaves="1"
        seed="1" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="
        1 0 0 0 0 1 0 0 0 0
        1 0 0 0 0 0 0 0 0 1" result="mono"/>
      <feComponentTransfer in="mono">
        <feFuncR type="discrete" tableValues="${t1.r}"/>
        <feFuncG type="discrete" tableValues="${t1.g}"/>
        <feFuncB type="discrete" tableValues="${t1.b}"/>
        <feFuncA type="discrete" tableValues="${t1.a}"/>
      </feComponentTransfer>
    </filter>
    <filter id="noise2" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise"
        baseFrequency="${bf}" numOctaves="1"
        seed="500" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="
        1 0 0 0 0 1 0 0 0 0
        1 0 0 0 0 0 0 0 0 1" result="mono"/>
      <feComponentTransfer in="mono">
        <feFuncR type="discrete" tableValues="${t2.r}"/>
        <feFuncG type="discrete" tableValues="${t2.g}"/>
        <feFuncB type="discrete" tableValues="${t2.b}"/>
        <feFuncA type="discrete" tableValues="${t2.a}"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="100%" height="100%" filter="url(#noise1)"/>
  <rect width="100%" height="100%" filter="url(#noise2)"/>
</svg>`;

const speedToInterval = (speed) => Math.max(1, 11 - speed);
const clampPct = (v) => Math.max(0, Math.min(100, v));
const isHex6 = (v) => /^#[0-9A-Fa-f]{6}$/.test(v);

// =========================================
// DOM refs (一度だけ取得)
// =========================================
const dom = Object.freeze({
  svg: document.getElementById('svg'),
  turb1: document.getElementById('turb1'),
  turb2: document.getElementById('turb2'),
  f1R: document.getElementById('f1R'),
  f1G: document.getElementById('f1G'),
  f1B: document.getElementById('f1B'),
  f1A: document.getElementById('f1A'),
  f2R: document.getElementById('f2R'),
  f2G: document.getElementById('f2G'),
  f2B: document.getElementById('f2B'),
  f2A: document.getElementById('f2A'),
  codeBlock: document.getElementById('codeBlock'),
  toggleBtn: document.getElementById('toggleBtn'),
  resetBtn: document.getElementById('resetBtn'),
});

// =========================================
// Side effects: viewBox を実表示サイズに合わせる
// =========================================
const fitViewBox = () => {
  const rect = dom.svg.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  dom.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
};

// =========================================
// Side effects: state → DOM
// =========================================
const render = (state) => {
  document.documentElement.style.setProperty('--noise-bg', state.bg);

  const { bf, t1, t2 } = deriveDrawParams(state);

  dom.turb1.setAttribute('baseFrequency', bf);
  dom.turb2.setAttribute('baseFrequency', bf);

  dom.f1R.setAttribute('tableValues', t1.r);
  dom.f1G.setAttribute('tableValues', t1.g);
  dom.f1B.setAttribute('tableValues', t1.b);
  dom.f1A.setAttribute('tableValues', t1.a);
  dom.f2R.setAttribute('tableValues', t2.r);
  dom.f2G.setAttribute('tableValues', t2.g);
  dom.f2B.setAttribute('tableValues', t2.b);
  dom.f2A.setAttribute('tableValues', t2.a);

  dom.codeBlock.textContent = buildSvgCode(dom.svg.getAttribute('viewBox'), bf, t1, t2);
};

// state → コントロールUI(reset時のみ全件同期)
const syncControlsFromState = (s) => {
  const setVal = (id, v) => { document.getElementById(id).value = v; };
  const setText = (id, v) => { document.getElementById(id).textContent = v; };
  const setSwatch = (id, v) => { document.getElementById(id).parentElement.style.background = v; };

  setVal('sizeRange', s.size);     setText('sizeValue', s.size);
  setVal('densityRange', s.density); setText('densityValue', s.density + '%');
  setVal('speedRange', s.speed);   setText('speedValue', s.speed);

  setVal('color1Picker', s.color1); setVal('color1Hex', s.color1); setSwatch('color1Picker', s.color1);
  setVal('color2Picker', s.color2); setVal('color2Hex', s.color2); setSwatch('color2Picker', s.color2);
  setVal('bgPicker', s.bg);         setVal('bgHex', s.bg);         setSwatch('bgPicker', s.bg);

  setVal('color1Opacity', s.opacity1);
  setVal('color2Opacity', s.opacity2);
};

// =========================================
// State: 単一の不変セル。setState 経由でのみ差し替え
// =========================================
let state = Object.freeze({ ...DEFAULTS });
const setState = (patch) => {
  state = Object.freeze({ ...state, ...patch });
  render(state);
};

// =========================================
// Animation: 副作用を局所化した可変セル
// =========================================
const anim = { active: false, rafId: null, frame: 0 };

const tick = () => {
  if (state.speed > 0 && anim.frame % speedToInterval(state.speed) === 0) {
    dom.turb1.setAttribute('seed', Math.floor(Math.random() * 1000));
    dom.turb2.setAttribute('seed', Math.floor(Math.random() * 1000) + 500);
  }
  anim.frame++;
  anim.rafId = requestAnimationFrame(tick);
};

const startAnimation = () => {
  if (anim.active) return;
  anim.active = true;
  dom.toggleBtn.textContent = 'Pause';
  anim.rafId = requestAnimationFrame(tick);
};

const stopAnimation = () => {
  if (!anim.active) return;
  anim.active = false;
  dom.toggleBtn.textContent = 'Animate';
  if (anim.rafId !== null) cancelAnimationFrame(anim.rafId);
  anim.rafId = null;
};

const syncAnimationToSpeed = () => {
  if (state.speed > 0 && !anim.active) startAnimation();
  else if (state.speed === 0 && anim.active) stopAnimation();
};

// =========================================
// UI binding (境界の副作用)
// =========================================
const bindRange = (id, valueId, key, suffix = '') => {
  const el = document.getElementById(id);
  const valueEl = document.getElementById(valueId);
  el.addEventListener('input', () => {
    setState({ [key]: Number(el.value) });
    valueEl.textContent = el.value + suffix;
    if (key === 'speed') syncAnimationToSpeed();
  });
};

const bindColor = (pickerId, hexId, key) => {
  const picker = document.getElementById(pickerId);
  const hex = document.getElementById(hexId);
  const swatch = picker.parentElement;
  const update = (value) => {
    if (!isHex6(value)) return;
    const upper = value.toUpperCase();
    setState({ [key]: upper });
    picker.value = value;
    hex.value = upper;
    swatch.style.background = value;
  };
  picker.addEventListener('input', () => update(picker.value));
  hex.addEventListener('input', () => {
    const v = hex.value.trim();
    const normalized = v.startsWith('#') ? v : '#' + v;
    if (isHex6(normalized)) update(normalized);
  });
};

const bindOpacity = (id, key) => {
  const el = document.getElementById(id);
  el.addEventListener('input', () => {
    setState({ [key]: clampPct(Number(el.value) || 0) });
  });
  el.addEventListener('blur', () => { el.value = state[key]; });
};

bindRange('sizeRange', 'sizeValue', 'size');
bindRange('densityRange', 'densityValue', 'density', '%');
bindRange('speedRange', 'speedValue', 'speed');
bindColor('color1Picker', 'color1Hex', 'color1');
bindColor('color2Picker', 'color2Hex', 'color2');
bindColor('bgPicker', 'bgHex', 'bg');
bindOpacity('color1Opacity', 'opacity1');
bindOpacity('color2Opacity', 'opacity2');

dom.toggleBtn.addEventListener('click', () => {
  anim.active ? stopAnimation() : startAnimation();
});

dom.resetBtn.addEventListener('click', () => {
  stopAnimation();
  setState(DEFAULTS);
  syncControlsFromState(state);
});

// =========================================
// 初期化
// =========================================
fitViewBox();
render(state);
if (state.speed > 0) startAnimation();

// リサイズ時にviewBoxを再計算してbaseFrequencyを再適用
window.addEventListener('resize', () => {
  fitViewBox();
  render(state);
});
