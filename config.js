export const config = {
    numParticles: 1500,
    canvasWidth: 1600,
    canvasHeight: 800,
    particleTypes: 5,
    force: [
        [3.00, 0.35, 0.40, 0.50, 0.50],
        [0.35, 0.30, -0.10, 0.10, 0.10],
        [0.40, -0.10, 3.00, -0.10, -0.10],
        [0.50, 0.10, -0.10, 0.30, -0.20],
        [0.50, 0.10, -0.10, -0.20, 0.60]
    ],
    maxDistance: 100,
    cutoffDistance: 50,
    samecloseRangeCoef: 0.5,
    differentcloseRangeCoef: 1.75,
    speedUpperBound: 1.5,
    speedLowerBound: 0.05,
    speedDecay: 0.90,
    speedGrowth: 1.05,
};