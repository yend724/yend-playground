import { normalize, length } from '../../shared/libs/vector';
import {
  COHESION_WEIGHT,
  ALIGNMENT_WEIGHT,
  SEPARATION_WEIGHT,
  DISTANCE_TO_NEIGHBOR,
} from '../../shared/constants/settings';
import type { Behavior } from '../../entities/boid/behavior';

export const cohesionBehavior: Behavior = {
  weight: COHESION_WEIGHT,
  compute: (boidInstance, flockCenterPosition) =>
    normalize({
      x: flockCenterPosition.x - boidInstance.position.x,
      y: flockCenterPosition.y - boidInstance.position.y,
    }),
};

export const alignmentBehavior: Behavior = {
  weight: ALIGNMENT_WEIGHT,
  compute: boidInstance => {
    return normalize({ ...boidInstance.nearestNeighbor.direction });
  },
};

export const separationBehavior: Behavior = {
  weight: SEPARATION_WEIGHT,
  compute: boidInstance => {
    let vector = { x: 0, y: 0 };
    const distance = length({
      x: boidInstance.position.x - boidInstance.nearestNeighbor.position.x,
      y: boidInstance.position.y - boidInstance.nearestNeighbor.position.y,
    });
    if (distance < DISTANCE_TO_NEIGHBOR) {
      vector = normalize({
        x: boidInstance.position.x - boidInstance.nearestNeighbor.position.x,
        y: boidInstance.position.y - boidInstance.nearestNeighbor.position.y,
      });
    }
    return vector;
  },
};
