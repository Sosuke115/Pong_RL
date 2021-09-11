import * as tf from "@tensorflow/tfjs";
import { RLAgent } from "./rlAgent.js";
import { buildNetwork, copyWeights } from "./model.js";


export class RLAgentTrain extends RLAgent {
  constructor() {
    super();

    this.qnet = buildNetwork(
      this.config.stateDim + 1, this.config.actionNum,
      this.config.model.hiddenDim, this.config.model.layerNum,
    );

    this.qnetTarget = buildNetwork(
      this.config.stateDim + 1, this.config.actionNum,
      this.config.model.hiddenDim, this.config.model.layerNum,
    );
    this.qnetTarget.trainable = false
    copyWeights(this.qnetTarget, this.qnet);

    this.optimizer = tf.train.adam(this.config.model.lr);

    this.updateCount = 0;
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
}
