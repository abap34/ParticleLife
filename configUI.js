import { config } from './config.js';

class ConfigUI {
    constructor() {
        this.isVisible = false;
        this.originalConfig = { ...config };
        this.init();
    }

    init() {
        this.bindElements();
        this.bindEvents();
        this.updateAllValues();
    }

    bindElements() {
        this.toggle = document.getElementById('configToggle');
        this.panel = document.getElementById('configPanel');
        this.applyBtn = document.getElementById('applyBtn');
        this.resetBtn = document.getElementById('resetBtn');

        // 各設定要素
        this.elements = {
            numParticles: document.getElementById('numParticles'),
            particleTypes: document.getElementById('particleTypes'),
            coef: document.getElementById('coef'),
            gradientStrength: document.getElementById('gradientStrength'),
            speedUpperBound: document.getElementById('speedUpperBound'),
            speedLowerBound: document.getElementById('speedLowerBound'),
            speedDecay: document.getElementById('speedDecay'),
            speedGrowth: document.getElementById('speedGrowth'),
            viscosity: document.getElementById('viscosity'),
            borderBounce: document.getElementById('borderBounce'),
            borderForce: document.getElementById('borderForce'),
            borderMargin: document.getElementById('borderMargin'),
            canvasWidth: document.getElementById('canvasWidth'),
            canvasHeight: document.getElementById('canvasHeight')
        };

        // 値表示要素
        this.valueElements = {
            numParticles: document.getElementById('numParticlesValue'),
            particleTypes: document.getElementById('particleTypesValue'),
            coef: document.getElementById('coefValue'),
            gradientStrength: document.getElementById('gradientStrengthValue'),
            speedUpperBound: document.getElementById('speedUpperBoundValue'),
            speedLowerBound: document.getElementById('speedLowerBoundValue'),
            speedDecay: document.getElementById('speedDecayValue'),
            speedGrowth: document.getElementById('speedGrowthValue'),
            viscosity: document.getElementById('viscosityValue'),
            borderForce: document.getElementById('borderForceValue'),
            borderMargin: document.getElementById('borderMarginValue')
        };
    }

    bindEvents() {
        // トグルボタン
        this.toggle.addEventListener('click', () => {
            this.togglePanel();
        });

        // パネル外クリックで閉じる
        document.addEventListener('click', (e) => {
            if (this.isVisible &&
                !this.panel.contains(e.target) &&
                !this.toggle.contains(e.target)) {
                this.hidePanel();
            }
        });

        // ESCキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hidePanel();
            }
        });

        // 各スライダーの値変更イベント
        Object.keys(this.elements).forEach(key => {
            const element = this.elements[key];
            if (element.type === 'range') {
                element.addEventListener('input', () => {
                    this.updateValueDisplay(key);
                });
            }
        });

        // ボタンイベント
        this.applyBtn.addEventListener('click', () => {
            this.applyChanges();
        });

        this.resetBtn.addEventListener('click', () => {
            this.resetToDefaults();
        });
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    showPanel() {
        this.panel.classList.add('visible');
        this.isVisible = true;
        this.updateAllValues();
    }

    hidePanel() {
        this.panel.classList.remove('visible');
        this.isVisible = false;
    }

    updateValueDisplay(key) {
        const valueElement = this.valueElements[key];
        const inputElement = this.elements[key];
        if (valueElement && inputElement) {
            let value = parseFloat(inputElement.value);
            // 小数点以下の桁数を調整
            if (key === 'coef' || key.includes('speed')) {
                value = value.toFixed(3);
            } else {
                value = value.toString();
            }
            valueElement.textContent = value;
        }
    }

    updateAllValues() {
        // 現在の設定値を入力要素に反映
        Object.keys(this.elements).forEach(key => {
            const element = this.elements[key];
            if (config[key] !== undefined) {
                element.value = config[key];
                if (element.type === 'range') {
                    this.updateValueDisplay(key);
                }
            }
        });
    }    applyChanges() {
        // 設定を収集
        const newConfig = {};
        Object.keys(this.elements).forEach(key => {
            const element = this.elements[key];
            let value = element.value;
            
            // 型変換
            if (element.type === 'number' || element.type === 'range') {
                value = parseFloat(value);
                if (key === 'numParticles' || key === 'particleTypes' || key === 'borderMargin') {
                    value = parseInt(value);
                }
            } else if (element.type === 'checkbox') {
                value = element.checked;
            }
            
            newConfig[key] = value;
        });

        // 設定を適用
        Object.assign(config, newConfig);

        // シミュレーションを再起動
        this.restartSimulation();

        // パネルを閉じる
        this.hidePanel();

        // 適用完了のフィードバック
        this.showApplyFeedback();
    }

    resetToDefaults() {
        // 元の設定に戻す
        Object.assign(config, this.originalConfig);

        // UI要素を更新
        this.updateAllValues();

        // シミュレーションを再起動
        this.restartSimulation();

        // リセット完了のフィードバック
        this.showResetFeedback();
    }

    restartSimulation() {
        // メインシミュレーションの再起動をトリガー
        const event = new CustomEvent('configChanged', {
            detail: config
        });
        document.dispatchEvent(event);
    }

    showApplyFeedback() {
        const originalText = this.applyBtn.textContent;
        this.applyBtn.textContent = 'Applied';
        this.applyBtn.style.background = 'rgba(34, 197, 94, 0.9)';

        setTimeout(() => {
            this.applyBtn.textContent = originalText;
            this.applyBtn.style.background = '';
        }, 1500);
    }

    showResetFeedback() {
        const originalText = this.resetBtn.textContent;
        this.resetBtn.textContent = 'Reset';
        this.resetBtn.style.background = 'rgba(251, 146, 60, 0.9)';

        setTimeout(() => {
            this.resetBtn.textContent = originalText;
            this.resetBtn.style.background = '';
        }, 1500);
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new ConfigUI();
});
