export class AudioController {
  constructor() {
    this.goalRl = $("#audio-goal-rl").get(0);
    this.goalHuman = $("#audio-goal-human").get(0);
    this.hitRl = $("#audio-hit-rl").get(0);
    this.hitHuman = $("#audio-hit-human").get(0);
  }
  playGoalAudio(winner) {
    if (winner == "human") {
      this.goalHuman.play();
    } else {
      this.goalRl.play();
    }
  }
  playHitAudio(hitter) {
    if (hitter == "human") {
      this.hitHuman.play();
    } else if (hitter == "rl") {
      this.hitRl.play();
    }
  }
}
