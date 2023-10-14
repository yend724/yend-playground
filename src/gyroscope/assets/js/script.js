const ball = document.querySelector('.ball');
const ballWidth = ball.clientWidth;
const ballHeight = ball.clientHeight;
const garden = document.querySelector('.garden');
const gardenWidth = garden.clientWidth;
const gardenHeight = garden.clientHeight;
const output = document.querySelector('.output');

const maxX = gardenWidth - ballWidth;
const maxY = gardenHeight - ballHeight;

const mapValue = (value, fromMin, fromMax, toMin, toMax) => {
  const fromRange = fromMax - fromMin;
  const toRange = toMax - toMin;
  const ratio = (value - fromMin) / fromRange;

  const result = toMin + ratio * toRange;
  return result;
};

const MAX = 80;
const MIN = -80;
const handleOrientation = event => {
  const beta = Math.min(Math.max(event.beta, MIN), MAX);
  const gamma = Math.min(Math.max(event.gamma, MIN), MAX);
  output.textContent = `beta(x軸周り): ${beta}\n`;
  output.textContent += `gamma(y軸周り): ${gamma}\n`;

  ball.style.top = `${mapValue(beta, MIN, MAX, 0, maxX)}px`;
  ball.style.left = `${mapValue(gamma, MIN, MAX, 0, maxY)}px`;
};

const onTriggerClick = () => {
  DeviceOrientationEvent.requestPermission().then(function (response) {
    if (response === 'granted') {
      window.addEventListener('deviceorientation', handleOrientation);
    }
  });
};
const btn = document.getElementById('trigger');
btn.addEventListener('click', onTriggerClick);
