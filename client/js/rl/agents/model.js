import * as tf from "@tensorflow/tfjs";


export function buildNetwork(inputDim, outputDim, hiddenDim, layerNum, batchNorm, dropout) {
  const model = tf.sequential();

  model.add(tf.layers.dense({units: hiddenDim, inputShape: [inputDim]}));
  if (batchNorm) model.add(tf.layers.batchNormalization());
  model.add(tf.layers.reLU());
  if (dropout > 0) model.add(tf.layers.dropout({rate: dropout}));

  for (let i = 0; i < layerNum - 2; i++) {
    model.add(tf.layers.dense({units: hiddenDim}));
    if (batchNorm) model.add(tf.layers.batchNormalization());
    model.add(tf.layers.reLU());
    if (dropout > 0) model.add(tf.layers.dropout({rate: dropout}));
  }

  model.add(tf.layers.dense({units: outputDim}));

  return model;
}


export function copyWeights(destNetwork, srcNetwork) {
  // https://github.com/tensorflow/tfjs/issues/1807:
  // Weight orders are inconsistent when the trainable attribute doesn't
  // match between two `LayersModel`s. The following is a workaround.
  // TODO(cais): Remove the workaround once the underlying issue is fixed.
  let originalDestNetworkTrainable;
  if (destNetwork.trainable !== srcNetwork.trainable) {
    originalDestNetworkTrainable = destNetwork.trainable;
    destNetwork.trainable = srcNetwork.trainable;
  }

  destNetwork.setWeights(srcNetwork.getWeights());

  // Weight orders are inconsistent when the trainable attribute doesn't
  // match between two `LayersModel`s. The following is a workaround.
  // TODO(cais): Remove the workaround once the underlying issue is fixed.
  // `originalDestNetworkTrainable` is null if and only if the `trainable`
  // properties of the two LayersModel instances are the same to begin
  // with, in which case nothing needs to be done below.
  if (originalDestNetworkTrainable != null) {
    destNetwork.trainable = originalDestNetworkTrainable;
  }
}
