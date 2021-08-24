import { GameScreen } from "./gameScreen.js";
import { PongRLEnv } from "../rl/pongRLEnv.js";
import { KeyController } from "../rl/keyController.js";
import { RLAgent, RandomAgent } from "../rl/agent.js";
import { sleep } from "../utils.js";

async function getController(input) {
  let controller;
  const controllerList = [0, 10000, 20000, 30000];
  if ($.inArray(input, controllerList) != -1) {
    if (input === 0) {
      controller = new RandomAgent();
    } else {
      controller = new RLAgent(false);
      await controller.loadModel(
        `http://localhost:3000/js/rl/models/model-${input}.json`
      );
    }
  } else {
    controller = new KeyController();
  }
  return controller;
}

async function main(rlId) {
  const env = new PongRLEnv();
  const gameScreen = new GameScreen();

  // load model
  const humanController = await getController(-1);
  const rlController = await getController(rlId);
  const frameSkip = new RLAgent().config.frameSkip;

  let state = env.reset();
  gameScreen.draw(state);
  let timeStep = 0;
  let humanAction = undefined;
  let rlAction = undefined;

  while (true) {
    const startTime = performance.now();

    // decrease frequency of inference (human action?)
    if (timeStep % frameSkip === 0) {
      // 3rd argument (false): no exploration
      rlAction = rlController.selectAction(state, "rl", false);
    }
    humanAction = humanController.selectAction(state, "human", false);

    const res = env.step({
      humanAction: humanAction,
      rlAction: rlAction,
    });
    gameScreen.draw(res.state);

    const endTime = performance.now();
    // decide sleep time considering the computation time so far
    await sleep(env.updateFrequency - (endTime - startTime));

    if (res.done) {
      state = env.reset();
      gameScreen.draw(state);
      timeStep = 0;
    } else {
      state = res.state;
      timeStep += 1;
    }
  }
}

// Process for training step button
let lastButtonId = undefined; // global変数使うのは微妙か？・・？
$(".rl-selection-button").on("click", function () {
  // color
  const buttonId = $(this).attr("id");
  $("#" + lastButtonId).css("background-color", "#FFFFFF");
  $("#" + buttonId).css("background-color", "#CEB845");
  lastButtonId = buttonId;

  // rl model
  const rlId = parseInt(
    $("#" + buttonId)
      .text()
      .replace(/,/, "")
  );

  main(rlId);
  // todo restart button
  $(".rl-selection-button").prop("disabled", true);
});

$(document).keydown(function (event) {
  if (event.key === "ArrowRight") {
    $(".right-key").css("border-left", "40px solid #628DA5");
  }
  if (event.key === "ArrowLeft") {
    $(".left-key").css("border-right", "40px solid #628DA5");
  }
});

$(document).keyup(function (event) {
  if (event.key === "ArrowRight") {
    $(".right-key").css("border-left", "40px solid white");
  }
  if (event.key === "ArrowLeft") {
    $(".left-key").css("border-right", "40px solid white");
  }
});
