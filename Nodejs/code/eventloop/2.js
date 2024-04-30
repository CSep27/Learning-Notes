const fs = require("fs");

let counter = 0;

fs.readFile("1.js", { encoding: "utf8" }, () => {
  console.log(`Inside I/O, counter = ${++counter}`);

  setImmediate(() => {
    console.log(`setImmediate 1 from I/O callback, counter = ${++counter}`);
  });

  setTimeout(() => {
    console.log(`setTimeout from I/O callback, counter = ${++counter}`);
  }, 0);

  setImmediate(() => {
    console.log(`setImmediate 2 from I/O callback, counter = ${++counter}`);
  });
});

console.log(`outside I/O, counter = ${++counter}`);

setImmediate(() => {
  console.log(`setImmediate 1 out, counter = ${++counter}`);
});

setTimeout(() => {
  console.log(`setTimeout out, counter = ${++counter}`);
}, 0);

setImmediate(() => {
  console.log(`setImmediate 2 out, counter = ${++counter}`);
});

Promise.resolve("Promise 1").then(console.log);
Promise.reject("Promise 2").catch(console.log);
queueMicrotask(() => console.log("queueMicrotask 1"));

process.nextTick(console.log, "nextTick 1");
