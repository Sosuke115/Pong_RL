from flask import g
from multiprocessing.managers import BaseManager
import base64
import cv2


def get_env(user_id, create=False):
    if not hasattr(g, "env"):
        print("not has attr")
        manager = BaseManager(("", 37845), b"password")
        manager.register("get_env")
        manager.connect()
        g.env = manager.get_env(user_id, create)
    else:
        print("has attr")

    return g.env


def encode_frame(frame_np):
    # TODO: resize?
    # frame_np = cv2.resize(frame_np, (80, 105), interpolation=cv2.INTER_AREA)
    # RGB (gym) -> BGR (opencv)
    _, jpg = cv2.imencode(".jpg", frame_np[:, :, ::-1])
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
