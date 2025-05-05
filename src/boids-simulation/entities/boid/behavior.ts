import type { Vector } from '../../shared/libs/vector';
import type { Boid } from './index';

export type Behavior = {
  /** この振る舞いの重み */
  weight: number;
  /**
   * Boid インスタンスと群れの重心を受け取り、
   * 反映すべきステアリングベクトルを返す
   */
  compute(boidInstance: Boid, flockCenterPosition: Vector): Vector;
};
