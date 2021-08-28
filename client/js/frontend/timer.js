// 残り時間の管理と描画
export class Timer {
  // 現在時刻と残り時間数をinit
  constructor(limitTime) {
    this.initLimitTime = (limitTime + 1) * 1000;
    this.limitTime = (limitTime + 1) * 1000;
    this.previousTime = new Date().getTime();
  }

  reset() {
    this.limitTime = this.initLimitTime;
    this.previousTime = new Date().getTime();
  }

  getRemTime() {
    return parseInt(this.limitTime / 1000);
  }

  // 現在の残り時間を描画
  draw() {
    let currentTime = new Date().getTime();
    this.limitTime = Math.max(
      this.limitTime - (currentTime - this.previousTime),
      0
    );
    this.previousTime = currentTime;

    $(".time").text(parseInt(this.limitTime / 1000).toString());
  }
}
