export function sleep(msec) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(msec, 0)));
}

export function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
