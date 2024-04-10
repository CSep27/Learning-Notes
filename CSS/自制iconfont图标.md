## 自制图标

1. 打开[Iconfont 阿里巴巴矢量图标库](http://www.iconfont.cn/)
2. 点击右上角上传，将 SVG 格式的图标上传上去，**图标长宽需相等，内容物居中，距边缘距离适中**
3. 改名称和标签为有语义的英文，可选去除颜色提交
4. 批量添加到购物车，下载代码。
5. 下载的文件中有 demo，可根据兼容性需求选择不同的形式使用，demo 中有具体代码
6. 将.eot .svg .ttf .woff 四种格式文件放到 fonts 文件夹中
7. 下面例子是使用 unicode 引用来使用

```css
/*自定义字体*/
@font-face {
  font-family: "iconfont";
  src: url("../fonts/iconfont.eot"); /* IE9*/
  src: url("../fonts/iconfont.eot#iefix") format("embedded-opentype"), /* IE6-IE8 */
      url("../fonts/iconfont.woff") format("woff"),
    /* chrome, firefox */ url("../fonts/iconfont.ttf") format("truetype"), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
      url("../fonts/iconfont.svg#iconfont") format("svg"); /* iOS 4.1- */
}

.iconfont {
  font-family: "iconfont" !important;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
```
