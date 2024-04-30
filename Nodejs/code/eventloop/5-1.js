setTimeout(() => console.log(1));
setImmediate(() => console.log(2));

/* 
setTimeout(() => console.log(1));
实际等价于 setTimeout(() => console.log(1), 1);
即1ms之后执行setTimeout
在事件循环阶段
1. timer，如果到了1ms，打印1
2. check 执行setImmediate，打印2
最终结果为1，2

可能会出现
第一轮循环
1. timer，没到1ms
2. check 执行setImmediate，打印2

下一轮循环
1. timer，打印1
最终结果为2， 1

两种都有可能
*/
