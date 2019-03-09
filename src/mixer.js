import all from './tracks';
import compressor from './audio-components/compressor';
import reverb from './audio-components/reverb';
import createSampler from './audio-components/sampler';

const create = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext);

  const masterLimiter = compressor(ctx, {ratio: 10.0, knee: 0});
  masterLimiter.output.connect(ctx.destination);

  const masterReverb = reverb(ctx, {impulse: 'concerthall'});
  masterReverb.output.connect(masterLimiter.input);

  const masterGain = ctx.createGain();
  masterGain.connect(masterReverb.input);
  masterGain.gain.value = 0.7;

  const tracks = {};
  const instruments = {};
  all.forEach(instrument => {
    const gain = ctx.createGain();
    gain.connect(masterGain);
    gain.gain.value = 0.7;
    tracks[instrument] = {
      gain,
    };
    /* instruments[instrument] = createSynth(ctx);
    instruments[instrument].output.connect(gain);
    instruments[instrument].setParam('aEnvRelease', instrument === 'BASS' ? 4 : 1);
    instruments[instrument].setParam('detune0', -5);
    instruments[instrument].setParam('oscType0', 'triangle');
    instruments[instrument].setParam('detune1', 5); */
    instruments[instrument] = createSampler(ctx);
    instruments[instrument].output.connect(gain);
  });

  return {
    ctx,
    masterReverb,
    masterGain,
    input: masterGain,
    tracks,
    instruments,
  };
};

export default create;
