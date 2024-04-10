学习资料地址：

- [入门教程 基础详细入门指南](https://www.w3cschool.cn/ogwfsq/7pimoozt.html)
- [SASS 用法指南 用法速查](https://www.ruanyifeng.com/blog/2012/06/sass.html)
- [tutorialsteacher sass 完整 API 查询](https://www.tutorialsteacher.com/sass/sass-map-functions)
- [thoughtbot](https://thoughtbot.com/blog/sasss-content-directive)
- [sass 英文官方文档 可以搜索](https://sass-lang.com/documentation)

# 文件命名

- 局部文件使用\_开头命名，不会生成单独的 CSS 文件，只将文件导入到其他文件中使用

# 变量

- 变量以$开头
- `!default` 变量默认值

# 选择器

- 可以用 CSS 原生选择器
- 相邻兄弟选择器 +
- 通用兄弟选择器 ~

# 导入

- 原生 CSS 中@import 只有执行到@import 时，浏览器才会去下载其他 css 文件
- scss 中的@import 在生成 css 文件时就会导入

# 注释

- `// 这种注释内容不会出现在生成的css文件中`
- `/* 这种注释内容会出现在生成的css文件中 */`

# 混合器

- 实现大段样式的重用，用来描述一条 css 规则应用之后会产生怎样的效果
- 定义 `@mixin mixin-name {}`
- 使用 `.class-name { @include mixin-name; }`

## 何时使用混合器

1. 不停重复一段样式时，这段样式本身就是一个逻辑单元
2. 可以想到一个好的名字命名混合器

## 给混合器传参

- 像 function 一样

```
// 可以有默认值
@mixin link-colors(
   $normal,
   $hover: $normal,
   $visited: $normal
) {
  color: $normal;
  &:hover { color: $hover; }
  &:visited { color: $visited; }
}

// 使用时传参
a {
  @include link-colors(blue, red, green);
}

// 使用时写上参数名称，参数可以不按照顺序传入
a {
    @include link-colors(
      $normal: blue,
      $visited: green,
      $hover: red
  );
}
```

# 选择器继承

```
// 通过选择器继承继承样式
.error {
  border: 1px red;
  background-color: #fdd;
}
.seriousError {
  @extend .error;
  border-width: 3px;
}
```

- .seriousError 不仅会继承.error 自身的所有样式，任何跟.error 有关的组合选择器样式也会被.seriousError 以组合选择器的形式继承

```
// .seriousError从.error继承样式
.error a{  //应用到.seriousError a
  color: red;
  font-weight: 100;
}
h1.error { //应用到hl.seriousError
  font-size: 1.2rem;
}
```

## 何时使用继承

- 当一个元素类（.seriousError）表明它属于另一个类（.error）

## 使用继承的最佳实践

- 不要在 css 规则中使用后代选择器（比如.foo .bar）去继承 css 规则。如果你这么做，同时被继承的 css 规则有通过后代选择器修饰的样式，生成 css 中的选择器的数量很快就会失控：

```
.foo .bar { @extend .baz; }
.bip .baz { a: b; }
```

# 高级用法

## 条件语句

```
@if lightness($color) > 30% {
　　background-color: #000;
} @else {
　　background-color: #fff;
}
```

## 循环语句

```
　　@for $i from 1 to 10 {
　　　　.border-#{$i} {
　　　　　　border: #{$i}px solid blue;
　　　　}
　　}

　　$i: 6;

　　@while $i > 0 {
　　　　.item-#{$i} { width: 2em * $i; }
　　　　$i: $i - 2;
　　}

　　@each $member in a, b, c, d {
　　　　.#{$member} {
　　　　　　background-image: url("/image/#{$member}.jpg");
　　　　}
　　}
```

## 自定义函数

```
　　@function double($n) {
　　　　@return $n * 2;
　　}

　　#sidebar {
　　　　width: double(5px);
　　}
```

## 内置函数

### map-has-key

```
$colors: (
  primary: #BE0062,
  secondary: #D3A108,
  warning: #880000
);

.color-test {
  padding: 1em;
  // 如果$colors中有warning
  @if map-has-key($colors, warning) {
    // 取$colors中warning的值
    background: map-get($colors, warning);
  } @else {
    background: map-get($colors, secondary);
  }
}
```

### inspect

- `inspect($value)` Returns $value as it is represented by Sass. 返回由Sass表示的$value 值

```
@mixin res($key, $map: $--breakpoints) {
  // 循环断点Map，如果存在则返回
  @if map-has-key($map, $key) {
    @media only screen and #{inspect(map-get($map, $key))} {
      @content;
    }
  } @else {
    @warn "Undefeined points: `#{$map}`";
  }
}
```

## At-Rules

### @content

- 类似于插槽

```
@mixin apply-to-ie6-only {
  * html {
    @content
  }
}

@include apply-to-ie6-only {
  #logo {
    background-image: url(/logo.gif);
  }
}
```

### @warn

- 出错时打印错误

### @at-root

- https://www.sass.hk/skill/sass40.html
- 使用@at-root 内联选择器模式，编译出来的 CSS 无任何嵌套
- 在@at-root 的块嵌套中，只会影响最近的子选择器
- @at-root 和#{&}结合，BEM 格式命名

```
// scss
.block {
    color:red;

    @at-root #{&}__element{
        color:green;
    }

    @at-root #{&}--modifier {
        color:blue;
    }
}
// css
.block {
  color: red;
}
.block__element {
  color: green;
}
.block--modifier {
  color: blue;
}
```

#### @at-root 和 with 或 without

- 在@at-root 中无法自动移除默认的指令，如@media 或者@supports
- @at-root (without: ...)移除外面的任何指令。还可以通过空格用于移除多个指令，例如@at-root (without: media supports )

```
// scss
@media print {
    .page {
        width: 8in;
        @at-root (without: media) {
            width: 960px;
        }
    }
}

// css
@media print {
  .page {
    width: 8in;
  }
}
.page {
  width: 960px;
}
```

#### @at-root 结合 mixin 实现 BEM

```
//elements get appended with "__" and the $name
@mixin e($name) {
  @at-root   #{&}__#{$name} {
    @content;
  }
}

//modifiers get appended with "--" and the $name
@mixin m($name) {
  @at-root   #{&}--#{$name} {
    @content;
  }
}

.speech-bubble {
    color: purple;
    @include e(header) {
        color:orange;
    }
    @include e(text) {
        color:black;
        @include m(link){
            color:green;
        }
    }
}

.speech-bubble {
  color: purple;
}
.speech-bubble__header {
  color: orange;
}
.speech-bubble__text {
  color: black;
}
.speech-bubble__text--link {
   color: green;
}
```

# sass-loader

- [element-ui 文档](https://element.eleme.io/2.6/#/zh-CN/component/custom-theme)修改主题的示例代码中：

  ```scss
  /* 改变主题色变量 */
  $--color-primary: teal;

  /* 改变 icon 字体路径变量，必需 */
  // 这里必须要加~，否则会报路径错误，不加是在相对当前路径下找，自然找不到
  $--font-path: "~element-ui/lib/theme-chalk/fonts";

  // 这里试了不加~是可以正常的，应该也是loader支持，当做模块去找了
  // 在css文件里不加~会报错，会当做相对路径去找
  @import "~element-ui/packages/theme-chalk/src/index";
  ```

- 其中~是由 sass-loader 支持的功能，放在模块路径前是告诉 webpack 通过 node_modules 找路径
- 这个功能由于历史原因依然会支持，但是是一个 deprecated 弃用的功能
