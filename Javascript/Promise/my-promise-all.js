// 使用原生Promise实现myAll方法
const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    // resolve("p1");
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
/* Promise.all([p1, p2])
  .then((data) => {
    // 等所有的promise完成后进去
    // 顺序与传入数组的顺序一致
    console.log(data); // ['p1', 'p2']
  })
  .catch((err) => {
    console.error(err);
  }); */

Promise.myAll = function (promises) {
  const arr = new Array(promises.length);
  const np = new Promise((resolve, reject) => {
    let length = 0;
    promises.forEach((p, index) => {
      p.then(
        (data) => {
          arr[index] = data;
          length++;
          if (length === promises.length) {
            resolve(arr);
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  });
  return np;
};

Promise.myAll([p1, p2])
  .then((data) => {
    // 等所有的promise完成后进去
    // 顺序与传入数组的顺序一致
    console.log(data); // ['p1', 'p2']
  })
  .catch((err) => {
    // 如果有一个抛出错误，直接捕获错误
    console.error(err); // e1
  });
