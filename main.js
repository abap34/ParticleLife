import { ParticleSystem } from './particleSystem.js';
import { config } from './config.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = config.canvasWidth;
canvas.height = config.canvasHeight;

const particleSystem = new ParticleSystem(ctx, config);
particleSystem.start();
