from flask import Flask, request, jsonify, make_response, g, session
from multiprocessing.managers import BaseManager
import uuid
# import io
import base64
import cv2


app = Flask(__name__)

app.secret_key = "abc123"


def get_env(user_id):
    if not hasattr(g, "env"):
        manager = BaseManager(("", 37845), b"password")
        manager.register("get_env")
        manager.connect()
        g.env = manager.get_env(user_id)

    return g.env


def convert_frame(frame_np):
    # RGB (gym) -> BGR (opencv)
    _, jpg = cv2.imencode(".jpg", frame_np)
    jpg_bytes = jpg.tobytes()
    jpg_base64 = base64.b64encode(jpg_bytes).decode("utf-8")
    return jpg_base64


def interpret_action(action_str):
    if action_str == "up":
        return 2
    elif action_str == "down":
        return 3
    else:
        return 0


@app.route("/reset", methods=["GET"])
def reset():
    session["user_id"] = uuid.uuid4()
    env = get_env(session["user_id"])

    state = env.reset()

    return make_response(jsonify({
        "state": convert_frame(state),
    }))


@app.route("/step", methods=["POST"])
def step():
    print(session)
    env = get_env(session["user_id"])
    action_str = request.form.get("action", "noop")

    action = interpret_action(action_str)
    next_state, reward, done, _ =  env.step(action)

    return make_response(jsonify({
        "next_state": convert_frame(next_state),
        "reward": reward,
        "done": done,
    }))


app.run(host="127.0.0.1", port=5000, debug=True)
