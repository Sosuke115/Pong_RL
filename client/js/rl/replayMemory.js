
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
      action: action,
      reward: reward,
      done: done,
      nextState: nextState,
    };
    this.position = (this.position + 1) % this.capacity;
  }

  // Returns a random sample of the given size
  sample(batchSize) {
    return getRandomSubarray(this.memory, batchSize);
  }
  // sample(batchSize, nstep) {
  //   const range = [...Array(this.size()).keys()];
  //   const idxs = getRandomSubarray(range, batchSize);
  //   const batch = [];

  //   const getNextIdx = (idx) => {
  //     if (idx >= this.size() - 1 || idx === this.position - 1) {
  //       return null;
  //     } else {
  //       return (idx + 1) % this.capacity;
  //     }
  //   }

  //   for (let i of idxs) {
  //     let reward = 0;
  //     let done = false;
  //     let nextState = undefined;
  //     let i_ = i;
  //     for (let j = 0; j < nstep; j++) {
  //       const trans = this.memory[i_];
  //       reward += trans.reward;
  //       done ||= trans.done;
  //       nextState = trans.nextState;
  //       i_ = getNextIdx(i_);
  //       if (done || i_ === null) break;
  //     }

  //     const transition = this.memory[i];
  //     batch.push({
  //       state: transition.state,
  //       action: transition.action,
  //       reward: reward,
  //       done: done,
  //       nextState: nextState,
  //     })
  //   }
  //   return batch;
  // }
}
