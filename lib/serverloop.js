/**
Length of a tick in milliseconds. The denominator is your desired framerate.
e.g. 1000 / 20 = 20 fps,  1000 / 60 = 60 fps
*/
var desiredFPS = 20;
var tickLengthMs = 1000 / desiredFPS;

/* gameLoop related variables */
// timestamp of each loop
var previousTick = Date.now();
// number of times gameLoop gets called
var actualTicks = 0;

var gameLoop = function () {
  var now = Date.now();

  actualTicks++;
  if (previousTick + tickLengthMs <= now) {
    var delta = ((now - previousTick) / 1000) * desiredFPS;
    previousTick = now;

    tick(delta);

    // console.log('delta', delta, '(target: ' + tickLengthMs +' ms)', 'node ticks', actualTicks);
    actualTicks = 0;
  }

  if (Date.now() - previousTick < tickLengthMs - 16) {
    setTimeout(gameLoop);
  } else {
    setImmediate(gameLoop);
  }
}

var tick;
var container = {start: gameLoop};
exports.setUpdate = function(fnc) {
  tick = fnc;
  return container;
}
