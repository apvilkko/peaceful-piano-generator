export const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
export const randFloat = (min, max) => min + Math.random() * (max - min);

const randInt = max => Math.floor(Math.random() * max);

function swap(arr, i, j) {
  // swaps two elements of an array in place
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

export const shuffle = list => {
  const arr = [...list];
  for (let slot = arr.length - 1; slot > 0; slot--) { // eslint-disable-line
    const element = randInt(slot + 1);
    swap(arr, element, slot);
  }
  return arr;
};
