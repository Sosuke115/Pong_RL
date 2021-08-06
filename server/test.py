import requests
import matplotlib.pyplot as plt
import base64
import numpy as np
import cv2


def decode_frame(jpg_base64):
    jpg_binary = base64.b64decode(jpg_base64)
    jpg_arr = np.frombuffer(jpg_binary, dtype=np.uint8)
    raw_arr = cv2.imdecode(jpg_arr, cv2.IMREAD_UNCHANGED)
    return raw_arr

ses = requests.Session()

response = ses.get("http://127.0.0.1:5000/reset")

# print(response.status_code)
data = response.json()
# print(data)
frame = decode_frame(data["state"])
plt.imshow(frame)
plt.title("reset")
plt.show()


response = ses.post("http://127.0.0.1:5000/step", data={"action": "up"})

print(response.status_code)
data = response.json()
# print(data)
frame = decode_frame(data["next_state"])
plt.imshow(frame)
plt.title("step")
plt.show()
