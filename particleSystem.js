import { Particle } from './particle.js';
import { Renderer } from './renderer.js';
import { config } from './config.js';

export class ParticleSystem {
    constructor(ctx, config) {
        this.particles = new Particle(config.numParticles, config.canvasWidth, config.canvasHeight, config);
        this.renderer = new Renderer(ctx, config.canvasWidth, config.canvasHeight);
    }

    update() {
        this.particles.computeForces();
        this.renderer.drawParticles(this.particles);
    }

    start() {
        const loop = () => {
            this.update();
            requestAnimationFrame(loop);
        };
        loop();
    }
}
