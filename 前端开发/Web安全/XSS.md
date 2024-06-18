# Cross Site Scripting Prevention Cheat Sheet

[如何防范 XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

XSS 属于被动攻击

## 编码输出

### 对“HTML 属性上下文”做输出编码

使用引号包裹变量非常重要。

如果使用 JS 写 HTML 属性，使用 .setAttribute 和 [attribute]方法，因为他们会自动进行 HTML 属性编码

hardcoded 将信息固定地嵌入到软件程序中，以使用户无法轻易更改

对于 JSON，确保 Content-Type 是 application/json 而不是 text/html 来阻止 XSS

### CSS 上下文

变量只能被放在 CSS 属性值中，其他 CSS 上下文都是不安全的。

JS 操作 CSS：style.property = x，安全，自动编码

### URL 上下文

在 a 标签的 href 或 src 属性中添加 url，需要编码，遵循 HTML 属性编码规则

JS 操作：window.encodeURIComponent(x)

### 危险的上下文

```txt
<script>Directly in a script</script>
<!-- Inside an HTML comment -->
<style>Directly in CSS</style>
<div ToDefineAnAttribute=test />
<ToDefineATag href="/test" />
```

其他需要小心的区域包括：

- 回调函数
- 在 CSS 中处理 URL，比如`{ background-url : “javascript:alert(xss)”; }`
- 所有的 JS 时间处理(onclick(), onerror(), onmouseover())
- 不安全的 JS 方法：eval(), setInterval(), setTimeout()

不要把变量放到危险上下文中，即使已经进行了输出编码，输出编码无法完全防范 XSS

## HTML 净化

当用户需要写 HTML，开发者会让用户在一个所见即所得（WYSIWYG）的编辑器中修改内容的样式或者布局。这种情况下编码输出能阻止 XSS，但是也会破坏应用预期的效果。样式不会渲染，这种情况下，应该使用 HTML 净化。

HTML 净化会从变量中去掉危险的 HTML，返回一个安全的 HTML 字符串。推荐[DOMPurify](https://github.com/cure53/DOMPurify)

## 安全洼地 Safe Sinks

XSS 洼地就是变量在你页面中存在的地方。

XSS sinks are places where variables are placed into your webpage.

试着重构你的代码，移除像 innerHTML 这样指向不安全洼地的引用，改用 textContent 或者 value。

```js
elem.textContent = dangerVariable;
elem.insertAdjacentText(dangerVariable);
elem.className = dangerVariable;
elem.setAttribute(safeName, dangerVariable);
formfield.value = dangerVariable;
document.createTextNode(dangerVariable);
document.createElement(dangerVariable);
elem.innerHTML = DOMPurify.sanitize(dangerVar);
```

安全的 HTML 属性包括：align, alink, alt, bgcolor, border, cellpadding, cellspacing, class, color, cols, colspan, coords, dir, face, height, hspace, ismap, lang, marginheight, marginwidth, multiple, nohref, noresize, noshade, nowrap, ref, rel, rev, rows, rowspan, scrolling, shape, span, summary, tabindex, title, usemap, valign, value, vlink, vspace, width.

查看全面的列表，[DOMPurify allowlist](https://github.com/cure53/DOMPurify/blob/main/src/attrs.js)

## 其他手段

除了上述手段，考虑增加以下措施：

- cookie 属性 —— 改变 JS 和浏览器如何与 cookie 交互。可以限制 XSS 的影响，但是不能阻止有害内容的执行和处理漏洞的根本原因。
- 内容安全策略（CSP）——阻止内容被加载的列表。在实现中很容易出错，所以不应该成为主要的防御手段。是附加的防护。
- web 应用防火墙（WAF）—— 找到已知的攻击字符串然后阻止。WAF 是不可靠的并且新的绕开 WAF 的技术在频繁的出现。WAF 也不能处理漏洞的根本原因。另外，WAF 也不能解决在仅在客户端进行操作的这类 XSS 漏洞。WAF 不被推荐用于阻止 XSS，尤其是基于 DOM 的 XSS。

注：没完全看完
