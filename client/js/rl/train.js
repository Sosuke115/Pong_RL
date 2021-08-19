import { PongRLEnv } from "./pongRLEnv.js";
import { RLAgent, RandomAgent } from "./agent.js";
import { ReplayMemory } from "./replay_memory.js";


function runEpisode(env, agent1, agent2, replayMemory) {
  let state = env.reset();
  let episodeStep = 0;
  let episodeReward = 0;

  while (true) {
    const rlAction = agent1.selectAction(state, "rl", true);
    const humanAction = agent2.selectAction(state, "human", true);

    // frame skip
    let reward = 0;
    let done = false;
    let nextState = undefined;
    for (let i = 0; i < agent1.config.frameSkip; i++) {
      const res = env.step({
        rlAction: rlAction,
        humanAction: humanAction,
      });
      reward += res.reward;
      done ||= res.done;
      nextState = res.state;
      if (done) break;
    }
    replayMemory.push(state, rlAction, reward, done, nextState);

    state = nextState;
    episodeStep += 1;
    episodeReward += reward;

    if (done) break;
  }

  return [episodeStep, episodeReward];
}


async function main() {
  const config = {
    memoryCapacity: 10000,
    episodeNum: 1000,
    updatePerSample: 1.0,
    batchSize: 256,
    checkpointFreq: 50,
  };

  const env = new PongRLEnv();
  const agent1 = new RLAgent();
  const agent2 = new RandomAgent();
  const replayMemory = new ReplayMemory(config.memoryCapacity);

  for (let i = 0; i < config.episodeNum; i++) {
    const [episodeStep, episodeReward] = runEpisode(env, agent1, agent2, replayMemory);
    let log = `Episode ${i+1}  step: ${episodeStep}  rlReward: ${episodeReward}`;

    if (replayMemory.size() >= config.batchSize) {
      const updateNum = Math.floor(episodeStep * config.updatePerSample);
      let lossAll = [];
      for (let j = 0; j < updateNum; j++) {
        const batch = replayMemory.sample(config.batchSize);
        const loss = agent1.updateParameters(batch);
        lossAll.push(loss);
      }

      const lossMean = lossAll.reduce((a, b) => a + b, 0) / updateNum;
      log += `  loss: ${lossMean.toFixed(8)}  updateCount: ${agent1.updateCount}`;
    }

    console.log(log);

    if ((i+1) % config.checkpointFreq === 0) {
      const path = `model-${i+1}`;
      console.log(`save ${path}`);
      await agent1.saveModel(`downloads://${path}`);
    }
  }
}

$(document).ready(() => {
  console.log("start training!");
  main().then(() => {
    console.log("Finish training!");
  });
});
