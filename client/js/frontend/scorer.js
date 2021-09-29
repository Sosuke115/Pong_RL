// スコアの保持と描画
export class Scorer {
  constructor() {
    this.rlScore = 0;
    this.humanScore = 0;
  }

  reset() {
    this.rlScore = 0;
    this.humanScore = 0;
  }

  step(humanOrRl) {
    if (humanOrRl === "human") {
      this.humanScore += 1;
    } else if (humanOrRl === "rl") {
      this.rlScore += 1;
    } else {
      // do nothing
    }
  }

  draw() {
    $("#rl-score").text(this.rlScore.toString());
    $("#human-score").text(this.humanScore.toString());
  }

  stepAndDraw(humanOrRl) {
    this.step(humanOrRl);
    this.draw();
  }

  getScore(){
    return this.humanScore - this.rlScore;
  }
}
