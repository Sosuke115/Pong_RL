// 環境
export class PongRLEnv {
  constructor(options) {
    //固定値
    options = {
      paddleWidth: 0.15,
      canvasId: "gameCanvas",

      // How fast the paddles and the ball can move
      paddleSpeed: 1.25,
      ballInitSpeed: 2,
      ballSpeedIncrease: 0.05,
      ballSpeedMax: 3,
      ballSpinRate: 0.75,

      ...options,
    };
    Object.assign(this, options);

    // Keep track of the ball and two paddles.
    this.rlPaddleInitState = {
      x: 0.5,
      y: 0.04,
      height: 0.0375,
      width: this.paddleWidth,
      forceX: 0,
      previousAction: null,
      speed: this.paddleSpeed,
    };
    this.humanPaddleInitState = {
      x: 0.5,
      y: 0.96,
      height: 0.0375,
      width: this.paddleWidth,
      forceX: 0,
      previousAction: null,
      speed: this.paddleSpeed,
    };
    this.ballInitState = {
      x: 0.5,
      y: 0.5,
      height: 0.0375,
      width: 0.05,
      forceX: 0,
      forceY: 0,
      speed: this.ballInitSpeed,
    };
  }

  initBallDirection() {
    const forceX = 0.8 * (1 + Math.random() * 0.1);
    const forceY = 0.4 * (1 + Math.random() * 0.1);
    const norm = Math.sqrt(Math.pow(forceX, 2) + Math.pow(forceY, 2));
    this.ball.forceX = ((Math.random() > 0.5 ? 1 : -1) * forceX) / norm;
    this.ball.forceY = ((Math.random() > 0.5 ? 1 : -1) * forceY) / norm;
  }

  // Return the current state of the game.
  getState() {
    const state = {
      ball: {
        x: this.ball.x,
        y: this.ball.y,
        forceX: this.ball.forceX * this.ball.speed,
        forceY: this.ball.forceY * this.ball.speed,
        height: this.ball.height,
        width: this.ball.width,
      },
      rlPaddle: {
        x: this.rlPaddle.x,
        y: this.rlPaddle.y,
        height: this.rlPaddle.height,
        width: this.rlPaddle.width,
      },
      humanPaddle: {
        x: this.humanPaddle.x,
        y: this.humanPaddle.y,
        height: this.humanPaddle.height,
        width: this.humanPaddle.width,
      },
      winner: this.getWinner(),
    };
    return state;
  }

  // Checks if one side one won and returns 'rl' or 'human' if so.
  getWinner() {
    const ballHeight = this.ball.height / 2;
    const paddleHeight = this.rlPaddle.height / 2;

    if (
      this.ball.forceY < 0 &&
      this.ball.y - ballHeight < this.rlPaddle.y - paddleHeight
    ) {
      return "human";
    }
    if (
      this.ball.forceY > 0 &&
      this.ball.y + ballHeight > this.humanPaddle.y + paddleHeight
    ) {
      return "rl";
    }
  }

  // Move the given object by its force, checking for collisions and potentially
  // updating the force values. If the ball, returns whether it was hit by a paddle.
  moveObject(obj, isBall) {
    const radiusX = obj.width / 2;
    const minX = radiusX;
    const maxX = 1 - radiusX;
    const timeFactor = 0.01;
    let wasHit = false;

    // If a paddle is already touching the wall, forceX should set to zero:
    if (!isBall && obj.forceX) {
      if (
        (obj.x === minX && obj.forceX < 0) ||
        (obj.x === maxX && obj.forceX > 0)
      ) {
        obj.forceX = 0;
      }
    }

    if (obj.forceY) {
      obj.y += obj.forceY * obj.speed * timeFactor;

      // A ball should bounce off paddles
      const sideToCheck = obj.forceY > 0 ? "human" : "rl";
      if (isBall && this.checkCollision(sideToCheck)) {
        obj.forceY = -obj.forceY;
        wasHit = true;

        // Add a spin to it:
        const paddle = this[`${sideToCheck}Paddle`];
        if (paddle.forceX !== 0) {
          obj.forceX = obj.forceX * (1 - this.ballSpinRate) + paddle.forceX * this.ballSpinRate;
          // Make mean spins a little harder:
          if (Math.abs(obj.forceX) < 0.33) obj.forceX *= 2;
          // Re-normalize it:
          const norm = Math.sqrt(
            Math.pow(obj.forceX, 2) + Math.pow(obj.forceY, 2)
          );
          obj.forceX /= norm;
          obj.forceY /= norm;
        }
      }
    }

    if (obj.forceX) {
      obj.x += obj.forceX * obj.speed * timeFactor;

      // When hitting a wall, a paddle stops, a ball bounces back:
      if (!isBall) {
        obj.x = Math.max(minX, Math.min(maxX, obj.x));
      } else if (
        (obj.forceX < 0 && obj.x < radiusX) ||
        (obj.forceX > 0 && obj.x > 1 - radiusX)
      ) {
        obj.forceX = -obj.forceX;
      }
    }

    return wasHit;
  }

