import { sleep } from "../utils.js";

// Decide how much time to sleep
export class SleepTimeScheduler {
  constructor(
    stepInterval = 1000 / 60,
    matchInterval = 500,
    goalEffectDuration = 500
  ) {
    this.stepInterval = stepInterval;
    this.matchInterval = matchInterval;
    this.goalEffectDuration = goalEffectDuration;
  }

  reset() {
    return sleep(this.matchInterval);
  }

  step() {
    return sleep(this.stepInterval);
  }

  end() {
    return sleep(this.goalEffectDuration);
  }
}
