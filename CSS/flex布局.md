# flex

## flex-grow

当项目有剩余空间时，定义项目的放大比例。

默认为 0，即如果存在剩余空间，也不放大。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        display: flex;
        width: 500px;
        height: 50px;
      }
      /* 
      flex-grow 定义项目的放大比例，默认为 0，即如果存在剩余空间，也不放大。
      首先计算剩余空间
      总宽度500px，减去三个元素宽度剩余150px。
      flex-grow设置的是放大的比例
      按照flex-grow设置的比例，a放大150px的1/6，即25px，b和c依次类推
      最终宽度
      a 125px;
      b 200px;
      c 175px;      
      */
      .a {
        width: 100px;
        flex-grow: 1;
      }
      .b {
        width: 150px;
        flex-grow: 2;
      }
      .c {
        width: 100px;
        flex-grow: 3;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="a">A</div>
      <div class="b">B</div>
      <div class="c">C</div>
    </div>
  </body>
</html>
```

## flex-shrink

当项目空间不足时，定义了项目的缩小比例。

- 默认为 1，即如果空间不足，该项目将缩小至适应空间。
- 负值无效。

如下：子容器设置的宽度大于父容器，此时设置`flex-shrink: 1;`，会缩小至于父容器相同大小 100px。如果设置`flex-shrink: 0;`，则保留原来的 150px 大小。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        display: flex;
        width: 100px;
        height: 50px;
      }
      .a {
        width: 150px;
        flex-shrink: 1;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="a">A</div>
    </div>
  </body>
</html>
```

如果所有项目的 flex-shrink 属性都为 1，当空间不足时，都将等比例缩小。

如果一个项目的 flex-shrink 属性为 0，其他项目都为 1，则空间不足时，前者不缩小，其他项目等比例缩小。

## [flex-basis](https://developer.mozilla.org/zh-CN/docs/Web/CSS/flex-basis)

指定了 flex 元素在主轴方向上的初始大小。

如果不使用 box-sizing 改变盒模型的话，那么这个属性就决定了 flex 元素的内容盒（content-box）的尺寸。

### 取值

1. <'width'>

   - [<length>](https://developer.mozilla.org/zh-CN/docs/Web/CSS/length) 用于表示距离尺寸的 CSS 数据类型（px、rem、vh 等）
   - 一个相对于其父弹性盒容器主轴尺寸的百分数
   - 不能用负值
   - 默认为 auto

2. content：基于 flex 的元素的内容自动调整大小。示例：CSS/code/flex-basis.html

> 当一个元素同时被设置了 flex-basis (除值为 auto 外) 和 width (或者在 flex-direction: column 情况下设置了 height) , flex-basis 具有更高的优先级。

如下示例，同时设置 a 元素的 width 和 flex-basis，最终宽度为 50px。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        display: flex;
        width: 100px;
        height: 50px;
      }
      .a {
        width: 80px;
        flex-basis: 50px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="a">A</div>
    </div>
  </body>
</html>
```

## flex

是 flex-grow, flex-shrink 和 flex-basis 的简写。

默认值为 0 1 auto。后两个属性可选。表示有多余空间的话不放大，空间不够时会缩小。

示例 1：父元素减去 b 和 c 有剩余空间，但是 a 元素只会占据文本元素 A 需要的宽度大小，也就是有多余空间的话不放大。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        display: flex;
        width: 500px;
        height: 50px;
      }
      .a {
        flex: 0 1 auto;
      }
      .b {
        width: 150px;
      }
      .c {
        width: 100px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="a">A</div>
      <div class="b">B</div>
      <div class="c">C</div>
    </div>
  </body>
</html>
```

示例 2：a 元素宽度设置为 300px，总宽度超出了 500px，b 和 c 元素的 flex 默认值也为`flex: 0 1 auto;`，此时空间不够，flex-shrink 值为 1，那么会等比例缩小。也就是 a = 500 \* 300 / 550

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .container {
        display: flex;
        width: 500px;
        height: 50px;
      }
      .a {
        width: 300px;
        flex: 0 1 auto;
      }
      .b {
        width: 150px;
      }
      .c {
        width: 100px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="a">A</div>
      <div class="b">B</div>
      <div class="c">C</div>
    </div>
  </body>
</html>
```

两个快捷值：

- auto (1 1 auto) 随着空间大小变化，有剩余空间放大，没有就缩小
- none (0 0 auto) 不随着空间大小变化
