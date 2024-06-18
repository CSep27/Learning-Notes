待整理

# 5. 内存控制

## process.memoryUsage()

返回描述 Node.js 进程的内存使用量（以字节为单位）的对象。

rss 是 resident set size 缩写，进程的常驻内存部分。进程的内存总共有几部分，一部分是 rss，其余部分在交换区（swap）或文件系统（filesystem）中。

> Linux 中 Swap（即：交换分区），类似于 Windows 的虚拟内存，就是当内存不足的时候，把一部分硬盘空间虚拟成内存使用，从而解决内存容量不足的情况。

> 在计算机中，文件系统（file system）是命名文件及放置文件的逻辑存储和恢复的系统。

```js
> process.memoryUsage()
{
  rss: 39477248,
  heapTotal: 6377472,
  heapUsed: 4628984,
  external: 1107739,
  arrayBuffers: 10426
}
```

## --max-old-space-size

设置 V8 旧内存部分的最大内存大小。

随着内存消耗接近极限，V8 会花更多的时间在垃圾回收上，以释放未使用的内存。

## --max-semi-space-size

以 MiB（兆字节）为单位设置 V8 的 清除垃圾收集器 的最大 semi-space 大小。增加半空间的最大尺寸可能会提高 Node.js 的吞吐量，但会消耗更多内存。

## 查看系统的内存占用

`os.totalmem()`返回系统总内存

`os.freemem()` 返回系统闲置内存

单位为字节
