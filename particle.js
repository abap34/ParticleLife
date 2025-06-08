import { SpatialGrid } from './spatialGrid.js';

export class Particle {
    constructor(numParticles, canvasWidth, canvasHeight, config) {
        this.numParticles = numParticles;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.config = config;
        this.positions = new Float32Array(numParticles * 2);
        this.velocities = new Float32Array(numParticles * 2);
        this.forces = new Float32Array(numParticles * 2); // 力を蓄積するバッファ
        this.types = new Uint8Array(numParticles);

        // 空間分割グリッド（maxDistanceに基づいてセルサイズを決定）
        this.spatialGrid = new SpatialGrid(canvasWidth, canvasHeight, 100);

        this.initializeParticles();
        this.computeForce = config.computeForce;

        // 最大距離の二乗（平方根計算を避けるため）
        this.maxDistanceSquared = 100 * 100;
    }

    initializeParticles() {
        // 境界マージンを考慮した実効領域を計算
        const margin = this.config.borderMargin || 0;
        const effectiveWidth = this.canvasWidth - margin * 2;
        const effectiveHeight = this.canvasHeight - margin * 2;
        
        for (let i = 0; i < this.numParticles; i++) {
            const index = i * 2;
            // マージンを考慮して位置を初期化
            this.positions[index] = margin + Math.random() * effectiveWidth;
            this.positions[index + 1] = margin + Math.random() * effectiveHeight;
            this.velocities[index] = (Math.random() * 2 - 1);
            this.velocities[index + 1] = (Math.random() * 2 - 1);
            this.types[i] = i % this.config.particleTypes;
        }
    } computeForces() {
        // 力をリセット
        this.forces.fill(0);

        // 空間グリッドを更新
        this.spatialGrid.clear();
        for (let i = 0; i < this.numParticles; i++) {
            const index = i * 2;
            this.spatialGrid.addParticle(this.positions[index], this.positions[index + 1], i);
        }

        // 力計算（空間分割を使用して近傍粒子のみ計算）
        for (let i = 0; i < this.numParticles; i++) {
            const indexI = i * 2;
            const nearbyParticles = this.spatialGrid.getNearbyParticles(
                this.positions[indexI],
                this.positions[indexI + 1]
            );

            for (const j of nearbyParticles) {
                if (i !== j) {
                    const indexJ = j * 2;
                    const dx = this.getWrappedDistance(this.positions[indexJ], this.positions[indexI], this.canvasWidth);
                    const dy = this.getWrappedDistance(this.positions[indexJ + 1], this.positions[indexI + 1], this.canvasHeight);
                    const distanceSquared = dx * dx + dy * dy;

                    // 最大距離チェック（平方根計算を避ける）
                    if (distanceSquared > this.maxDistanceSquared) continue;

                    const distance = Math.sqrt(distanceSquared);
                    const force = this.computeForce(this.types[i], this.types[j], distance);

                    if (force !== 0) {
                        // Math.atan2とMath.cos/sinを避けて直接計算
                        const forceOverDistance = force * this.config.coef / distance;
                        this.forces[indexI] += dx * forceOverDistance;
                        this.forces[indexI + 1] += dy * forceOverDistance;
                    }
                }
            }
        }

        this.applyGradientForce();

        // 速度更新
        for (let i = 0; i < this.numParticles; i++) {
            const index = i * 2;
            const vX = this.velocities[index] + this.forces[index];
            const vY = this.velocities[index + 1] + this.forces[index + 1];
            this.updateVelocity(index, vX, vY);
        }

        // 位置更新
        for (let i = 0; i < this.numParticles; i++) {
            const index = i * 2;
            this.updatePosition(index, this.velocities[index], this.velocities[index + 1]);
        }
    }

