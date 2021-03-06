//Stateから描画するクラス
export class GameScreen {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.intervalId = null;
  }

  drawHorizontalLine(winner, drawOrClear) {
    let line_y = winner == "rl" ? this.canvas.height : 0;
    if (drawOrClear === "draw") {
      this.ctx.strokeStyle = "#CEB845";
      this.ctx.lineWidth = 5;
      this.ctx.beginPath();
      this.ctx.moveTo(0, line_y);
      this.ctx.lineTo(this.canvas.width, line_y);
      this.ctx.closePath();
      this.ctx.stroke();
    } else {
      this.ctx.strokeStyle = "#FFFFFF";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(0, line_y);
      this.ctx.lineTo(this.canvas.width, line_y);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  startGoalEffect(winner) {
    let drawOrClear = "draw";
    this.intervalId = setInterval(() => {
      this.drawHorizontalLine(winner, drawOrClear);
      drawOrClear = drawOrClear === "draw" ? "clear" : "draw";
    }, 100);
  }

  stopGoalEffect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Given an object with coordinates and size, draw it to the canvas
  drawObject(obj, color) {
    this.ctx.lineWidth = 1;
    const width = obj.width * this.canvas.width;
    const height = obj.height * this.canvas.height;
    const x = obj.x * this.canvas.width - width / 2;
    const y = obj.y * this.canvas.height - height / 2;
    this.ctx.fillStyle = color;
    fillRoundRect(this.ctx, x, y, width, height, 5);
  }

  drawFrameBorder(){
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.strokeStyle = "#FFFFFF";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  clearInsideCanvas() {
    this.clearCanvas();
    this.drawFrameBorder();
  }

  // Redraw the game based on the current state
  draw(state) {
    this.stopGoalEffect()

    this.clearCanvas();
    this.drawFrameBorder();

    this.drawObject(state.ball, "#FFFFFF");
    this.drawObject(state.humanPaddle, "#628DA5");
    this.drawObject(state.rlPaddle, "#628DA5");

    if (state.winner) {
      this.startGoalEffect(state.winner);
    }
  }
}

/**
 * 角が丸い四角形のパスを作成する
 * @param  {CanvasRenderingContext2D} ctx コンテキスト
 * @param  {Number} x   左上隅のX座標
 * @param  {Number} y   左上隅のY座標
 * @param  {Number} w   幅
 * @param  {Number} h   高さ
 * @param  {Number} r   半径
 */
function createRoundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arc(x + w - r, y + r, r, Math.PI * (3 / 2), 0, false);
  ctx.lineTo(x + w, y + h - r);
  ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * (1 / 2), false);
  ctx.lineTo(x + r, y + h);
  ctx.arc(x + r, y + h - r, r, Math.PI * (1 / 2), Math.PI, false);
  ctx.lineTo(x, y + r);
  ctx.arc(x + r, y + r, r, Math.PI, Math.PI * (3 / 2), false);
  ctx.closePath();
}

/**
 * 角が丸い四角形を塗りつぶす
 * @param  {CanvasRenderingContext2D} ctx コンテキスト
 * @param  {Number} x   左上隅のX座標
 * @param  {Number} y   左上隅のY座標
 * @param  {Number} w   幅
 * @param  {Number} h   高さ
 * @param  {Number} r   半径
 */
function fillRoundRect(ctx, x, y, w, h, r) {
  createRoundRectPath(ctx, x, y, w, h, r);
  ctx.fill();
}

/**
 * 角が丸い四角形を描画
 * @param  {CanvasRenderingContext2D} ctx コンテキスト
 * @param  {Number} x   左上隅のX座標
 * @param  {Number} y   左上隅のY座標
 * @param  {Number} w   幅
 * @param  {Number} h   高さ
 * @param  {Number} r   半径
 */
function strokeRoundRect(ctx, x, y, w, h, r) {
  createRoundRectPath(ctx, x, y, w, h, r);
  ctx.stroke();
}
