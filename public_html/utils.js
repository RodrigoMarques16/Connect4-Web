function clamp(x, min, max) {
    return Math.max(min, Math.min(x, max));
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}