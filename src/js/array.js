import random from './random'

function shuffle(arr) {
  if (arr.length < 2) {
    return
  }
  for (let i=0; i<Math.pow(arr.length, 2); i++) {
    var index1 = random.int(0, arr.length - 1)
    var index2 = random.int(0, arr.length - 1)
    var val1 = arr[index1]
    arr[index1] = arr[index2]
    arr[index2] = val1
  }
}

function randomItem(arr) {
  return arr[random.int(0, arr.length - 1)]
}

export default {
  randomItem,
  shuffle
}
