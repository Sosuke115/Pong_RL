import atexit
from multiprocessing import Lock
from multiprocessing.managers import BaseManager
import gym
import time


DURATION = 3600  # delete env if not accessed for 1 hour

envs = {}
lock = Lock()


def get_env(user_id):
    with lock:
        now = time.time()
        if user_id in envs:
            env, _ = envs[user_id]
        else:
            env = gym.make("PongNoFrameskip-v4")

        envs[user_id] = (env, now)

        to_delete = []
        for user_id in envs:
            if now - envs[user_id][1] > DURATION:
                to_delete.append(user_id)

        for user_id in to_delete:
            del envs[user_id]

        print("# envs:", len(envs))
        return env


@atexit.register
def close_envs():
    for connection in envs.values():
        connection.close()


manager = BaseManager(('', 37845), b'password')
manager.register('get_env', get_env)
server = manager.get_server()
server.serve_forever()
