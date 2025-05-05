import { type Vector, normalize, add, scale } from '../../shared/libs/vector';
import type { Behavior } from './behavior';

export class Boid {
  position: Vector;
  direction: Vector;
  velocity: number;
  flock: Boid[];
  nearestNeighbor: Boid;
  color: string;
  behaviors: Behavior[];

  constructor({
    position,
    direction,
    velocity,
    color,
    flock,
    behaviors,
  }: {
    position: Vector;
    direction: Vector;
    velocity: number;
    color: string;
    flock: Boid[];
    behaviors: Behavior[];
  }) {
    this.position = position;
    this.direction = direction;
    this.velocity = velocity;
    this.flock = flock;
    this.nearestNeighbor = this;
    this.color = color;
    this.behaviors = behaviors;
  }

  /** 描画 */
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(Math.atan2(this.direction.y, this.direction.x));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, 5);
    ctx.lineTo(-15, -5);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }

  /** 1ステップ分の更新 */
  update(flockCenter: Vector) {
    // --- Search (最近接仲間) ---
    let minDistance = Infinity;
    this.nearestNeighbor = this;
    for (const boid of this.flock) {
      // 前方にいるか
      const deltaX = boid.position.x - this.position.x;
      const deltaY = boid.position.y - this.position.y;
      const dot = this.direction.x * deltaX + this.direction.y * deltaY;
      if (dot <= 0) continue;

      const distance = Math.hypot(deltaX, deltaY);
      if (distance < minDistance) {
        minDistance = distance;
        this.nearestNeighbor = boid;
      }
    }

    // 初期ベクトルに現在の向きをセット
    let newDir = { ...this.direction };

    const behaviors = this.behaviors;
    for (const behavior of behaviors) {
      newDir = add(
        newDir,
        scale(behavior.compute(this, flockCenter), behavior.weight)
      );
    }

    this.direction = normalize(newDir);

    // 速度ベクトル移動
    this.position.x += this.direction.x * this.velocity;
    this.position.y += this.direction.y * this.velocity;
  }

  /** 画面端反射 */
  edge(width: number, height: number) {
    const padding = 20;
    const wrap = (value: number, max: number): number => {
      const m = value % (max + padding);
      return m < -padding ? m + max + padding : m;
    };
    this.position.x = wrap(this.position.x, width);
    this.position.y = wrap(this.position.y, height);
  }
}
