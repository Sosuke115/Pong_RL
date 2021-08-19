import { PongRLEnv } from "./pongRLEnv.js";
import { KeyController } from "./keyController.js";
import { RLAgent } from "./agent.js";

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

function sleep(msec) {
  return new Promise(resolve => setTimeout(resolve, Math.max(msec, 0)));
}

async function drawTest() {
  const keyController = new KeyController();
  const env = new PongRLEnv();
  const drawState = new DrawState();
  const rlAgent = new RLAgent(false);

  await rlAgent.loadModel("http://localhost:3000/models/model-250.json");

  console.log("load model");

  let state = env.reset();
  drawState.draw(state);
  let timeStep = 0;
  let humanAction = undefined;
  let rlAction = undefined;

  while (true) {
    const startTime = performance.now();

    humanAction = keyController.selectAction();
    // decrease frequency of inference (human action?)
    if (timeStep % rlAgent.config.frameSkip === 0) {
      rlAction = rlAgent.selectAction(state, "rl")
    }

    const action = {
      humanAction: humanAction,
      rlAction: rlAction,
    };

    const res = env.step(action);    
    drawState.draw(res.state);

    const endTime = performance.now();
    // decide sleep time considering computation time so far
    await sleep(env.updateFrequency - (endTime - startTime));

    if (res.done) {
      state = env.reset();
      drawState.draw(state);
      timeStep = 0;
    } else {
      state = res.state;
      timeStep += 1;
    }
  }
}

$(document).ready(() => {
  drawTest();
});
