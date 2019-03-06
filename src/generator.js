import * as mm from '@magenta/music';

const checkpoint = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_lokl_q2';
const model = new mm.MusicVAE(checkpoint);
const player = new mm.Player();

export default () => {
  model
    .initialize()
    .then(() => model.sample(1))
    .then(samples => {
      player.resumeContext();
      player.start(samples[0])
    });
};
