from flask import g
from multiprocessing.managers import BaseManager
import base64
import cv2


def get_env(user_id):
    if not hasattr(g, "env"):
        manager = BaseManager(("", 37845), b"password")
        manager.register("get_env")
        manager.connect()
        g.env = manager.get_env(user_id)

    return g.env


def encode_frame(frame_np):
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
