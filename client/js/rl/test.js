import { PongRLEnv } from "./pongRLEnv.js";
import { KeyAgent } from "./agents/keyAgent.js";
import { GameScreen } from "../frontend/gameScreen.js";
import { sleep } from "../utils.js";


class Controller {
  constructor(side, input) {
    this.side = side;
    if (input === "") {
      this.type_ = "key";
      this.agent = new KeyAgent();
    } else {
      this.type_ = "rl";
      this.rlConfig = null;
      this.action = null;
      this.nextAction = null;
      this.worker = new Worker(new URL("./worker.js", import.meta.url));
      this.worker.postMessage({
        command: "buildController",
        input: input,
        side: side,
      });
      this.worker.onmessage = (m) => {
        if ("config" in m.data) this.rlConfig = m.data.config;
        if ("action" in m.data) this.nextAction = m.data.action;
      }
    }
  }

  async warmUp() {
    if (this.type_ === "key") return;

    console.log("warmup");
    // build controller
    while (this.rlConfig === null) await sleep(200);
    console.log("build complete");

    // compute action (first inference takes much longer time than others)
    const dummyState = {
      ball: {x: 0, y: 0, forceX: 0, forceY: 0},
      rlPaddle: {x: 0},
      humanPaddle: {x: 0},
    };
    this.worker.postMessage({
      command: "computeAction",
      state: dummyState,
    });
    console.log("post message");

    while (this.nextAction === null) await sleep(200);
    this.nextAction = null;
    console.log("inference complete");
  }

  selectAction(state, timeStep) {
    if (this.type_ === "key") {
      return this.agent.selectAction();
    } else {
      if (timeStep % this.rlConfig.frameSkip === 0) {
        const nextAction = this.nextAction;
        this.nextAction = null;
        this.worker.postMessage({
          command: "computeAction",
          state: state,
        });

        if (nextAction === null) {
          if (timeStep === 0) {
            this.action = 1;
          } else {
            console.warn("compute action is not completed");
          }
        } else {
          this.action = nextAction;
        }
      }
      return this.action;
    }
  }
}

async function main(humanInput, rlInput, visualize = true) {
  const env = new PongRLEnv();
  const screen = new GameScreen();

  // load model
  const humanController = new Controller("human", humanInput);
  const rlController = new Controller("rl", rlInput);
  await humanController.warmUp();
  await rlController.warmUp();

  let gameCount = 0;
  let rlWinRate = 0;

  let state = env.reset();
  if (visualize) await screen.draw(state);
  let timeStep = 0;

  while (true) {
    const res = env.step({
      humanAction: humanController.selectAction(state, timeStep),
      rlAction: rlController.selectAction(state, timeStep),
    });
    if (visualize) await screen.draw(res.state);

    if (res.done) {
      gameCount += 1;
      rlWinRate += (Number(res.reward === 1) - rlWinRate) / gameCount;
      console.log(`gameCount: ${gameCount}  timeStep: ${timeStep}  rlReward: ${res.reward}  rlWinRate: ${rlWinRate.toFixed(4)}`);

      state = env.reset();
      if (visualize) await screen.draw(state);
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
