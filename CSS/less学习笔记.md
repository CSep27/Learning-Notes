学习资料地址：
- [less中文文档](https://less.bootcss.com/)

# 变量
- 以`@`符号开头

# 混合器
- 直接用类或者ID定义
- 使用`.classname()`

```
.bordered {
  border-top: dotted 1px black;
  border-bottom: solid 2px black;
}

#menu a {
  color: #111;
  .bordered();
}
```

# 命名空间和访问符

```
#bundle() {
  .button {
    display: block;
    border: 1px solid black;
    background-color: grey;
    &:hover {
      background-color: white;
    }
  }
  .tab { background-color: grey; }
}

#header a {
  color: orange;
  #bundle.button();  // 还可以书写为 #bundle > .button 形式
}

// css
#header a {
  color: orange;
  display: block;
  border: 1px solid black;
  background-color: grey;
}
#header a:hover {
  background-color: white;
}
```