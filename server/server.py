from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import uuid
import utils
# from datetime import timedelta
# from functools import update_wrapper
# from flask_session import Session

app = Flask(__name__)
app.secret_key = "abc123"  # necessary to use session
# SESSION_TYPE = 'filesystem'
# app.config.from_object(__name__)
# Session(app)
# CORS(app, supports_credentials=True)
# CORS(app, origins=["http://localhost:3000"], headers=['Content-Type'], expose_headers=['Access-Control-Allow-Origin'], supports_credentials=True)
# app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}})

# config = {
#   'ORIGINS': [
#     'http://localhost:3000',  # React
#     'http://127.0.0.1:3000',  # React
#   ],

#   'SECRET_KEY': 'abc123'
# }

# CORS(app, resources={ r'/*': {'origins': config['ORIGINS']}}, supports_credentials=True)

# cors = CORS(app, support_credentials=True)
# app.config['CORS_HEADERS'] = 'Content-Type'

# @app.after_request
# def after_request(response):
#   response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
# #   response.headers.add('Access-Control-Allow-Origin', '*')
#   response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,Accept,X-Requested-With')
#   response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#   response.headers.add('Access-Control-Allow-Credentials', 'true')
# #   response.headers['Access-Control-Allow-Credentials'] = 'true'
# #   print(response.headers)
#   return response


# @cross_origin(supports_credentials=True)
@app.route("/reset", methods=["GET"])
def reset():
    # session.permanent = True
    # app.permanent_session_lifetime = timedelta(minutes=30)
    user_id = str(uuid.uuid4())

    env = utils.get_env(user_id, create=True)
    print("env (reset)", env, env is None, type(env))
    state = env.reset()
    # session["user_id"] = user_id
    # print(session)

    response = make_response(jsonify({
        "user_id": user_id,
        "state": utils.encode_frame(state),
    }))
    # response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    # #   response.headers.add('Access-Control-Allow-Origin', '*')
    # response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,Accept')
    # response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    # response.headers.add('Access-Control-Allow-Credentials', 'true')

    return response

# @cross_origin(origin='localhost',headers=['Content- Type','Authorization'], supports_credentials=True)  # ■■■ この行すべて
# @cross_origin(supports_credentials=True)


# @app.route("/step", methods=["POST"])
# @cross_origin(supports_credentials=True)
@app.route("/step", methods=["POST"])
def step():
    # print(session)
    # print(utils.get_env(session["user_id"]))
    # return make_response(jsonify({
    #     "next_state": None,
    # }))
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
    # response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    # #   response.headers.add('Access-Control-Allow-Origin', '*')
    # response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin,Accept')
    # response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    # response.headers.add('Access-Control-Allow-Credentials', 'true')


    return response




app.run(host="127.0.0.1", port=5000, debug=True)
# app.run(host="localhost", port=5000, debug=True)
