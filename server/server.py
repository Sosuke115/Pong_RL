from flask import Flask, request, jsonify, make_response, session
import uuid

import utils


app = Flask(__name__)
app.secret_key = "abc123"  # necessary to use session


@app.route("/reset", methods=["GET"])
def reset():
    session["user_id"] = uuid.uuid4()
    env = utils.get_env(session["user_id"])

    state = env.reset()

    return make_response(jsonify({
        "state": utils.encode_frame(state),
    }))


@app.route("/step", methods=["POST"])
def step():
    print(session)
    env = utils.get_env(session["user_id"])
    action_str = request.form.get("action", "noop")

    action = utils.interpret_action(action_str)
    next_state, reward, done, _ =  env.step(action)

    return make_response(jsonify({
        "next_state": utils.encode_frame(next_state),
        "reward": reward,
        "done": done,
    }))


app.run(host="127.0.0.1", port=5000, debug=True)