    applyGradientForce() {
        const gradientStrength = this.config.gradientStrength || 0.02;

        for (let i = 0; i < this.numParticles; i++) {
            const index = i * 2;
            const x = this.positions[index];
            const y = this.positions[index + 1];

            const normalizedX = x / this.canvasWidth;
            const normalizedY = y / this.canvasHeight;

            const diagonalProgress = (normalizedX + normalizedY) / 2;

            // 時間によって向きが変わるように調整
            const time = Date.now() / 10000;
            const angle = time + (diagonalProgress * Math.PI * 2);
            const gradientX = Math.cos(angle);
            const gradientY = Math.sin(angle);

            const forceX = gradientStrength * diagonalProgress * gradientX;
            const forceY = gradientStrength * diagonalProgress * gradientY;

            this.forces[index] += forceX;
            this.forces[index + 1] += forceY;
        }
    }

    updateVelocity(index, vX, vY) {
        // 速度制限のチェック
        const speed = Math.sqrt(vX * vX + vY * vY);
        if (speed > this.config.speedUpperBound) {
            vX *= this.config.speedDecay;
            vY *= this.config.speedDecay;
        } else if (speed < this.config.speedLowerBound) {
            vX *= this.config.speedGrowth;
            vY *= this.config.speedGrowth;
        }

        // 粘度による減衰（抵抗）を適用
        const viscosity = this.config.viscosity || 0;
        if (viscosity > 0) {
            // 速度に対する粘性抵抗
            vX *= (1 - viscosity);
            vY *= (1 - viscosity);
        }

        this.velocities[index] = vX;
        this.velocities[index + 1] = vY;
    }

    updatePosition(index, vX, vY) {
        const borderBounce = this.config.borderBounce !== undefined ? this.config.borderBounce : true;
        const margin = this.config.borderMargin || 30;
        const borderForce = this.config.borderForce || 0.5;
        
        // 現在の位置
        let posX = this.positions[index];
        let posY = this.positions[index + 1];
        
        // 新しい位置を計算
        let newX = posX + vX;
        let newY = posY + vY;
        
        if (borderBounce) {
            // 境界で跳ね返る処理
            // X方向の境界チェック
            if (newX < margin) {
                // 左端に近づいている場合、右向きの力を加える
                const force = borderForce * (1 - newX / margin);
                this.velocities[index] += force; // 右向きの力
                newX = posX + this.velocities[index]; // 位置を再計算
            } else if (newX > this.canvasWidth - margin) {
                // 右端に近づいている場合、左向きの力を加える
                const force = borderForce * (1 - (this.canvasWidth - newX) / margin);
                this.velocities[index] -= force; // 左向きの力
                newX = posX + this.velocities[index]; // 位置を再計算
            }
            
            // Y方向の境界チェック
            if (newY < margin) {
                // 上端に近づいている場合、下向きの力を加える
                const force = borderForce * (1 - newY / margin);
                this.velocities[index + 1] += force; // 下向きの力
                newY = posY + this.velocities[index + 1]; // 位置を再計算
            } else if (newY > this.canvasHeight - margin) {
                // 下端に近づいている場合、上向きの力を加える
                const force = borderForce * (1 - (this.canvasHeight - newY) / margin);
                this.velocities[index + 1] -= force; // 上向きの力
                newY = posY + this.velocities[index + 1]; // 位置を再計算
            }
            
            // 安全対策：それでも境界を超える場合は強制的に境界内に収める
            newX = Math.max(1, Math.min(this.canvasWidth - 1, newX));
            newY = Math.max(1, Math.min(this.canvasHeight - 1, newY));
        } else {
            // 従来のワープ処理（config.borderBounce = falseの場合）
            if (newX < 0) {
                newX = this.canvasWidth + newX;
            } else if (newX > this.canvasWidth) {
                newX = newX - this.canvasWidth;
            }
            
            if (newY < 0) {
                newY = this.canvasHeight + newY;
            } else if (newY > this.canvasHeight) {
                newY = newY - this.canvasHeight;
            }
        }
        
        // 位置を更新
        this.positions[index] = newX;
        this.positions[index + 1] = newY;
    }

    getWrappedDistance(coord1, coord2, limit) {
        const delta = coord1 - coord2;
        return delta - limit * Math.round(delta / limit);
    }
}