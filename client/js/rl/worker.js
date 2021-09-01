import { RLAgent } from "./agents/rlAgent.js";

let agent = null;
let side = null;

onmessage = (message) => {
  if (message.data.command === "buildController") {
    agent = new RLAgent(false);
    agent.loadModel(`http://localhost:3000/js/rl/models/model-${message.data.input}.json`)
      .then(() => {
        side = message.data.side;
        self.postMessage({config: agent.config});
      });
  } else if (message.data.command === "computeAction") {
    const action = agent.selectAction(message.data.state, side, false);
    self.postMessage({action: action});
  }
};
