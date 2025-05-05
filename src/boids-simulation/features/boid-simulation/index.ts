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
  #boidsCount: number = BOID_COUNT;
  #ctx: CanvasRenderingContext2D;
  #loop: number | null = null;
  #coreBehaviors: Behavior[] = []; // 常に適用される基本的な振る舞い
  #temporaryBehaviors: Behavior[] = []; // 一時的な振る舞い

  constructor(ctx: CanvasRenderingContext2D) {
    this.#ctx = ctx;
    this.#boids = this.#createBoids(this.#boidsCount);
    this.#coreBehaviors = [
      cohesionBehavior,
      alignmentBehavior,
      separationBehavior,
    ];
  }

  /** ボイドを作成 */
  #createBoids(count: number): Boid[] {
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

  /** ボイドを追加 */
  #appendBoids(count: number) {
    for (let i = 0; i < count; i++) {
      const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      const theta = Math.random() * 2 * Math.PI;
      const position = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      };

      this.#boids.push(
        new Boid({
          position,
          direction: { x: Math.cos(theta), y: Math.sin(theta) },
          velocity: BOID_VELOCITY + Math.random() * 4,
          color,
          flock: this.#boids,
        })
      );
    }
  }

  /** ボイドを削除 */
  #removeBoids(count: number) {
    for (let i = 0; i < count; i++) {
      this.#boids.pop();
    }
  }

  /** 群れの重心を計算 */
  #calcFlockCenter(): { x: number; y: number } {
    let x = 0;
    let y = 0;
    for (const b of this.#boids) {
      x += b.position.x;
      y += b.position.y;
    }
    return { x: x / this.#boidsCount, y: y / this.#boidsCount };
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

    this.#boidsCount = value;

    if (value > this.#boids.length) {
      this.#appendBoids(value - this.#boids.length);
    } else {
      this.#removeBoids(this.#boids.length - value);
    }
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
    this.#boids = this.#createBoids(this.#boidsCount);
    if (this.#loop) return;
    this.start();
  }
}
