const MyPromise = require("./my-final-promise");

const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    // resolve("p1");
    reject("e1");
  }, 300);
});
p1.name = "p1";
const p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("p2");
  }, 200);
});
p2.name = "p2";

/* 
测试成功
打印 
t2 e1
*/
/* p1.then(
  (data) => {
    console.log(data);
  },
  (e) => {
    // 这里执行
    console.log("t2", e);
  }
).catch((e) => {
  // 这里不执行
  console.log("catch", e);
}); */

// 测试成功
/* 
打印 
catch e1
c then c1
*/
/* p1.then((data) => {
  console.log(data);
})
  .catch((e) => {
    console.log("catch", e);
    return "c1";
  })
  .then((d) => {
    console.log("c then", d);
  }); */

/* p1.then((data) => {
  console.log(data);
})
  .catch((e) => {
    console.log("catch", e);
    return "c1";
  })
  .finally(() => {
    // 执行
    // 所以是不是把上面的promise直接返回了？
    console.log("finally");
  })
  .then((d) => {
    // 也执行
    console.log("c then", d);
  }); */

/* 
  这种情况下 进入 then FULFILLED 
  
  */
/* MyPromise.resolve("foo").then((d) => {
  console.log(d);
}); */
MyPromise.reject("err").then(null, (e) => {
  console.log(e);
});
// 发现catch的实现有问题，这种不能正常打印
MyPromise.reject("err").catch((e) => {
  console.log(e);
});
