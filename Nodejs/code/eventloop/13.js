const fs = require("fs");
const ITERATIONS_MAX = 2;
let iteration = 0;
const start = Date.now();
const msleep = (i) => {
  for (let index = 0; Date.now() - start < i; index++) {
    // do nonthing
  }
};
Promise.resolve().then(() => {
  // Microtask callback runs AFTER mainline, even though the code is here
  console.log("Promise.resolve.then", "MAINLINE MICROTASK");
});
console.log("START", "MAINLINE");
const timeout = setInterval(() => {
  console.log("START iteration " + iteration + ": setInterval", "TIMERS PHASE");
  if (iteration < ITERATIONS_MAX) {
    setTimeout(
      (iteration) => {
        Promise.resolve().then(() => {
          console.log(
            "setInterval.setTimeout.Promise.resolve.then",
            "TIMERS PHASE MICROTASK"
          );
        });
        console.log(
          "TIMER EXPIRED (from iteration " +
            iteration +
            "): setInterval.setTimeout",
          "TIMERS PHASE"
        );
      },
      0,
      iteration
    );
    fs.readdir(__dirname, (err, files) => {
      if (err) throw err;
      // console.log(`fs.readdir() callback: ${iteration}`)
      // 当前有多少文件内容
      console.log(
        "fs.readdir() callback: Directory contains: " + files.length + " files",
        "POLL PHASE"
      );
      queueMicrotask(() =>
        console.log(
          "setInterval.fs.readdir.queueMicrotask",
          "POLL PHASE MICROTASK"
        )
      );
      Promise.resolve().then(() => {
        console.log(
          "setInterval.fs.readdir.Promise.resolve.then",
          "POLL PHASE MICROTASK"
        );
      });
    });
    setImmediate(() => {
      Promise.resolve().then(() => {
        console.log(
          "setInterval.setImmediate.Promise.resolve.then",
          "CHECK PHASE MICROTASK"
        );
      });
      console.log("setInterval.setImmediate", "CHECK PHASE");
    });
    // msleep(1000); // 等待 I/O 完成
  } else {
    console.log("Max interval count exceeded. Goodbye.", "TIMERS PHASE");
    clearInterval(timeout);
  }
  console.log("END iteration " + iteration + ": setInterval", "TIMERS PHASE");
  iteration++;
}, 0);
console.log("END", "MAINLINE");
