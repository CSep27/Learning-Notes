## margin 的特殊现象

### margin 合并

如果两个 div 上下排序，给上面一个 div 设置 margin-bottom，给下面一个 div 设置 margin-top，那么两个 margin 会发生合并现象，合并以后的值为较大的那个。

### margin 塌陷

父子嵌套的元素垂直方向的 margin 取最大值。

常见解决方案：

1. 给大盒子加一个边框（可能不需要边框样式）
2. 给大盒子设置`overflow: auto;`
3. 给大盒子加浮动`float: left;`
4. 给大盒子添加`display: inline-block;`
5. 给大盒子添加`display: flow-root;`

...等

除了第一种方法都是形成[区块格式化上下文（BFC）](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_display/Block_formatting_context)（详细介绍了各种能形成 BFC 的方法），只要能形成 BFC，都可以解决[外边距重叠问题](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_box_model/Mastering_margin_collapsing)（这里说的更详细，各种情况都有）。

推荐使用`display: flow-root;`，可以创建无副作用的 BFC。添加该样式的元素中的所有内容都会参与 BFC，浮动的内容不会从底部溢出。其他的元素本身可能并不需要这个样式。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>margin塌陷</title>
    <style>
      #container {
        width: 100%;
        margin-top: 50px;
        /* border: 1px solid black; */
        /* overflow: auto; */
        /* float: left; */
        /* display: inline-block; */
        display: flow-root;
      }
      .tile {
        width: 25%;
        height: 100px;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div id="container">
      <!-- 如果这里有内容，不会出现塌陷 -->
      <!-- 父元素 -->
      <div class="tile">子盒子</div>
    </div>
  </body>
  <script></script>
</html>
```

## CSS 里的浏览器前缀

- Firefox:-moz-box-shadow
- Safari:-webkit-box-shadow
- Opera:-o-box-shadow
- IE:-ms-box-shadow

## 背景固定 内容滚动

```css
.kf-yyIntro {
  width: 100%;
  background: url("../../images/product/yyIntro/bg.jpg") no-repeat center top;
  min-height: 784px;
  /*固定背景 内容可以滚动*/
  background-attachment: fixed;
  position: relative;
}
```

## 文本超出显示省略号

- 单行文本
  - 如今所有浏览器都支持 text-overflow:ellipsis 方法，可以不写兼容

```
p {
    white-space:nowrap;
    text-overflow:ellipsis;
    -o-text-overflow:ellipsis;
    overflow:hidden;
}
```

- 多行文本
  - 只适用于现代浏览器，如 webkit 内核的浏览器，或者移动端
  - -webkit-line-clamp 是非标准属性

```css
div {
  display: -webkit-box;
  -webkit-line-clamp: 3; /*控制行数*/
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

[参考：张鑫旭的博客（直接看后面的新结论）](http://www.zhangxinxu.com/wordpress/2009/09/%E5%85%B3%E4%BA%8E%E6%96%87%E5%AD%97%E5%86%85%E5%AE%B9%E6%BA%A2%E5%87%BA%E7%94%A8%E7%82%B9%E7%82%B9%E7%82%B9-%E7%9C%81%E7%95%A5%E5%8F%B7%E8%A1%A8%E7%A4%BA/)

## 解决多行文本中数字和字母不自动换行

```css
p {
  overflow: hidden;
  word-break: break-all;
}
```

## 利用 CSS 制作小三角

- 底边 border 设置有颜色。相邻两边透明

```css
.triangle {
  border-right: 18px solid #fff;
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
}
```

## 透明度兼容到 IE6 及以上

- 注意，若要实现兼容，父元素为静态定位，子元素为相对定位

```html
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="utf-8">
    <title>背景透明，文字不透明</title>
    <style>
        *{
            padding: 0;
            margin: 0;
        }

        body{
            padding: 50px;
        }

        .demo{
            padding: 25px;
            background-color: rgba(0,0,0,0.5);/* IE9+、标准浏览器 */
        }
        .demo p{
            color: #FFFFFF;
        }
        @media \0screen\,screen\9 {/* 只支持IE6、7、8 */
            .demo{
                background-color:#000000;
                filter:Alpha(opacity=50);
                position:static; /* IE6、7、8只能设置position:static(默认属性) ，否则会导致子元素继承Alpha值 */
                *zoom:1; /* 激活IE6、7的haslayout属性，让它读懂Alpha */
            }
            .demo p{
                position: relative;/* 设置子元素为相对定位，可让子元素不继承Alpha值 */
            }
        }

    </style>
</head>
<body>

<div class="demo">
    <p>背景透明，文字不透明</p>
</div>

</html>
```

# CSS 实现宽度与高度相同

盒子宽度设置百分比，盒子的高度与宽度相同，是一个正方形。

## 使用伪元素实现

盒子宽度是父元素宽度的 25%，在盒子内部插入一个内容为空字符串的伪元素，display 设置为与盒子本身一致，再设置 padding-top 或者 padding-bottom 为 100%。

```css
.square {
  width: 25%;
  background-color: aqua;
}
.square::before {
  content: "";
  display: block;
  padding-top: 100%;
}
```

资料：https://www.zhihu.com/question/31753528

注意：子元素 和伪元素 display 要一致，否则会出现轻微的像素差别。在做布局题目时，将子元素 display 设置为 block，伪元素设置为 inline-block 时，出现了高度多了几像素。

[伪元素](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-elements)
[伪类](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Pseudo-classes)

[CSS 原生嵌套语法来了](https://zhuanlan.zhihu.com/p/603168988)
