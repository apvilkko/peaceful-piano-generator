import start from './generator';
import {shuffle} from './rand';
import createMixer from './mixer';
import createSequencer from './sequencer';
import loop from './loop';
import './style.scss';

const bgPath = 'bg/';
const bgDuration = 10000;
const context = {scene: {}};

const createDiv = className => {
  const el = document.createElement('div');
  el.className = className;
  return el;
};

const setup = () => {
  const bgContainer = createDiv('bg');
  const bg1 = createDiv('bg1');
  const bg2 = createDiv('bg2');
  bgContainer.appendChild(bg1);
  bgContainer.appendChild(bg2);
  context.bg1 = bg1;
  context.bg2 = bg2;
  document.getElementById('app').appendChild(bgContainer);

  context.mixer = createMixer();
  context.sequencer = createSequencer();
  loop(context);
};

const cycleImages = imageList => {
  let i = 0;

  const next = () => {
    const image = imageList[i % imageList.length];
    const el = context[i % 2 === 0 ? 'bg1' : 'bg2'];
    const other = context[i % 2 === 1 ? 'bg1' : 'bg2'];
    el.style['background-image'] = `url(${image})`;
    el.style.opacity = 1;
    other.style.opacity = 0;
    ++i;
  };

  next();
  setInterval(next, bgDuration);
};

setup();
start(context);
cycleImages(shuffle([
  'boat-1992137_1920.jpg',
  'flowers-1167669_1920.jpg',
  'sky-34536_1280.png',
  'fog-3755136_1920.jpg',
  'ocean-828774_1920.jpg',
  'pebbles-801952_1920.jpg',
  'pier-407252_1920.jpg',
  'sailing-boat-569336_1920.jpg',
  'sky-1246033_1920.jpg',
  'sunset-3102754_1920.jpg',
  'water-1761027_1920.jpg',
]).map(x => `${bgPath}${x}`));
