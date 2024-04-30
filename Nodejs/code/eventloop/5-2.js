setTimeout(() => console.log("第一轮的setTimeout"));

const fs = require("fs");
fs.readFile("1.js", () => {
  console.log("第一轮执行I/O callback，下面两行放入队列");
  setTimeout(() => console.log("第二轮 timer", 1));
  setImmediate(() => console.log("第一轮 check", 2));
});
console.log("同步代码");
process.nextTick(() => console.log("本轮的微任务"));

/* 
发出异步读取文件请求
第一轮
1. timer没有
2. 执行I/O callback，里面两行放入任务队列
3. 3和4阶段无，check阶段 执行setImmediate
4. 剩下无

第二轮
1. timer 执行setTimeout
*/
