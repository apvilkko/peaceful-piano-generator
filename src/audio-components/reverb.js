import loadBuffer from './loadBuffer';

const create = (ctx, {impulse, dry = 0.8, wet = 0.5}) => {
  const reverb = ctx.createConvolver();
  const output = ctx.createGain();
  const input = ctx.createGain();
  const dryNode = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.frequency.value = 100;
  filter.type = 'highpass';
  dryNode.gain.value = dry;
  const wetNode = ctx.createGain();
  wetNode.gain.value = wet;

  const eq = ctx.createBiquadFilter();
  eq.type = 'peaking';
  eq.Q.value = 1;
  eq.frequency.value = 250;
  eq.gain.value = -6;
  eq.connect(wetNode);

  input.connect(dryNode);
  dryNode.connect(output);
  input.connect(filter);
  filter.connect(reverb);
  reverb.connect(eq);
  wetNode.connect(output);

  loadBuffer(ctx, impulse).then(ret => {
    reverb.buffer = ret;
  });

  return {
    input,
    output,
  };
};

export default create;
