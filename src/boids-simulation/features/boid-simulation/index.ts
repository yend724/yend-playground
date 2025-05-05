import { BOID_COUNT, BOID_VELOCITY } from '../../shared/constants/settings';
import { normalize, Vector } from '../../shared/libs/vector';
import { Boid } from '../../entities/boid/index';
import type { Behavior } from '../../entities/boid/behavior';
import {
  cohesionBehavior,
  alignmentBehavior,
  separationBehavior,
} from './behavior';

export class BoidSimulation {
  #boids: Boid[] = [];
  #ctx: CanvasRenderingContext2D;
  #loop: number | null = null;
  #coreBehaviors: Behavior[] = []; // 常に適用される基本的な振る舞い
  #temporaryBehaviors: Behavior[] = []; // 一時的な振る舞い

  constructor(ctx: CanvasRenderingContext2D) {
    this.#ctx = ctx;
    this.#boids = this.#createBoids();
    this.#coreBehaviors = [
      cohesionBehavior,
      alignmentBehavior,
      separationBehavior,
    ];
  }

  /** ボイドを作成 */
  #createBoids(count: number = BOID_COUNT): Boid[] {
    const boids: Boid[] = [];
    for (let i = 0; i < count; i++) {
      const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      const theta = Math.random() * 2 * Math.PI;
      boids.push(
        new Boid({
          position: {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          },
          direction: { x: Math.cos(theta), y: Math.sin(theta) },
          velocity: BOID_VELOCITY + Math.random() * 4,
          color,
          flock: boids,
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
    this.#ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    const flockCenter = this.#calcFlockCenter();
    for (const boid of this.#boids) {
      boid.update({
        flockCenter,
        behaviors: [...this.#coreBehaviors, ...this.#temporaryBehaviors],
      });
      boid.edge(window.innerWidth, window.innerHeight);
      boid.draw(this.#ctx);
    }
  }

  /** ボイドの数を更新 */
  updateBoidsCount(value: number) {
    if (value < 1) return;
    if (value > 1000) return;
    this.clear();
    this.#boids = this.#createBoids(value);
  }

  applyPointerAttraction(pointerPosition: Vector) {
    const pointerAttractionBehavior: Behavior = {
      weight: 0.1,
      compute: ({ boid }) => {
        return normalize({
          x: pointerPosition.x - boid.position.x,
          y: pointerPosition.y - boid.position.y,
        });
      },
    };
    this.#temporaryBehaviors.push(pointerAttractionBehavior);

    return () => {
      this.#temporaryBehaviors = this.#temporaryBehaviors.filter(
        b => b !== pointerAttractionBehavior
      );
    };
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
    this.clear();
    this.#boids = this.#createBoids();
    if (this.#loop) return;
    this.start();
  }

  /** ボイドをクリア */
  clear() {
    this.#boids = [];
  }
}
