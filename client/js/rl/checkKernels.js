/*
    This code is to determine the tfjs kernels used in main.js
    Not used for production, training, or test
*/

import * as tf from "@tensorflow/tfjs";
import { RLAgent } from "./agents/rlAgent.js";


async function checkKernels() {
    const agent = new RLAgent();
    await agent.loadModel(`http://localhost:5000/models/model-0.json`)
    const dummyState = {
        ball: {x: 0, y: 0, forceX: 0, forceY: 0},
        rlPaddle: {x: 0},
        humanPaddle: {x: 0},
    };
    const action = agent.selectAction(dummyState, 1, "rl", false);
}


$("#start-button-rl").on("click", async () => {
    tf.setBackend('cpu');
    console.log(tf.getBackend());
    const result = await tf.profile(async() => {
        await checkKernels();
    });
    console.log("Profile results");
    console.log(result.kernelNames);
});
