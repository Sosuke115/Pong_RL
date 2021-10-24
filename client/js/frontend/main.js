import { GameScreen } from "./gameScreen.js";
import { Scorer } from "./scorer.js";
import { Timer } from "./timer.js";
import { AudioController} from "./audioController.js";
import { RankingManager } from "./rankingManager.js";
import { SleepTimeScheduler } from "./sleepTimeScheduler.js";
import { PongRLEnv } from "../rl/pongRLEnv.js";
import { KeyAgent } from "../rl/agents/keyAgent.js";
import { sleep } from "../utils.js";
import "../../scss/style.scss";

let worker;
let gameRunningState = 0; //0: pending, 1: trying to stop, 2: running
const initGameScreen = new InitGameScreen();
const rankingManager = new RankingManager();
const limitTime = 60;
const audioController = new AudioController();
let matchToken;

function InitGameScreen() {
  const gameScreen = new GameScreen();
  this.clear = () => {
    gameScreen.clearInsideCanvas();
    new Scorer().draw();
    new Timer(limitTime).draw();
  };
  this.draw = () => {
    gameScreen.draw(new PongRLEnv().reset());
    new Scorer().draw();
    new Timer(limitTime).draw();
  };
}

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

async function stopGame() {
  if ($.inArray(gameRunningState, [1, 2]) != -1) {
    gameRunningState = 1;
    while (gameRunningState == 1) await sleep(80);
  }
}

function getRlId() {
  let rlId = undefined;
  $(".rl-selection-button").each(function (index, element) {
    if ($(element).prop("disabled")) {
      rlId = parseInt($(element).text().replace(/k/, "000"));
    }
  });
  return rlId;
}

function registerGame(myScore, trainingStep, matchToken) {
  const url = "/api/register_game";
  let response;
  try {
    response = $.ajax({
      url: url,
      type: "POST",
      data: {
        token: matchToken,
        trainingStep: trainingStep,
        score: myScore,
      },
    });
    return response;
  } catch (error) {
    console.error(error);
  }
}

// main処理
async function main(rlId) {
  // 環境
  const env = new PongRLEnv();
  const InitState = env.reset();
  console.log(`Start  RL: "${rlId}"`);

  // load game screen
  const gameScreen = new GameScreen();
  const scorer = new Scorer();
  const timer = new Timer(limitTime);
  const sleepTimeScheduler = new SleepTimeScheduler();

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
  let interruptedFlag = false;

  gameScreen.draw(InitState);
  timer.draw();
  timer.start();
  await sleepTimeScheduler.reset();
  while (true) {
    // monitor running flag
    if ($.inArray(gameRunningState, [0, 1]) != -1 || timer.getRemTime() == 0) {
      if (gameRunningState === 1) {
        interruptedFlag = true;
      }
      gameRunningState = 0;
      break;
    }

    const res = env.step({
      humanAction: humanController.selectAction(),
      rlAction: rlController.selectAction(state, timeStep),
    });

    gameScreen.draw(res.state);
    timer.draw();

    if (res.done) {
      audioController.playGoalAudio(res.state.winner);
      await sleepTimeScheduler.end();
      timer.stop();

      state = env.reset();
      gameScreen.draw(state);
      scorer.stepAndDraw(res.state.winner);
      await sleepTimeScheduler.reset();
      timeStep = 0;
      timer.start();
    } else {
      audioController.playHitAudio(res.ballHitter);
      await sleepTimeScheduler.step();
      state = res.state;
      timeStep += 1;
    }
  }
  console.log("game end");
  gameScreen.clearInsideCanvas();
  if (interruptedFlag) {
    return null;
  } else {
    return scorer.getScore();
  }
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
  initGameScreen.draw();

  // load worker bundle in advance for better performance
  worker = new Worker("/public/worker.bundle.js");
});

// Process for rl selection button
$(".rl-selection-button").on("click", async function () {
  $(".rl-selection-button").prop("disabled", false);
  // color
  const buttonId = $(this).attr("id");
  $(".rl-selection-button").removeClass("pressed-buttons-color");
  $("#" + buttonId).addClass("pressed-buttons-color");
  $("#" + buttonId).prop("disabled", true);

  // draw ranking score
  rankingManager.draw(getRlId());

  if ($(".result-screen").is(":hidden")) {
    // wait until the game is over
    await stopGame();
    $("#game-button").prop("disabled", false);
    $("#game-button").click();
  }
});

// process for start button
$("#start-button").on("click", async function () {
  // reset ranking button
  $("#game-button").prop("disabled", true);
  $("#ranking-button").prop("disabled", false);
  $(".start-screen").fadeOut();

  const rlId = getRlId();
  matchToken = Math.random().toString(32).substring(2);

  // start game
  gameRunningState = 2;
  const myScore = await main(rlId);
  gameRunningState = 0;

  if (!(myScore === null)) {
    const registerInfo = await registerGame(myScore, rlId, matchToken);
    await rankingManager.updateUserInfo(myScore, rlId);
    const myRank = rankingManager.getMyRank(rlId);
    if (myRank <= rankingManager.size) {
      $(".popup").show();
      $(".input-nickname").focus();
    }
    $("#ranking-button").click();
  }
});

// process for game button
$("#game-button").on("click", async function () {
  $("#game-button").prop("disabled", true);
  $("#ranking-button").prop("disabled", false);
  $(".result-screen").fadeOut();
  // wait until the game is over
  await stopGame();
  // init game screen
  initGameScreen.draw();
  $(".start-screen").fadeIn();
});

// process for ranking button
$("#ranking-button").on("click", async function () {
  $("#ranking-button").prop("disabled", true);
  $("#game-button").prop("disabled", false);

  // wait until the game is over
  await stopGame();

  // update ranking info
  await rankingManager.updateRankingInfo();

  // clear game screen
  initGameScreen.clear();

  const rlId = getRlId();

  // draw ranking score
  rankingManager.draw(rlId);

  $(".start-screen").fadeOut();
  $(".result-screen").fadeIn();
});

//game and ranking button color
$("#game-button, #ranking-button").on("click", function () {
  $("#game-button, #ranking-button").removeClass("pressed-buttons-color");
  $(this).addClass("pressed-buttons-color");
});

// process for register button
$(".register-button").on("click", async function () {
  const url = "/api/update_name";
  const userName = $(".input-nickname").val();
  try {
    const response = await $.ajax({
      url: url,
      type: "POST",
      data: {
        token: matchToken,
        userName: userName,
      },
    });
  } catch (error) {
    console.error(error);
  }
  // update ranking info
  await rankingManager.updateRankingInfo();
  // draw ranking score
  rankingManager.draw(getRlId());
  $(".popup").hide();
});

// hide popup
$(document).click(function (event) {
  if (
    $(".popup").is(":visible") &&
    $(".result-screen").is(":visible") &&
    !$(event.target).closest(".popup-content").length
  ) {
    $(".popup").hide();
  }
});
