import { GameScreen } from "./gameScreen.js";
import { Scorer } from "./scorer.js";
import { Timer } from "./timer.js";
import { PongRLEnv } from "../rl/pongRLEnv.js";
import { KeyAgent } from "../rl/agents/keyAgent.js";
import { sleep } from "../utils.js";

let worker;
let gameRunningState = 0; //0: pending, 1: trying to stop, 2: running
const initGameScreen = new GameScreen(0);

class RLController {
  constructor(input) {
    this.rlConfig = null;
    this.action = null;
    this.nextAction = null;
    this.worker = worker;
    this.worker.postMessage({
      command: "buildController",
      input: input,
      side: "rl",
      origin: window.location.origin,
    });
    this.worker.onmessage = (m) => {
      if ("config" in m.data) this.rlConfig = m.data.config;
      if ("action" in m.data) this.nextAction = m.data.action;
    };
  }

  async warmUp() {
    // build controller
    while (this.rlConfig === null) await sleep(200);
    // console.log("build complete");

    // compute action (first inference takes much longer time than others)
    const dummyState = {
      ball: { x: 0, y: 0, forceX: 0, forceY: 0 },
      rlPaddle: { x: 0 },
      humanPaddle: { x: 0 },
    };
    this.worker.postMessage({
      command: "computeAction",
      state: dummyState,
    });

    while (this.nextAction === null) await sleep(200);
    this.nextAction = null;
    // console.log("inference complete");
  }

  selectAction(state, timeStep) {
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

async function waitUntilGameEnd() {
  if ($.inArray(gameRunningState, [1, 2]) != -1) {
    gameRunningState = 1;
    while (gameRunningState == 1) await sleep(80);
  }
}

// main処理
async function main(rlId) {
  // 環境
  const env = new PongRLEnv();
  const InitState = env.reset();
  console.log(`Start  RL: "${rlId}"`);

  // load game screen
  const betweenMatchInterval = 500;
  const gameScreen = new GameScreen();

  const scorer = new Scorer();
  const timer = new Timer(60);

  // draw init state
  let state = env.reset();
  scorer.draw();

  // loading screen
  $(".loading-screen").show();
  // load model
  const humanController = new KeyAgent();
  const rlController = new RLController(rlId);
  await rlController.warmUp();
  $(".loading-screen").fadeOut(50);

  let timeStep = 0;

  await gameScreen.draw(InitState);
  await sleep(betweenMatchInterval);

  timer.draw();
  timer.start();
  while (true) {
    // monitor running flag
    if ($.inArray(gameRunningState, [0, 1]) != -1) {
      gameRunningState = 0;
      break;
    }

    
    const res = env.step({
      humanAction: humanController.selectAction(),
      rlAction: rlController.selectAction(state, timeStep),
    });

    await gameScreen.draw(res.state);
    timer.draw();

    if (res.done) {
      timer.stop();
      state = env.reset();
      await gameScreen.draw(state);
      scorer.step_and_draw(res.state.winner);
      timeStep = 0;
      await sleep(betweenMatchInterval);
      timer.start();
    } else {
      state = res.state;
      timeStep += 1;
    }
  }
  console.log("game end");
  gameScreen.clearInsideCanvas();
}

// init process
$(document).ready(function () {
  // init rl selection button state
  const buttonId = "step-0k";
  $("#" + buttonId).addClass("pressed-buttons-color");
  $("#" + buttonId).prop("disabled", true);

  // init game button
  $("#game-button").addClass("pressed-buttons-color");
  $("#game-button").prop("disabled", true);

  // init game screen
  initGameScreen.draw(new PongRLEnv().reset());

  // load worker bundle in advance for better performance
  worker = new Worker("../../dist/worker.bundle.js");
});

// Process for rl selection button
$(".rl-selection-button").on("click", function () {
  $(".rl-selection-button").prop("disabled", false);
  // color
  const buttonId = $(this).attr("id");
  $(".rl-selection-button").removeClass("pressed-buttons-color");
  $("#" + buttonId).addClass("pressed-buttons-color");
  $("#" + buttonId).prop("disabled", true);
});

// process for start button
$("#start-button").on("click", async function () {
  // reset ranking button
  $("#game-button").prop("disabled", true);
  $("#ranking-button").prop("disabled", false);
  $(".start-screen").fadeOut();

  let rlId = undefined;
  $(".rl-selection-button").each(function (index, element) {
    if ($(element).prop("disabled")) {
      rlId = parseInt($(element).text().replace(/k/, "000"));
    }
  });

  // start game
  gameRunningState = 2;
  main(rlId);
});

// process for game button
$("#game-button").on("click", async function () {
  $("#game-button").prop("disabled", true);
  $("#ranking-button").prop("disabled", false);
  $(".result-screen").fadeOut();
  // wait until the game is over
  await waitUntilGameEnd();
  // init game screen
  initGameScreen.draw(new PongRLEnv().reset());
  $(".start-screen").fadeIn();
});

// process for ranking button
$("#ranking-button").on("click", async function () {
  $("#ranking-button").prop("disabled", true);
  $("#game-button").prop("disabled", false);
  // wait until the game is over
  await waitUntilGameEnd();
  
  // clear game screen
  initGameScreen.clearInsideCanvas();
  $(".start-screen").fadeOut();
  $(".result-screen").fadeIn();
});

//game and ranking button color
$("#game-button, #ranking-button").on("click", function () {
  $("#game-button, #ranking-button").removeClass("pressed-buttons-color");
  $(this).addClass("pressed-buttons-color");
});
