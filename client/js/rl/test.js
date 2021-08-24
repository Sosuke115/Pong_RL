import { PongRLEnv } from "./pongRLEnv.js";
import { KeyController } from "./keyController.js";
import { RLAgent, RandomAgent } from "./agent.js";
import { GameScreen } from "../frontend/gameScreen.js";


function sleep(msec) {
  return new Promise(resolve => setTimeout(resolve, Math.max(msec, 0)));
}

async function getController(input) {
  let controller;
  if (input) {
    if (input === "0") {
      controller = new RandomAgent();
    } else {
      controller = new RLAgent(false);
      await controller.loadModel(`http://localhost:3000/js/rl/models/model-${input}.json`);
    }
  } else {
    controller = new KeyController();
  }
  return controller;
}

async function main(humanInput, rlInput, visualize = true) {
  const env = new PongRLEnv();
  const screen = new GameScreen();

  // load model
  const humanController = await getController(humanInput);
  const rlController = await getController(rlInput);

  const frameSkip = (new RLAgent()).config.frameSkip;

  let gameCount = 0;
  let rlWinRate = 0;

  let state = env.reset();
  if (visualize) screen.draw(state);
  let timeStep = 0;
  let humanAction = undefined;
  let rlAction = undefined;

  while (true) {
    const startTime = performance.now();

    if (humanController instanceof KeyController) {
      humanAction = humanController.selectAction();
    } else if (timeStep % frameSkip === 0) {
      humanAction = humanController.selectAction(state, "human", false);
    }
    if (rlController instanceof KeyController) {
      rlAction = rlController.selectAction();
    } else if (timeStep % frameSkip === 0) {
      rlAction = rlController.selectAction(state, "rl", false);
    }

    const res = env.step({
      humanAction: humanAction,
      rlAction: rlAction,
    });
    if (visualize) screen.draw(res.state);

    const endTime = performance.now();
    if (visualize) {
      // decide sleep time considering the computation time so far
      await sleep(env.updateFrequency - (endTime - startTime));
    }

    if (res.done) {
      gameCount += 1;
      rlWinRate += (Number(res.reward === 1) - rlWinRate) / gameCount;
      console.log(`gameCount: ${gameCount}  rlReward: ${res.reward}  rlWinRate: ${rlWinRate.toFixed(4)}`);

      state = env.reset();
      if (visualize) screen.draw(state);
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

  const visualize = $("#visualize-checkbox").prop("checked");

  // Disable the start button.
  // Please reload the page if you want to restart.
  $("#start-button").prop("disabled", true);

  console.log(`Start  Human: "${humanInput}" RL: "${rlInput}" visualize: ${visualize}`);
  main(humanInput, rlInput, visualize);
});
