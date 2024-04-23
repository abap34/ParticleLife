Math.seed = 0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


let particles = [];
let config = {
    numParticles: 1500,
    canvasWidth: 1600,
    canvasHeight: 800,
    particleTypes: 5,
    force: [
        [ 3.00,   0.35,  0.40,  0.50,  0.50],
        [ 0.35,   0.30, -0.10,  0.10,  0.10],
        [ 0.40,  -0.10,  3.00, -0.10, -0.10],
        [ 0.50,   0.10, -0.10,  0.30, -0.20],
        [ 0.50,   0.10, -0.10, -0.20,  0.60]
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


canvas.width = config.canvasWidth;
canvas.height = config.canvasHeight;

function abs(x) {
    return x < 0 ? -x : x;
}

class Particle {
    constructor(numParticles, canvasWidth, canvasHeight) {
        this.numParticles = numParticles;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
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
            this.types[i] = i % config.particleTypes;
        }
    }

    update() {
        for (let i = 0; i < this.numParticles; i++) {
            const indexI = i * 2;
            let vXI = this.velocities[indexI];
            let vYI = this.velocities[indexI + 1];

            const forces = config.force[this.types[i]];

            for (let j = 0; j < this.numParticles; j++) {
                if (i !== j) {
                    const indexJ = j * 2;
                    const xJ = this.positions[indexJ];
                    const yJ = this.positions[indexJ + 1];

                    let dx = xJ - this.positions[indexI];
                    let dy = yJ - this.positions[indexI + 1];
                    dx -= this.canvasWidth * Math.round(dx / this.canvasWidth);
                    dy -= this.canvasHeight * Math.round(dy / this.canvasHeight);

                    const distance = Math.sqrt(dx * dx + dy * dy);


                    if (distance < config.maxDistance) {
                        let force = forces[this.types[j]];

                        if (distance < config.cutoffDistance) {
                            const coef = this.types[i] === this.types[j] ? config.samecloseRangeCoef : config.differentcloseRangeCoef;
                            force = -(abs(force * coef));
                        }

                        const forceDirection = Math.atan2(dy, dx);
                        const forceMagnitude = force / distance;

                        vXI += Math.cos(forceDirection) * forceMagnitude;
                        vYI += Math.sin(forceDirection) * forceMagnitude;
                    }
                }
            }


            const speed = Math.sqrt(vXI * vXI + vYI * vYI);
            if (speed > config.speedUpperBound) {
                vXI *= config.speedDecay;
                vYI *= config.speedDecay;
            } else if (speed < config.speedLowerBound) {
                vXI *= config.speedGrowth;
                vYI *= config.speedGrowth;
            }


            this.velocities[indexI] = vXI;
            this.velocities[indexI + 1] = vYI;
            this.positions[indexI] = (this.positions[indexI] + vXI + this.canvasWidth) % this.canvasWidth;
            this.positions[indexI + 1] = (this.positions[indexI + 1] + vYI + this.canvasHeight) % this.canvasHeight;
        }
    }

    draw() {
        ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for (let i = 0; i < this.numParticles; i++) {
            const index = i * 2;
            ctx.beginPath();
            ctx.arc(this.positions[index], this.positions[index + 1], 2, 0, 2 * Math.PI);
            ctx.fillStyle = `hsl(${this.types[i] * 360 / config.particleTypes}, 50%, 50%)`;
            ctx.shadowColor = 'gray';
            ctx.shadowBlur = 20;
            ctx.fill();
        }
    }
}

function initializeParticles() {
    particles = new Particle(config.numParticles, config.canvasWidth, config.canvasHeight);
}

function update() {
    particles.update();
    particles.draw();
    requestAnimationFrame(update);
}




initializeParticles();
update();