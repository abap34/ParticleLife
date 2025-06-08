import { Particle } from './particle.js';
import { Renderer } from './renderer.js';
import { config } from './config.js';

export class ParticleSystem {
    constructor(ctx, config) {
        this.particles = new Particle(config.numParticles, config.canvasWidth, config.canvasHeight, config);
        this.renderer = new Renderer(ctx, config.canvasWidth, config.canvasHeight);
        this.isRunning = false;
        this.animationFrameId = null;
    }

    update() {
        this.particles.computeForces();
        this.renderer.drawParticles(this.particles);
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        const loop = () => {
            if (!this.isRunning) return;
            
            this.update();
            this.animationFrameId = requestAnimationFrame(loop);
        };
        
        loop();
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}