  // Check if the given side's paddle is colliding with the ball.
  // Pass 'rl' or 'human' (since the logic is slightly different)
  checkCollision(rlOrHuman) {
    const paddle = rlOrHuman === "rl" ? this.rlPaddle : this.humanPaddle;
    const ball = this.ball;

    const paddleWidth = paddle.width + 0.01;
    const paddleHeight = paddle.height;
    const ballWidth = ball.width;
    const ballHeight = ball.height;

    // First, check on the x dimension if a collision is possible:
    if (
      rlOrHuman === "rl" &&
      ball.y - ballHeight / 2 > paddle.y + paddleHeight / 2
    ) {
      // It's too far from the rl paddle
      return false;
    }
    if (
      rlOrHuman === "human" &&
      ball.y + ballHeight / 2 < paddle.y - paddleHeight / 2
    ) {
      // It's too far from the human paddle
      return false;
    }

    // Now check on the y dimension:
    if (ball.x - ballWidth / 2 > paddle.x + paddleWidth / 2) {
      // The top of the ball is below the bottom of the paddle
      return false;
    }
    if (ball.x + ballWidth / 2 < paddle.x - paddleWidth / 2) {
      // The bottom of the ball is above the top of the paddle
      return false;
    }

    // Check if its too far behind the paddle
    if (
      rlOrHuman === "rl" &&
      ball.y - ballHeight / 2 < paddle.y - paddleHeight / 2
    ) {
      // It's past the rl paddle
      return false;
    }
    if (
      rlOrHuman === "human" &&
      ball.y + ballHeight / 2 > paddle.y + paddleHeight / 2
    ) {
      // It's past the human paddle
      return false;
    }

    return true;
  }

  // reset
  reset() {
    this.rlPaddle = Object.create(this.rlPaddleInitState);
    this.humanPaddle = Object.create(this.humanPaddleInitState);
    this.ball = Object.create(this.ballInitState);
    this.initBallDirection();
    this.currentState = this.getState();
    this.previousState = null;
    this.currentFrame = 0;
    this.winner = null;
    return this.getState();
  }

  actionToForce(action) {
    if (action === 0) {
      return -1;
    } else if (action === 2) {
      return 1;
    } else {
      return 0;
    }
  }

  // step (action)
  // actionのe.g. {"rlAction": "noop", "humanAction": "right"}
  // return: 次の状態（ボールの位置など）、報酬、終了タグ
  step(action) {
    let reward = 0;
    let done = false;
    this.previousState = this.currentState;
    this.currentState = this.getState();

    // Check if match ended:
    const winner = this.currentState.winner;
    if (winner) {
      this.winner = winner;
      reward = winner === "rl" ? 1.0 : -1.0;
      done = true;
    }

    this.rlPaddle.forceX = this.actionToForce(action.rlAction);
    this.humanPaddle.forceX = this.actionToForce(action.humanAction);

    // Update each object:
    this.moveObject(this.rlPaddle, false);
    this.moveObject(this.humanPaddle, false);
    const ballWasHit = this.moveObject(this.ball, true);

    if (ballWasHit) {
      // Increase ball speed
      this.ball.speed = Math.min(
        this.ballSpeedMax,
        this.ball.speed + this.ballSpeedIncrease
      );
    }

    this.currentFrame += 1;

    return { state: this.getState(), reward: reward, done: done };
  }
}
