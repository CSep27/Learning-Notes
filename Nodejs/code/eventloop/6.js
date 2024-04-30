const readline = require("readline");
setTimeout(() => console.log("第一轮的setTimeout"));
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("line", (data) => {
  console.log("line", data);
});
const fs = require("fs");
fs.readFile("1.js", () => {
  console.log("第一轮执行I/O callback，下面两行放入队列");
  setTimeout(() => console.log("第二轮 timer", 1));
  setImmediate(() => console.log("第一轮 check", 2));
});
console.log("同步代码");
process.nextTick(() => console.log("本轮的微任务"));

/* 全部打印完之后，不会结束，停留在那等用户输入 */
