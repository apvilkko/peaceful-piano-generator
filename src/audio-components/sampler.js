import {getRateFromPitch} from '../math';
import loadBuffer from './loadBuffer';

const samples = ['c2', 'c3', 'c4', 'c5'];
const offset = -60;

const release = 0.500;

const noteToBuffer = (buffers, note) => {
  const correctedPitch = note.note + offset;
  let pitch;
  let buffer;
  if (note.note > 66) {
    pitch = correctedPitch - 24;
    buffer = 'c5'
  } else if (note.note > 54) {
    pitch = correctedPitch - 12;
    buffer = 'c4';
  } else if (note.note > 42) {
    pitch = correctedPitch;
    buffer = 'c3';
  } else {
    pitch = correctedPitch + 12;
    buffer = 'c2';
  }
  console.log(note.note, pitch, buffer);
  return [pitch, buffers[buffer]];
};

const create = (ctx, sampleName, inserts) => {
  let bufferSource;
  const buffers = {};

  samples.forEach(sample => {
    loadBuffer(ctx, sample).then(ret => {
      buffers[sample] = ret;
    });
  })

  const output = ctx.createGain();
  const vca = ctx.createGain();
  if (!inserts || inserts.length === 0) {
    vca.connect(output);
  } else {
    vca.connect(inserts[0].input);
    for (let i = 0; i < inserts.length; ++i) {
      inserts[i].output.connect((i < inserts.length - 1) ? inserts[i+1].input : output);
    }
  }

  const noteOn = (note, atTime) => {
    const pitch = note.note;
    const time = atTime || ctx.currentTime;
    const [correctedPitch, buffer] = noteToBuffer(buffers, note);
    if (!buffer) {
      return;
    }
    bufferSource = ctx.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(vca);
    if (pitch !== 0) {
      bufferSource.playbackRate.setValueAtTime(getRateFromPitch(correctedPitch), time);
    }
    bufferSource.start(time);
    // vca.gain.setValueAtTime(note.velocity || 1, time);
    vca.gain.cancelScheduledValues(time);
    vca.gain.linearRampToValueAtTime(1, time + 0.010);
  };

  const noteOff = (note, atTime) => {
    const time = atTime || ctx.currentTime;
    vca.gain.cancelScheduledValues(time);
    vca.gain.linearRampToValueAtTime(0, time + release);
    if (bufferSource) {
      bufferSource.stop(time + release);
    }
  }

  return {
    gain: output,
    output,

    noteOn,
    noteOff,
  }
};

export default create;
