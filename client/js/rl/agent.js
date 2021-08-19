import { buildNetwork, copyWeights } from "./model.js";


export class RandomAgent {
  selectAction() {
    const r = Math.random();
    if (r < 1/3) {
      return -1;
    } else if (r < 2/3) {
      return 0;
    } else {
      return 1;
    }
  }
}


export class RLAgent {
  constructor(train = true) {
    const STATE_DIM = 6

    this.config = {
      gamma: 0.99,
      lr: 0.001,
      targetSyncFreq: 500,
      frameSkip: 4,
      epsilon: {
        init: 0.5,
        end: 0.05,
        decay: 2000,
      },
      model: {
        inputDim: STATE_DIM,
        hiddenDim: 256,
        layerNum: 4,
      },
    };

    this.qnet = buildNetwork(
      this.config.model.inputDim,
      this.config.model.hiddenDim,
      this.config.model.layerNum
    );

    if (train) {
      this.qnetTarget = buildNetwork(
        this.config.model.inputDim,
        this.config.model.hiddenDim,
        this.config.model.layerNum
      );
      this.qnetTarget.trainable = false
      copyWeights(this.qnetTarget, this.qnet);
      this.optimizer = tf.train.adam(this.config.lr);
  
      this.updateCount = 0;
    }
  }

  stateToArray(state, side = "rl") {
    const ballX = state.ball.x;
    const ballY = state.ball.y;
    const ballForceX = state.ball.forceX;
    const ballForceY = state.ball.forceY;
    const rlX = state.rlPaddle.x;
    const humanX = state.humanPaddle.x;

    if (side === "rl") {
      return [ballX, ballY, ballForceX, ballForceY, rlX, humanX];
    } else {
      // flip position and force
      return [1-ballX, 1-ballY, -ballForceX, -ballForceY, 1-humanX, 1-rlX];
    }
  }

  selectAction(state, side = "rl", explore = true) {
    // get epsilon for the current timestep
    const stepRatio = Math.min(this.updateCount / this.config.epsilon.decay, 1.0)
    const epsilon = this.config.epsilon.init * (1-stepRatio) + this.config.epsilon.end * stepRatio;

    if (explore && Math.random() < epsilon) {
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
        const stateArray = this.stateToArray(state, side);
        const stateTensor = tf.tensor2d([stateArray], undefined, "float32");
        return this.qnet.predict(stateTensor).argMax(-1).arraySync()[0];
      });
      return action;
    }
  }

  updateParameters(batch) {
    this.updateCount += 1;

    const lossFunction = () => tf.tidy(() => {
      // convert array to tensor
      const stateTensor = tf.tensor2d(batch.map(b => this.stateToArray(b.state)), undefined, "float32");
      const nextStateTensor = tf.tensor2d(batch.map(b => this.stateToArray(b.nextState)), undefined, "float32");
      const actionTensor = tf.tensor1d(batch.map(b => b.action), "int32");
      const rewardTensor = tf.tensor1d(batch.map(b => b.reward), "float32");
      const maskTensor = tf.tensor1d(batch.map(b => !b.done), "float32");

      // calculate double DQN loss
      const NUM_ACTION = 3
      const q = this.qnet.apply(stateTensor).mul(tf.oneHot(actionTensor, NUM_ACTION)).sum(-1);
      const nextPi = this.qnet.predict(nextStateTensor).argMax(-1);
      const nextTargetQ = this.qnetTarget.predict(nextStateTensor).mul(tf.oneHot(nextPi, NUM_ACTION)).sum(-1);
      const y = rewardTensor.add(nextTargetQ.mul(maskTensor).mul(this.config.gamma));
      return tf.losses.meanSquaredError(y, q);
    });

    const grads = tf.variableGrads(lossFunction);
    this.optimizer.applyGradients(grads.grads);
    const loss = grads.value.arraySync();
    tf.dispose(grads);

    if (this.updateCount % this.config.targetSyncFreq === 0) {
      copyWeights(this.qnetTarget, this.qnet);
    }

    return loss;
  }

  async saveModel(path) {
    await this.qnet.save(path);
  }

  async loadModel(path) {
    this.qnet = await tf.loadLayersModel(path);
  }
}
