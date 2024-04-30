setTimeout(() => {
  console.log("setTimeout 1");

  Promise.resolve("Promise 1").then(console.log);
  Promise.reject("Promise 2").catch(console.log);
  queueMicrotask(() => console.log("queueMicrotask 1"));

  process.nextTick(console.log, "nextTick 1");
}, 0);

setTimeout(console.log, 0, "setTimeout 2");

setTimeout(console.log, 0, "setTimeout 3");

/* 
setTimeout 1
nextTick 1
Promise 1
Promise 2
queueMicrotask 1
setTimeout 2
setTimeout 3
*/
