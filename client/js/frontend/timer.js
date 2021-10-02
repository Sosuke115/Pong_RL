// 残り時間の管理と描画
export class Timer {
  // 現在時刻と残り時間数をinit
  constructor(limitTime) {
    this.initLimitTime = (limitTime) * 1000;
    this.limitTime = (limitTime) * 1000;
    this.previousTime = new Date().getTime();
    this.isRunning = false;
  }

  stop() {
    this.isRunning = false;
    this.updateLimitTime();
  }

  start() {
    this.isRunning = true;
    this.previousTime = new Date().getTime();
  }

  getRemTime() {
    return Math.ceil(this.limitTime / 1000);
  }

  updateLimitTime() {
    let currentTime = new Date().getTime();
    this.limitTime = Math.max(
      this.limitTime - (currentTime - this.previousTime),
      0
    );
    this.previousTime = currentTime;
  }

  // 現在の残り時間を描画
  draw() {
    if (this.isRunning) {
      this.updateLimitTime();
    }

    $(".time").text(Math.ceil(this.limitTime / 1000).toString());
  }
}
