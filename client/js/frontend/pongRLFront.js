import { PongRLEnv } from "../rl/pongRLEnv.js";
import { KeyController } from "../rl/keyController.js";

//Stateから描画するクラス
class DrawState {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
  }

  // Given an object with coordinates and size, draw it to the canvas
  drawObject(obj) {
    const width = obj.width * this.canvas.width;
    const height = obj.height * this.canvas.height;
    const x = obj.x * this.canvas.width - width / 2;
    const y = obj.y * this.canvas.height - height / 2;
    this.ctx.fillRect(x, y, width, height);
  }

  // Redraw the game based on the current state
  async draw(state) {
    this.ctx.fillStyle = "#e5e5e6";
    this.ctx.strokeStyle = "#e5e5e6";
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawObject(state.ball);
    this.drawObject(state.humanPaddle);
    this.drawObject(state.rlPaddle);

    return new Promise((resolve) => {
      window.requestAnimationFrame(resolve);
    });
  }
}

// 描画をテストする関数
function drawTest() {
  const keyController = new KeyController();
  const pongRLEnv = new PongRLEnv();
  const drawState = new DrawState();
  drawState.draw(pongRLEnv.reset());
  const refreshIntervalId = setInterval(() => {
    // action
    let action = {
      humanAction: keyController.selectAction(),
      rlAction: "noop",
    };
    // step
    let res = pongRLEnv.step(action);
    // draw
    drawState.draw(res.state);
    if (res.done) {
      drawState.draw(pongRLEnv.reset());
      // clearInterval(refreshIntervalId);
    }
  }, pongRLEnv.updateFrequency);
}

$(document).ready(() => {
  drawTest();
});
