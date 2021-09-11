import * as tf from "@tensorflow/tfjs";

export class RLAgent {
  constructor() {
    this.config = {
      stateDim: 6,
      actionNum: 3,
      gamma: 0.99,
      targetSyncFreq: 1000,
      frameSkip: 8,
      epsilon: {
        init: 1.0,
        end: 0.05,
        decay: 10000,
      },
      model: {
        hiddenDim: 256,
        layerNum: 4,
        lr: 1.0e-4,
      },
    };

    this.qnet = null;  // load afterwards
  }

  getInput(prevState, prevAction, side = "rl") {
    const ballX = prevState.ball.x * 2 - 1;
    const ballY = prevState.ball.y * 2 - 1;
    const ballForceX = prevState.ball.forceX;
    const ballForceY = prevState.ball.forceY;
    const rlX = prevState.rlPaddle.x * 2 - 1;
    const humanX = prevState.humanPaddle.x * 2 - 1;

    if (side === "rl") {
      return [ballX, ballY, ballForceX, ballForceY, rlX, humanX, prevAction - 1];
    } else {
      // flip position and force
      return [-ballX, -ballY, -ballForceX, -ballForceY, -humanX, -rlX, 1 - prevAction];
    }
  }

  selectAction(prevState, prevAction, side = "rl", explore = true) {
    let random = false;
    if (explore) {
      const stepRatio = Math.min(this.updateCount / this.config.epsilon.decay, 1.0)
      const epsilon = this.config.epsilon.init * (1-stepRatio) + this.config.epsilon.end * stepRatio;
      random = Math.random() < epsilon;
    }

    if (random) {
      // random action:
      const r = Math.random();
      if (r < 1/3) {
        return 0;
      } else if (r < 2/3) {
        return 1;
      } else {
        return 2;
      }
    } else {
      // greedy action
      const action = tf.tidy(() => {
        const stateTensor = tf.tensor2d(
          [this.getInput(prevState, prevAction, side)], undefined, "float32"
        );
        return tf.argMax(this.qnet.predict(stateTensor), -1).arraySync()[0];
      });
      if (side === "rl") {
        return action;
      } else {
        // flip action
        return 2 - action;
      }
    }
  }

  async loadModel(path) {
    this.qnet = await tf.loadLayersModel(path);
  }
}
