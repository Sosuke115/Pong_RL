import { RLAgent } from "./agents/rlAgent.js";

let agent = null;
let side = null;
let prevAction = 1;

onmessage = (message) => {
  if (message.data.command === "buildController") {
    agent = new RLAgent();
    agent.loadModel(`${message.data.origin}/public/models/model-${message.data.input}.json`)
      .then(() => {
        side = message.data.side;
        self.postMessage({
          error: null,
          config: agent.config,
        });
      })
      .catch((error) => {
        self.postMessage({
          error: error.toString(),
        });
      });
  } else if (message.data.command === "computeAction") {
    const action = agent.selectAction(message.data.state, prevAction, side, false);
    self.postMessage({action: action});
    prevAction = action;
  }
};
