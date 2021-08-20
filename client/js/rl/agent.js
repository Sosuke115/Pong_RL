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
    this.config = {
      state_dim: 6,
      action_num: 3,
      gamma: 0.99,
      lr: 0.001,
      targetSyncFreq: 500,
      frameSkip: 4,
      epsilon: {
        init: 1.0,
        end: 0.01,
        decay: 10000,
      },
      model: {
        hiddenDim: 128,
        layerNum: 4,
      },
    };

    this.qnet = buildNetwork(
      this.config.state_dim,
      this.config.action_num,
      this.config.model.hiddenDim,
      this.config.model.layerNum,
    );

    if (train) {
      this.qnetTarget = buildNetwork(
        this.config.state_dim,
        this.config.action_num,
        this.config.model.hiddenDim,
        this.config.model.layerNum,
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
      if (side === "rl") {
        return action;
      } else {
        // flip action
        return 2 - action;
      }
    }
  }

  updateParameters(batch) {
    this.updateCount += 1;

    const lossFunction = () => tf.tidy(() => {
      // merge data from rl side and human side
      // const rlStateTensor = tf.tensor2d(batch.map(b => this.stateToArray(b.state, "rl")), undefined, "float32");
      // const humanStateTensor = tf.tensor2d(batch.map(b => this.stateToArray(b.state, "human")), undefined, "float32");
      const stateTensor = tf.concat([
        tf.tensor2d(batch.map(b => this.stateToArray(b.state, "rl")), undefined, "float32"),
        tf.tensor2d(batch.map(b => this.stateToArray(b.state, "human")), undefined, "float32"),
      ]);
      // const nextStateTensor = tf.tensor2d(batch.map(b => this.stateToArray(b.nextState)), undefined, "float32");
      const nextStateTensor = tf.concat([
        tf.tensor2d(batch.map(b => this.stateToArray(b.nextState, "rl")), undefined, "float32"),
        tf.tensor2d(batch.map(b => this.stateToArray(b.nextState, "human")), undefined, "float32"),
      ]);
      // const actionTensor = tf.tensor1d(batch.map(b => b.action), "int32");
      const actionTensor = tf.concat([
        tf.tensor1d(batch.map(b => b.action[0]), "int32"),
        tf.tensor1d(batch.map(b => 2 - b.action[1]), "int32"), // flip action
      ]);
      const rewardTensor = tf.concat([
        tf.tensor1d(batch.map(b => b.reward * 1), "float32"),
        tf.tensor1d(batch.map(b => b.reward * -1), "float32"),
      ]);
      const maskTensor = tf.concat([
        tf.tensor1d(batch.map(b => !b.done), "float32"),
        tf.tensor1d(batch.map(b => !b.done), "float32"),
      ]);

      // calculate double DQN loss
      const q = this.qnet.apply(stateTensor).mul(tf.oneHot(actionTensor, this.config.action_num)).sum(-1);
      const nextPi = this.qnet.predict(nextStateTensor).argMax(-1);
      const nextTargetQ = this.qnetTarget.predict(nextStateTensor).mul(tf.oneHot(nextPi, this.config.action_num)).sum(-1);
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
