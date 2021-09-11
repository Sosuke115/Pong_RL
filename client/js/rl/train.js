import { PongRLEnv } from "./pongRLEnv.js";
import { RLAgentTrain } from "./agents/rlAgentTrain.js";
import { ReplayMemory } from "./replayMemory.js";


async function main(options) {
  const config = {
    maxStep: 50000,
    memoryCapacity: 50000,
    batchSize: 128,
    checkpointFreq: 5000,
    ...options
  };

  const env = new PongRLEnv();
  const agent = new RLAgentTrain();
  const replayMemory = new ReplayMemory(config.memoryCapacity);

  const path = "model-0";
  console.log(`save ${path}`);
  await agent.saveModel(`downloads://${path}`);

  let totalStep = 0;
  let episode = 0;
  let episodeStep = 0;
  let episodeReward = 0;
  let lossMean = 0;
  let prevState = null;
  let state = env.reset();
  let prevRlAction = null;
  let prevHumanAction = null;

  while (true) {
    const rlAction = prevState ? agent.selectAction(prevState, prevRlAction, "rl", true) : 1;
    const humanAction = prevState ? agent.selectAction(prevState, prevHumanAction, "human", true) : 1;

    // frame skip
    let reward = 0;
    let done = false;
    let nextState = null;
    for (let i = 0; i < agent.config.frameSkip; i++) {
      const res = env.step({rlAction: rlAction, humanAction: humanAction});
      reward += res.reward;
      done ||= res.done;
      nextState = res.state;
      if (done) break;
    }
    if (prevState)
      replayMemory.push(prevState, [prevRlAction, prevHumanAction], [rlAction, humanAction], reward, done, state);

    if (replayMemory.size() >= config.batchSize) {
      // train model
      const batch = replayMemory.sample(config.batchSize);
      const loss = agent.updateParameters(batch);
      lossMean += (loss - lossMean) / (episodeStep + 1);
    }

    prevState = state;
    state = nextState;
    prevRlAction = rlAction;
    prevHumanAction = humanAction;
    totalStep += 1;
    episodeStep += 1;
    episodeReward += reward;

    if (totalStep % config.checkpointFreq === 0) {
      // save model
      const path = `model-${totalStep}`;
      console.log(`save ${path}`);
      await agent.saveModel(`downloads://${path}`);
    }

    if (totalStep >= config.maxStep) break;

    if (done) {
      episode += 1;

      // logging
      let log = `Episode ${episode}  step: ${episodeStep}  rlReward: ${episodeReward}`;
      if (agent.updateCount > 0) {
        log += `  loss: ${lossMean.toFixed(8)}  updateCount: ${agent.updateCount}`;
      }
      console.log(log);

      episodeStep = 0;
      episodeReward = 0;
      lossMean = 0;
      prevState = null;
      state = env.reset();
      prevRlAction = null;
      prevHumanAction = null;
    }
  }
}

$("#start-button").on("click", () => {
  const res = window.confirm("Is developer tool open?\nYou can see logs on the console window.");
  if (!res) return false;

  const options = {};
  const maxStep = $("#max-step").val();
  const memoryCapacity = $("#memory-capacity").val();
  const batchSize = $("#batch-size").val();
  const checkpointFreq = $("#checkpoint-freq").val();
  const criticStep = $("#critic-step").val();
  if (maxStep !== "") options["maxStep"] = maxStep;
  if (memoryCapacity !== "") options["memoryCapacity"] = memoryCapacity;
  if (batchSize !== "") options["batchSize"] = batchSize;
  if (checkpointFreq !== "") options["checkpointFreq"] = checkpointFreq;
  if (criticStep !== "") options["criticStep"] = criticStep;
  console.log("options:", options);

  console.log("Start training!");
  main(options).then(() => {
    console.log("Finish training!");
  });
});
