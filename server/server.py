from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import uuid
import utils

app = Flask(__name__)
app.secret_key = "abc123"  # necessary to use session
CORS(app)


@app.route("/reset", methods=["GET"])
def reset():
    user_id = str(uuid.uuid4())

    env = utils.get_env(user_id, create=True)
    print("env (reset)", env, env is None, type(env))
    state = env.reset()

    response = make_response(jsonify({
        "user_id": user_id,
        "state": utils.encode_frame(state),
    }))


    return response

@app.route("/step", methods=["POST"])
def step():
    user_id = request.json.get("user_id", None)
    # user_id = session["user_id"]
    if user_id is None:
        return "user_id is necessary", 400

    env = utils.get_env(user_id)
    print("env", env, env is None, type(env))
    if not hasattr(env, "step"):
        return f"invalid user_id {user_id}", 400

    action_str = request.json.get("action", "noop")
    if action_str not in ["up", "down", "noop"]:
        return f"invalid action {action_str}", 400

    action = utils.interpret_action(action_str)
    next_state, reward, done, _ =  env.step(action)

    response = make_response(jsonify({
        "next_state": utils.encode_frame(next_state),
        "reward": reward,
        "done": done,
    }))


    return response




app.run(host="127.0.0.1", port=5000, debug=True)
