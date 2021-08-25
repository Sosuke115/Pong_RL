export function sleep(msec) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(msec, 0)));
}
