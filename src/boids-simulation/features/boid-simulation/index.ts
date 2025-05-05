import { Boid } from '../../entities/boid/index';
import { BOID_COUNT, BOID_VELOCITY } from '../../shared/constants/settings';
import {
  cohesionBehavior,
  alignmentBehavior,
  separationBehavior,
} from './behavior';

export class BoidSimulation {
  #boids: Boid[] = [];
  #ctx: CanvasRenderingContext2D;
  #loop: number | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.#ctx = ctx;
    this.#boids = this.#createBoids();
  }

  #createBoids(): Boid[] {
    const boids: Boid[] = [];
    for (let i = 0; i < BOID_COUNT; i++) {
      const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      const θ = Math.random() * 2 * Math.PI;
      boids.push(
        new Boid({
          position: {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          },
          direction: { x: Math.cos(θ), y: Math.sin(θ) },
          velocity: BOID_VELOCITY + Math.random() * 4,
          color,
          flock: boids,
          behaviors: [cohesionBehavior, alignmentBehavior, separationBehavior],
        })
      );
    }
    return boids;
  }

  /** 群れの重心を計算 */
  #calcFlockCenter(): { x: number; y: number } {
    let x = 0,
      y = 0;
    for (const b of this.#boids) {
      x += b.position.x;
      y += b.position.y;
    }
    return { x: x / BOID_COUNT, y: y / BOID_COUNT };
  }

  /** 1フレーム分の実行 */
  #run() {
    const flockCenter = this.#calcFlockCenter();
    this.#ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const boid of this.#boids) {
      boid.update(flockCenter);
      boid.edge(window.innerWidth, window.innerHeight);
      boid.draw(this.#ctx);
    }
  }

  /** アニメーション開始 */
  start() {
    if (this.#loop) {
      return;
    }
    const loop = () => {
      this.#run();
      this.#loop = requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /** アニメーション停止 */
  stop() {
    if (!this.#loop) {
      return;
    }
    cancelAnimationFrame(this.#loop);
    this.#loop = null;
  }

  /** アニメーションリセット */
  reset() {
    this.#boids = this.#createBoids();
    if (this.#loop) return;
    this.start();
  }
}
