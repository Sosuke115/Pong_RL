import * as tf from "@tensorflow/tfjs";
import { buildNetwork, copyWeights } from "./model.js";


export class RLAgent {
  constructor(train = true) {
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
        batchNorm: false,
        dropout: 0.0,
        lr: 1.0e-4,
      },
    };

    this.qnet = buildNetwork(
      this.config.stateDim + 1, this.config.actionNum,
      this.config.model.hiddenDim, this.config.model.layerNum, this.config.model.dropout,
    );

    if (train) {
      this.qnetTarget = buildNetwork(
        this.config.stateDim + 1, this.config.actionNum,
        this.config.model.hiddenDim, this.config.model.layerNum, this.config.model.dropout,
      );
      this.qnetTarget.trainable = false
      copyWeights(this.qnetTarget, this.qnet);

      this.optimizer = tf.train.adam(this.config.model.lr);

      this.updateCount = 0;
    }
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
      const input = tf.concat([
        tf.tensor2d(batch.map(b => this.getInput(b.state, b.prevAction[0], "rl")), undefined, "float32"),
        tf.tensor2d(batch.map(b => this.getInput(b.state, b.prevAction[1], "human")), undefined, "float32"),
      ]);
      const nextInput = tf.concat([
        tf.tensor2d(batch.map(b => this.getInput(b.nextState, b.action[0], "rl")), undefined, "float32"),
        tf.tensor2d(batch.map(b => this.getInput(b.nextState, b.action[1], "human")), undefined, "float32"),
      ]);
      const action = tf.concat([
        tf.tensor1d(batch.map(b => b.action[0]), "int32"),
        tf.tensor1d(batch.map(b => 2 - b.action[1]), "int32"), // flip action
      ]);
      const reward = tf.concat([
        tf.tensor1d(batch.map(b => b.reward * 1), "float32"),
        tf.tensor1d(batch.map(b => b.reward * -1), "float32"),
      ]);
      const mask = tf.concat([
        tf.tensor1d(batch.map(b => !b.done), "float32"),
        tf.tensor1d(batch.map(b => !b.done), "float32"),
      ]);

      // calculate double DQN loss
      const q = this.qnet.apply(input, {training: true}).mul(tf.oneHot(action, this.config.actionNum)).sum(-1);
      const nextPi = this.qnet.predict(nextInput).argMax(-1);
      const nextPiOneHot = tf.oneHot(nextPi, this.config.actionNum)
      const nextTargetQ = this.qnetTarget.predict(nextInput).mul(nextPiOneHot).sum(-1);
      const y = reward.add(nextTargetQ.mul(mask).mul(this.config.gamma));
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
