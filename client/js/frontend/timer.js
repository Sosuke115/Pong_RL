// timeStepから残り時間を管理するクラス
export class Timer {
  constructor(limitTime, fps = 60) {
    this.limitTime = limitTime;
    this.fps = fps;
    this.remTimeStep = 0;
  }

  step(timeStep) {
    if (timeStep != 0 && (timeStep + this.remTimeStep) % this.fps == 0) {
      this.limitTime = this.limitTime - 1;
    }
  }

  //take over the previous time step.
  resetMatch(timeStep) {
    this.remTimeStep = timeStep % this.fps;
  }

  getRemTime() {
    return this.limitTime;
  }

  // 現在の残り時間を描画
  draw() {
    $(".time").text(this.limitTime.toString());
  }
}
