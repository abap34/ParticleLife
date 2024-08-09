export class Particle {
    constructor(numParticles, canvasWidth, canvasHeight, config) {
        this.numParticles = numParticles;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.config = config;
        this.positions = new Float32Array(numParticles * 2);
        this.velocities = new Float32Array(numParticles * 2);
        this.types = new Uint8Array(numParticles);
        this.initializeParticles();
    }

    initializeParticles() {
        for (let i = 0; i < this.numParticles; i++) {
            const index = i * 2;
            this.positions[index] = Math.random() * this.canvasWidth;
            this.positions[index + 1] = Math.random() * this.canvasHeight;
            this.velocities[index] = (Math.random() * 2 - 1) / 4;
            this.velocities[index + 1] = (Math.random() * 2 - 1) / 4;
            this.types[i] = i % this.config.particleTypes;
        }
    }

    computeForces() {
        for (let i = 0; i < this.numParticles; i++) {
            const indexI = i * 2;
            let vXI = this.velocities[indexI];
            let vYI = this.velocities[indexI + 1];

            const forces = this.config.force[this.types[i]];

            for (let j = 0; j < this.numParticles; j++) {
                if (i !== j) {
                    const indexJ = j * 2;
                    const dx = this.getWrappedDistance(this.positions[indexJ], this.positions[indexI], this.canvasWidth);
                    const dy = this.getWrappedDistance(this.positions[indexJ + 1], this.positions[indexI + 1], this.canvasHeight);
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < this.config.maxDistance) {
                        let force = forces[this.types[j]];
                        if (distance < this.config.cutoffDistance) {
                            const coef = this.types[i] === this.types[j] ? this.config.samecloseRangeCoef : this.config.differentcloseRangeCoef;
                            force = -(Math.abs(force * coef));
                        }

                        const forceDirection = Math.atan2(dy, dx);
                        const forceMagnitude = force / distance;

                        vXI += Math.cos(forceDirection) * forceMagnitude;
                        vYI += Math.sin(forceDirection) * forceMagnitude;
                    }
                }
            }

            this.updateVelocity(indexI, vXI, vYI);
            this.updatePosition(indexI, vXI, vYI);
        }
    }

    updateVelocity(index, vX, vY) {
        const speed = Math.sqrt(vX * vX + vY * vY);
        if (speed > this.config.speedUpperBound) {
            vX *= this.config.speedDecay;
            vY *= this.config.speedDecay;
        } else if (speed < this.config.speedLowerBound) {
            vX *= this.config.speedGrowth;
            vY *= this.config.speedGrowth;
        }
        this.velocities[index] = vX;
        this.velocities[index + 1] = vY;
    }

    updatePosition(index, vX, vY) {
        this.positions[index] = (this.positions[index] + vX + this.canvasWidth) % this.canvasWidth;
        this.positions[index + 1] = (this.positions[index + 1] + vY + this.canvasHeight) % this.canvasHeight;
    }

    getWrappedDistance(coord1, coord2, limit) {
        const delta = coord1 - coord2;
        return delta - limit * Math.round(delta / limit);
    }
}