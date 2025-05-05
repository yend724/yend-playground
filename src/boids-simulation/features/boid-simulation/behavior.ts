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
  compute: ({ boid, flockCenterPosition }) =>
    normalize({
      x: flockCenterPosition.x - boid.position.x,
      y: flockCenterPosition.y - boid.position.y,
    }),
};

export const alignmentBehavior: Behavior = {
  weight: ALIGNMENT_WEIGHT,
  compute: ({ boid }) => {
    return normalize({ ...boid.nearestNeighbor.direction });
  },
};

export const separationBehavior: Behavior = {
  weight: SEPARATION_WEIGHT,
  compute: ({ boid }) => {
    let vector = { x: 0, y: 0 };
    const distance = length({
      x: boid.position.x - boid.nearestNeighbor.position.x,
      y: boid.position.y - boid.nearestNeighbor.position.y,
    });
    if (distance < DISTANCE_TO_NEIGHBOR) {
      vector = normalize({
        x: boid.position.x - boid.nearestNeighbor.position.x,
        y: boid.position.y - boid.nearestNeighbor.position.y,
      });
    }
    return vector;
  },
};
