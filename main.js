Math.seed = 0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


let particles = [];
let config = {
    numParticles: 1200,
    canvasWidth: 1600,
    canvasHeight: 800,
    particleTypes: 5,
    closeRange: [
        [-0.4, -1.0, -1.5, -1.1, -1.3],
        [-1.0, -0.4, -1.0, -0.2, -0.1],
        [-1.5, -1.0, -0.4, -0.05, -0.05],
        [-1.1, -0.2, -0.05, -0.4, -0.05],
        [-1.3, -0.1, -0.05, -0.05, -0.4]
    ],
    longRange: [
        [0.9, 0.8, 0.7, -0.4, 0.6],
        [0.8, 0.3, 1.2, -0.5, 0.5],
        [0.7, 1.2, 0.9, 0.1, 0.5],
        [-0.4, -0.5, 0.1, 0.9, 0.7],
        [0.6, 0.5, 0.5, 0.7, 0.9]
    ],
    maxDistance: 100,
    cutoffDistance: 50,
    minDistance: 20
};


const closeRangeCoef = 0.5;
const longRangeCoef = 0.3;


canvas.width = config.canvasWidth;
canvas.height = config.canvasHeight;

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
                        const forceDirection = Math.atan2(dy, dx);
                        const forceType = distance < config.cutoffDistance ? 'closeRange' : 'longRange';
                        const coef = distance < config.cutoffDistance ? closeRangeCoef : longRangeCoef;
                        const forceMagnitude = config[forceType][this.types[i]][this.types[j]] / (distance);
                        vXI += Math.cos(forceDirection) * forceMagnitude * coef;
                        vYI += Math.sin(forceDirection) * forceMagnitude * coef;
                    }
                }
            }


            const speed = Math.sqrt(vXI * vXI + vYI * vYI);
            if (speed > 2.0) {
                vXI *= 0.97;
                vYI *= 0.97;
            } else if (speed < 0.1) {
                vXI *= 1.001;
                vYI *= 1.001;
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
            ctx.fillStyle = `hsl(${this.types[i] * 360 / config.particleTypes}, 100%, 50%)`;
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