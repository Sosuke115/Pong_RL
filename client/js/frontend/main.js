import { GameScreen } from "./gameScreen.js";
import { Scorer } from "./scorer.js";
import { Timer } from "./timer.js";
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

function getEndFlag(remTime) {
  let reStartFlag = $("#start-button").prop("disabled");
  if (reStartFlag) {
    return 1; // button break
  } else if (remTime === 0) {
    return 2; // time break
  } else {
    return -1;
  }
}

// flagで終了する形式にする？
async function main(rlId) {
  const env = new PongRLEnv();
  console.log(`Start  RL: "${rlId}"`);
  const gameScreen = new GameScreen();

  // load model
  const humanController = await getController(-1);
  const rlController = await getController(rlId);
  const frameSkip = new RLAgent().config.frameSkip;
  const scorer = new Scorer();
  const timer = new Timer(10);

  let state = env.reset();
  gameScreen.draw(state);
  timer.draw();
  scorer.draw();
  let timeStep = 0;
  let humanAction = undefined;
  let rlAction = undefined;
  let endFlag = -1;

  while (true) {
    // monitor the end flag
    let endFlag = getEndFlag(timer.getRemTime());

    // handle the end flag
    if (endFlag != -1) {
      if (endFlag == 2) {
        $("#start-button").removeClass("first-click");
      }
      $("#start-button").prop("disabled", false);
      break;
    }

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
    timer.draw();

    const endTime = performance.now();
    // decide sleep time considering the computation time so far
    await sleep(env.updateFrequency - (endTime - startTime));

    if (res.done) {
      state = env.reset();
      gameScreen.draw(state);
      scorer.step_and_draw(res.state.winner);
      timeStep = 0;
    } else {
      state = res.state;
      timeStep += 1;
    }
  }
  gameScreen.clearCanvas();
}

// Process for training step button
$(".rl-selection-button").on("click", function () {
  $(".rl-selection-button").prop("disabled", false);
  // color
  const buttonId = $(this).attr("id");
  $(".rl-selection-button").css("background-color", "#FFFFFF");
  $("#" + buttonId).css("background-color", "#CEB845");

  // rl model
  const rlId = parseInt(
    $("#" + buttonId)
      .text()
      .replace(/,/, "")
  );

  $("#" + buttonId).prop("disabled", true);
});

// Start button
$("#start-button").on("click", async function () {
  let rlId = undefined;
  $(".rl-selection-button").each(function (index, element) {
    if ($(element).prop("disabled")) {
      rlId = parseInt($(element).text().replace(/,/, ""));
    }
  });

  if ($(this).hasClass("first-click") == false) {
    $(this).addClass("first-click");
    $(this).text("ReStart");
  } else {
    $("#start-button").prop("disabled", true);
    // falseになるまで（前回のmainが終わるまで）待つ
    // TODO確実にfalseになるまで待つようにしたい
    await sleep(100);
  }
  main(rlId);
});

//
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
