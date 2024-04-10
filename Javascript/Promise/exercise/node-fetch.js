// 在时间窗口内，如果两次请求的Url是相同的，那么只会执行一个，并把结果给另一个
const fetch = require("node-fetch");

function hash(...args) {
  return args.join(",");
}

function window_it(f, time = 50) {
  let w = {};
  let flag = false;
  return (...args) => {
    return new Promise((resolve) => {
      if (!w[hash(args)]) {
        w[hash(args)] = {
          func: f,
          args,
          resolvers: [],
        };
      }
      if (!flag) {
        flag = true;
        setTimeout(() => {
          Object.keys(w).forEach((key) => {
            const { func, args, resolvers } = w[key];
            console.log("run once");
            func(...args)
              .then((resp) => resp.text())
              .then((text) => {
                resolvers.forEach((r) => {
                  console.log("result anywhere");
                  r(text);
                });
                flag = true;
                w = {};
              });
          });
        }, time);
      }
      w[hash(args)].resolvers.push(resolve);
    });
  };
}

const request = window_it(fetch, 20);
