let pausedAt = 0;
let pausedTime = 0;
let startTime
let countStartTime = 0;
let timeCount = 0;

export function start() {
    startTime = performance.now();
    pausedTime = 0;
}

export function end() {
    const end = performance.now();
    console.log(`exec tog ${end - startTime - pausedTime} ms`);
}

export function pause() {
    pausedAt = performance.now();
}

export function unpause() {
    pausedTime += performance.now() - pausedAt;
}

export function countStart() {
    countStartTime = performance.now();
}

export function countStop() {
    timeCount += performance.now() - countStartTime;
}

export function CountEnd() {
    console.log(`count ${timeCount} ms`);
    timeCount = 0;
}