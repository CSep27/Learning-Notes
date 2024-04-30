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
fs.readFile(
  "/Users/wangtiantian/Virtual Machines.localized/CentOS 7 64 位.vmwarevm",
  () => {
    console.log("第一轮执行I/O callback，下面两行放入队列");
    setTimeout(() => console.log("100ms后执行 timer", 1), 100);
    setImmediate(() => console.log("第一轮 check", 2));
  }
);
console.log("同步代码");
process.nextTick(() => console.log("本轮的微任务"));

/* 
读一个大文件
*/
