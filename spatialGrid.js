export class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Array(this.cols * this.rows).fill(null).map(() => []);
    }

    clear() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i].length = 0; // より高速なクリア方法
        }
    }

    addParticle(x, y, index) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            const cellIndex = row * this.cols + col;
            this.grid[cellIndex].push(index);
        }
    }

    getNearbyParticles(x, y) {
        const nearby = [];
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        // 周囲9セルをチェック
        for (let dc = -1; dc <= 1; dc++) {
            for (let dr = -1; dr <= 1; dr++) {
                const c = col + dc;
                const r = row + dr;
                if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
                    const cellIndex = r * this.cols + c;
                    nearby.push(...this.grid[cellIndex]);
                }
            }
        }
        return nearby;
    }
}
