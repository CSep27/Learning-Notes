const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    // resolve(x + "p1");
    reject("e1");
  }, 300);
});
p1.name = "p1";
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("p2");
  }, 200);
});
p2.name = "p2";

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

/* p1.then((data) => {
  console.log(data);
})
  .catch((e) => {
    console.log("catch", e);
    //
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
  .then((d) => {
    console.log("c then", d);
  }); */

/* 
catch e1
finally
c then c1
*/
p1.then((data) => {
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
  });
