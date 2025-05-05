import { BoidSimulation } from '../features/boid-simulation';

const startButton = document.querySelector<HTMLButtonElement>('#start');
const stopButton = document.querySelector<HTMLButtonElement>('#stop');
const resetButton = document.querySelector<HTMLButtonElement>('#reset');

if (!startButton) throw new Error('Start ボタンを取得できませんでした');
if (!stopButton) throw new Error('Stop ボタンを取得できませんでした');
if (!resetButton) throw new Error('Reset ボタンを取得できませんでした');

const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
if (!canvas) throw new Error('Canvas を取得できませんでした');

const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('CanvasRenderingContext2D を取得できませんでした');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// シミュレーションを開始
const sim = new BoidSimulation(ctx);
sim.start();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

startButton.addEventListener('click', () => {
  sim.start();
});

stopButton.addEventListener('click', () => {
  sim.stop();
});

resetButton.addEventListener('click', () => {
  sim.reset();
});
