import { config } from './config.js';
import { ParticleSystem } from './particleSystem.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let particleSystem;

function initializeSimulation() {
    // キャンバスサイズを設定
    canvas.width = config.canvasWidth;
    canvas.height = config.canvasHeight;

    // 既存のシステムを停止
    if (particleSystem) {
        particleSystem.stop();
    }

    // 新しいシステムを作成・開始
    particleSystem = new ParticleSystem(ctx, config);
    particleSystem.start();
}

// 設定変更時の再起動
document.addEventListener('configChanged', (event) => {
    console.log('設定が変更されました:', event.detail);
    initializeSimulation();
});

// 初期化
initializeSimulation();
