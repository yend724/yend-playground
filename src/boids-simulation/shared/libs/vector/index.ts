export interface Vector {
  x: number;
  y: number;
}

// ベクトルを正規化
export const normalize = (v: Vector): Vector => {
  const mag = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / mag, y: v.y / mag };
};

// ベクトル同士の加算
export const add = (a: Vector, b: Vector): Vector => {
  return { x: a.x + b.x, y: a.y + b.y };
};

// ベクトルをスカラー倍
export const scale = (v: Vector, s: number): Vector => {
  return { x: v.x * s, y: v.y * s };
};

// ベクトルの長さを計算
export const length = (v: Vector): number => {
  return Math.hypot(v.x, v.y);
};

// ベクトル同士の乗算
export const multiple = (a: Vector, b: Vector): Vector => {
  return { x: a.x * b.x, y: a.y * b.y };
};
