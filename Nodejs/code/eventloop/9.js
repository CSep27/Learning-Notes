setImmediate(function () {
  console.log("setImmediate");
  setImmediate(function () {
    console.log("嵌套setImmediate");
  });
  process.nextTick(function () {
    console.log("nextTick");
  });
});

/* 
setImmediate
nextTick
嵌套setImmediate
*/
