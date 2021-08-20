import { PongRLEnv } from "./pongRLEnv.js";
import { RLAgent, RandomAgent } from "./agent.js";
import { ReplayMemory } from "./replay_memory.js";


async function main() {
  const config = {
    memoryCapacity: 10000,
    maxStep: 100000,
    batchSize: 128,
    checkpointFreq: 10000,
  };

  const env = new PongRLEnv();
  const agent = new RLAgent();
  // const agent2 = new RandomAgent();
  const replayMemory = new ReplayMemory(config.memoryCapacity);

  let totalStep = 0;
  let episode = 0;
  let episodeStep = 0;
  let episodeReward = 0;
  let lossMean = 0;
  let state = env.reset();

  while (true) {
    const rlAction = agent.selectAction(state, "rl", true);
    const humanAction = agent.selectAction(state, "human", true);

    // frame skip
    let reward = 0;
    let done = false;
    let nextState = undefined;
    for (let i = 0; i < agent.config.frameSkip; i++) {
      const res = env.step({rlAction: rlAction, humanAction: humanAction});
      reward += res.reward;
      done ||= res.done;
      nextState = res.state;
      if (done) break;
    }
    replayMemory.push(state, [rlAction, humanAction], reward, done, nextState);

    if (replayMemory.size() >= config.batchSize) {
      // train model
      const batch = replayMemory.sample(config.batchSize);
      const loss = agent.updateParameters(batch);
      lossMean += (loss - lossMean) / (episodeStep + 1);
    }

    state = nextState;
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
      state = env.reset();
    }
  }
}

$(document).ready(() => {
  console.log("Start training!");
  main().then(() => {
    console.log("Finish training!");
  });
});
