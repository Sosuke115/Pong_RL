
function getRandomSubarray(arr, size) {
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}


export class ReplayMemory {
  constructor(capacity) {
    this.capacity = capacity
    this.memory = [];
    this.position = 0;
  }

  size() {
    return this.memory.length;
  }

  push(state, action, reward, done, nextState) {
    if (this.memory.length < this.capacity) {
      this.memory.push(undefined);
    }
    this.memory[this.position] = {
      state: state,
      nextState: nextState,
      action: action,
      reward: reward,
      action: action,
      done: done,
    };
    this.position = (this.position + 1) % this.capacity;
  }

  // Returns a random sample of the given size
  sample(n) {
    return getRandomSubarray(this.memory, n)
  }
}
