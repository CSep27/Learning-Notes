[微前端框架 qiankun 的沙箱方案解析](https://mp.weixin.qq.com/s?src=11&timestamp=1718762742&ver=5330&signature=Cuv5HoFaVjpyKWiG5HgnYi4PIAn85kyOv9vPr3tdM6qXytIm86yge8wbXDdKlMm-hIdA6DbFtxWEvgtiLF-cd4kWn*YVqGesZMLpFhaT6V8NMDl-O--GN50gAzsAf7JN&new=1)

# SnapshotSandbox 沙箱快照方案

优点：实现简单易懂，代码兼容性好。
不足：每次激活，卸载都要遍历 window，性能较差。只能支持加载一个子应用。

# legacySandbox 沙箱快照方案

1. 先学会 Proxy 用法
2. 再看实现
