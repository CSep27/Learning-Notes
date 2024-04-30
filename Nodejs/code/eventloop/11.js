const fs = require("fs");

/* TODO: 阻塞 I/O 情况 */
process.nextTick(() => {
  const now = +new Date();
  /* 阻塞代码三秒钟 */
  while (+new Date() < now + 3000) {}
});

fs.readFile("./1.js", () => {
  console.log("I/O: file ");
});

setTimeout(() => {
  console.log("setTimeout: ");
}, 0);
