import {rand} from './rand';
import {play, pause} from './sequencer';
import {MIDI_C1} from './constants';

// const checkpoint = 'https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/mel_4bar_med_lokl_q2';
const publicPath = process.env.NODE_ENV === 'production' ?
  '/peaceful-piano-generator/' : '/';
const checkpoint = publicPath + 'checkpoints/mel_4bar_med_lokl_q2';
const model = new mm.MusicVAE(checkpoint);
// const player = new mm.Player();

const addControls = handler => {
  const button = document.createElement('button');
  button.innerText = 'play';
  const root = document.getElementById('app');
  root.appendChild(button);
  button.addEventListener('click', handler);
};

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const pitch2NoteStep = pitch => ((pitch - MIDI_C1) % 12);

const pitch2Note = pitch => {
  const octave = Math.floor((pitch - MIDI_C1) / 12) + 1;
  const note = NOTES[pitch2NoteStep(pitch)];
  return `${note}${note.length === 1 ? '-' : ''}${octave}`;
};

const mapNote = stepsPerQuarter => note => {
  return {
    note: pitch2Note(note.pitch),
    start: note.quantizedStartStep / stepsPerQuarter,
    end: note.quantizedEndStep / stepsPerQuarter,
  }
};

const debug = sample => {
  const notes = sample.notes.map(mapNote(sample.quantizationInfo.stepsPerQuarter));
  let el = document.getElementById('debug');
  if (!el) {
    el = document.createElement('pre');
    el.id = 'debug';
    el.style = 'background: rgba(255,255,255,0.5);';
    document.getElementById('app').appendChild(el);
  }
  el.innerText = JSON.stringify(notes, null, 2);
};

const generate = context => {
  context.scene.tempo = rand(50, 75);
  return model.sample(2);
};

const KEYS = [
  [0, 2, 4, 5, 7, 9, 11], //  C
  [0, 1, 3, 5, 6, 8, 10],
  [1, 2, 4, 6, 7, 9, 11], // D
  [0, 2, 3, 5, 7, 8, 10],
  [1, 3, 4, 6, 8, 9, 11], // E
  [0, 2, 4, 5, 7, 9, 10], // F
  [1, 3, 5, 6, 8, 10, 11],
  [0, 2, 4, 6, 7, 9, 11], // G
  [0, 1, 3, 5, 7, 8, 10],
  [1, 2, 4, 6, 8, 9, 11], // A
  [0, 2, 3, 5, 7, 9, 10],
  [1, 3, 4, 6, 8, 10, 11],
];

const recognizeKey = noteSequence => {
  const notes = noteSequence.map(note => pitch2NoteStep(note.pitch));
  const bestMatch = {key: null, misses: 99};
  for (let i = 0; i < KEYS.length; ++i) {
    const misses = notes.filter(x => !KEYS[i].includes(x)).length;
    if (misses < bestMatch.misses) {
      bestMatch.key = i;
      bestMatch.misses = misses;
    }
  }
  console.log('best match', bestMatch.key, bestMatch.misses, notes);
  return bestMatch.key;
};

export default context => {
  model
    .initialize()
    .then(() => {
      addControls(() => {
        pause(context.sequencer);
        /* all.forEach(i => {
          context.mixer.instruments[i].setParam('oscOn0', false);
          context.mixer.instruments[i].setParam('oscOn1', false);
        }); */
        generate(context)
        .then(samples => {
          context.scene.themes = [
            {notes: samples[0].notes, key: recognizeKey(samples[0].notes)},
            {notes: samples[1].notes, key: recognizeKey(samples[1].notes)},
          ];
          console.log(samples[0]);
          play(context.sequencer);
        })
        .catch(err => console.error(err))
      });
    })
    .catch(err => console.error(err))
};
