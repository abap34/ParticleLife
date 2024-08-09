export class Renderer {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    drawParticles(particles) {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for (let i = 0; i < particles.numParticles; i++) {
            const index = i * 2;
            this.drawParticle(particles.positions[index], particles.positions[index + 1], particles.types[i], particles.config.particleTypes);
        }
    }

    drawParticle(x, y, type, totalTypes) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 2, 0, 2 * Math.PI);
        this.ctx.fillStyle = `hsl(${type * 360 / totalTypes}, 50%, 50%)`;
        this.ctx.shadowColor = 'gray';
        this.ctx.shadowBlur = 20;
        this.ctx.fill();
    }
}
