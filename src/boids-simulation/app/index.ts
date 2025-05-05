import { debounce } from '../shared/libs/bounce';
import { BoidSimulation } from '../features/boid-simulation';

const controls = document.querySelector<HTMLDivElement>('#controls');
const startButton = document.querySelector<HTMLButtonElement>('#start');
const stopButton = document.querySelector<HTMLButtonElement>('#stop');
const resetButton = document.querySelector<HTMLButtonElement>('#reset');
const boidsCountInput =
  document.querySelector<HTMLInputElement>('#boids-count');
const boidsCountOutput = document.querySelector<HTMLSpanElement>(
  '#boids-count-output'
);

if (!controls) throw new Error('Controls を取得できませんでした');
if (!startButton) throw new Error('Start ボタンを取得できませんでした');
if (!stopButton) throw new Error('Stop ボタンを取得できませんでした');
if (!resetButton) throw new Error('Reset ボタンを取得できませんでした');
if (!boidsCountInput) throw new Error('Boids Count 入力を取得できませんでした');
if (!boidsCountOutput)
  throw new Error('Boids Count 出力を取得できませんでした');

const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
if (!canvas) throw new Error('Canvas を取得できませんでした');

const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('CanvasRenderingContext2D を取得できませんでした');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// シミュレーションを開始
const simulation = new BoidSimulation(ctx);
simulation.start();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let isPointerDown = false;
let removePointerForce = () => {};
const handlePointerPosition = (x: number, y: number) => {
  removePointerForce();
  removePointerForce = simulation.applyPointerAttraction({ x, y });
};

window.addEventListener('pointerdown', e => {
  isPointerDown = true;
  handlePointerPosition(e.clientX, e.clientY);
});
window.addEventListener('pointermove', e => {
  if (isPointerDown) {
    handlePointerPosition(e.clientX, e.clientY);
  }
});
window.addEventListener('pointerup', () => {
  isPointerDown = false;
  removePointerForce();
});

controls.addEventListener('pointerdown', e => {
  e.stopPropagation();
});

startButton.addEventListener('click', () => {
  simulation.start();
});

stopButton.addEventListener('click', () => {
  simulation.stop();
});

resetButton.addEventListener('click', () => {
  simulation.reset();
});

const updateBoidsCount = debounce(() => {
  const value = boidsCountInput.value;
  const valueNumber = Number(value);
  if (isNaN(valueNumber)) return;
  boidsCountOutput.textContent = valueNumber.toString();
  simulation.updateBoidsCount(valueNumber);
}, 100);
boidsCountInput.addEventListener('input', updateBoidsCount);
