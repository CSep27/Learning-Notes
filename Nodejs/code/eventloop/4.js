setImmediate(function () {
  console.log(1);
  process.nextTick(function () {
    console.log(2);
  });
});
process.nextTick(function () {
  console.log(3);
  setImmediate(function () {
    console.log(4);
  });
});

/* 
第一次
1. 第一个setImmediate放到宏任务队列
2. 执行process.nextTick 打印3，内部的setImmediate（第二个）放到宏任务队列中
3. 循环1-4阶段没有代码，第五check阶段执行，
4. 第一个setImmediate执行，打印1，内部的微任务执行，打印2
5. 第二个setImmediate执行，打印4

结果 3 1 2 4
*/
