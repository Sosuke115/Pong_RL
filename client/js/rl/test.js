import { PongRLEnv } from "./pongRLEnv.js";
import { KeyController } from "./keyController.js";
import { RLAgent } from "./agent.js";
// import { DrawState } from "../frontend/pongRLFront.js";

// TODO: import from pongRLFront.js.
// Currently, it automatically starts a game.
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

async function getController(input) {
  let controller;
  if (input) {
    controller = new RLAgent(false);
    await controller.loadModel(`http://localhost:3000/js/rl/models/model-${input}.json`);
  } else {
    controller = new KeyController();
  }
  return controller;
}

async function main(humanInput, rlInput) {
  const env = new PongRLEnv();
  const drawState = new DrawState();

  // load model
  const humanController = await getController(humanInput);
  const rlController = await getController(rlInput);

  let frameSkip;
  if (humanController instanceof RLAgent) {
    frameSkip = humanController.config.frameSkip;
  } else {
    frameSkip = rlController.config.frameSkip;
  }

  let state = env.reset();
  drawState.draw(state);
  let timeStep = 0;
  let humanAction = undefined;
  let rlAction = undefined;

  while (true) {
    const startTime = performance.now();

    // decrease frequency of inference (human action?)
    if (timeStep % frameSkip === 0) {
      // 3rd argument (false): no exploration
      humanAction = humanController.selectAction(state, "human", false);
      rlAction = rlController.selectAction(state, "rl", false);
    }

    const res = env.step({
      humanAction: humanAction,
      rlAction: rlAction,
    });
    drawState.draw(res.state);

    const endTime = performance.now();
    // decide sleep time considering the computation time so far
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

$("#start-button").on("click", () => {
  const humanInput = $("#human-player").val();
  const rlInput = $("#rl-player").val();

  if (!humanInput && !rlInput) {
    alert("One of the players has to be an RL agent");
    return false;
  }

  const checkInput = (input) => (input === "" || !isNaN(parseInt(input)));
  if (!checkInput(humanInput) || !checkInput(rlInput)) {
    alert(`Invalid input  Human: "${humanInput}" RL: "${rlInput}"`);
    return false;
  }

  // Disable the start button.
  // Please reload the page if you want to restart.
  $("#start-button").prop("disabled", true);

  console.log(`Start  Human: "${humanInput}" RL: "${rlInput}"`);
  main(humanInput, rlInput);
});
