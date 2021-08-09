import atexit
from multiprocessing import Lock
from multiprocessing.managers import BaseManager
import gym
import time


DURATION = 3600  # delete env if not accessed for 1 hour

envs = {}
lock = Lock()


def get_env(user_id, create=False):
    with lock:
        now = time.time()
        env = None
        if user_id in envs:
            env, _ = envs[user_id]
        elif create:
            env = gym.make("PongNoFrameskip-v4")

        if env is not None:
            envs[user_id] = (env, now)

        # delete old envs
        to_delete = []
        for user_id in envs:
            if now - envs[user_id][1] > DURATION:
                to_delete.append(user_id)

        for user_id in to_delete:
            del envs[user_id]

        # TODO: delete this
        print("# envs:", len(envs))
        # print(envs)
        return env


@atexit.register
def close_envs():
    for env, _ in envs.values():
        env.close()


manager = BaseManager(('', 37845), b'password')
manager.register('get_env', get_env)
server = manager.get_server()
server.serve_forever()
