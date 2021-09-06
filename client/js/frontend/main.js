import { GameScreen } from "./gameScreen.js";
import { Scorer } from "./scorer.js";
import { Timer } from "./timer.js";
import { PongRLEnv } from "../rl/pongRLEnv.js";
import { KeyAgent } from "../rl/agents/keyAgent.js";
import { sleep } from "../utils.js";

class RLController {
  constructor(input) {
    this.rlConfig = null;
    this.action = null;
    this.nextAction = null;
    this.worker = new Worker(new URL("../rl/worker.js", import.meta.url));
    this.worker.postMessage({
      command: "buildController",
      input: input,
      side: "rl",
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

function getEndFlag(remTime) {
  let reStartFlag = $("#start-button").prop("disabled");
  let rankingFlag = $("#ranking-button").prop("disabled");
  if (reStartFlag) {
    return 1; // button break
  } else if (remTime === 0) {
    return 2; // time break
  }
  if (rankingFlag) {
    return 3; // button break
  } else {
    return -1;
  }
}

// flagで終了する形式にする？
async function main(rlId) {
  //
  const env = new PongRLEnv();
  console.log(`Start  RL: "${rlId}"`);

  // load game screen
  const betweenMatchInterval = 200;
  const gameScreen = new GameScreen();

  const scorer = new Scorer();
  const timer = new Timer(60);

  // draw init state
  let state = env.reset();
  scorer.draw();

  // load model
  const humanController = new KeyAgent();
  const rlController = new RLController(rlId);
  await rlController.warmUp();

  let timeStep = 0;

  await sleep(betweenMatchInterval);

  timer.start();
  while (true) {
    // monitor the end flag
    let endFlag = getEndFlag(timer.getRemTime());

    // handle the end flag
    if (endFlag != -1) {
      if (endFlag == 2) {
        $("#start-button").removeClass("first-click");
        $('#ranking-button').click();
      }
      $("#start-button").prop("disabled", false);
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
  gameScreen.clearCanvas();
  gameScreen.drawFrameBorder();
}

//
$(document).ready(function () {
  // ボタンの初期状態
  const buttonId = "step-0k";
  $(".rl-selection-button").css("background-color", "#FFFFFF");
  $("#" + buttonId).css("background-color", "#CEB845");
  $("#" + buttonId).prop("disabled", true);

  // 初期ゲーム画面の描画
  const goalEffectInterval = 500;
  new GameScreen(goalEffectInterval).drawFrameBorder();
});

// Process for training step button
$(".rl-selection-button").on("click", function () {
  $(".rl-selection-button").prop("disabled", false);
  // color
  const buttonId = $(this).attr("id");
  $(".rl-selection-button").css("background-color", "#FFFFFF");
  $("#" + buttonId).css("background-color", "#CEB845");

  $("#" + buttonId).prop("disabled", true);
});

// Start button
$("#start-button").on("click", async function () {
  // reset ranking button
  $("#ranking-button").prop("disabled", false);
  $(".result-screen").fadeOut();

  let rlId = undefined;
  $(".rl-selection-button").each(function (index, element) {
    if ($(element).prop("disabled")) {
      rlId = parseInt($(element).text().replace(/k/, "000"));
    }
  });

  if ($(this).hasClass("first-click") === false) {
    $(this).addClass("first-click");
    $(this).text("ReStart");
  } else {
    $("#start-button").prop("disabled", true);
    // falseになるまで（前回のmainが終わるまで）待つ
    // TODO確実にfalseになるまで待つようにしたい
    await sleep(80);
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

$("#ranking-button").on("click", async function () {
  $("#ranking-button").prop("disabled", true);
  if ($("#start-button").hasClass("first-click") === true) {
    $("#start-button").removeClass("first-click");
  }
  $(".result-screen").fadeIn();
});
