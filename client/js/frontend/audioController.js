// BGMの管理
export class AudioController {
  constructor() {
    this.goalRl = $("#audio-goal-rl")[0];
    this.goalHuman = $("#audio-goal-human")[0];
    this.hitRl = $("#audio-hit-rl")[0];
    this.hitHuman = $("#audio-hit-human")[0];
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
