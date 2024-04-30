setTimeout(() => console.log("第一轮的setTimeout"));

const http = require("node:http");

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/users",
  method: "GET",
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding("utf8");
  res.on("data", (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on("end", () => {
    console.log("No more data in response.");
  });
});

req.on("error", (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();

const fs = require("fs");
fs.readFile("1.js", () => {
  console.log("第一轮执行I/O callback，下面两行放入队列");
  setTimeout(() => console.log("第一轮 timer", 1));
  setImmediate(() => console.log("第一轮 check", 2));
});
console.log("同步代码");
process.nextTick(() => console.log("本轮的微任务"));

/* 
第一次内部setTimeout没有设置delay，控制台打印：

同步代码
本轮的微任务
第一轮的setTimeout
第一轮执行I/O callback，下面两行放入队列
第一轮 check 2
第二轮 timer 1
STATUS: 200
HEADERS: {"x-powered-by":"Express","access-control-allow-origin":"*","content-type":"application/json; charset=utf-8","content-length":"10","etag":"W/\"a-MXmT2sdpWymGRqoZQBzQEoW/sQA\"","date":"Sat, 27 Apr 2024 09:09:29 GMT","connection":"keep-alive","keep-alive":"timeout=5"}
BODY: {"user":1}
No more data in response.
*/
