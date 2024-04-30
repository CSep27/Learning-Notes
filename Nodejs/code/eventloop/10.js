async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}
async function async2() {
  console.log("async2");
}
console.log("script start");
setTimeout(function () {
  console.log("setTimeout0");
}, 0);
setTimeout(function () {
  console.log("setTimeout3");
}, 3);
setImmediate(() => console.log("setImmediate"));
process.nextTick(() => console.log("nextTick"));
async1();
new Promise(function (resolve) {
  console.log("promise1");
  resolve();
  console.log("promise2");
}).then(function () {
  console.log("promise3");
});
console.log("script end");

/* 
script start 打印
  setTimeout0 放入 timers队列
  setTimeout3 放入 timers队列
  setImmediate 放入check 队列
  nextTick 放入本轮微任务队列
async1 start 打印
async2 打印
  async1 end 放入本轮微任务队列
promise1
promise2
  promise3 放入本轮微任务队列
script end

检查微任务队列
nextTick
async1 end
promise3

事件循环
检查timers
setTimeout0 到时间
setTimeout3 如果到时间就打印

检查check队列
setImmediate 

setTimeout3和setImmediate的时间顺序不确定
*/
