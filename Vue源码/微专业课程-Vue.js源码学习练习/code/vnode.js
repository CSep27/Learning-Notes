class VNode {
  constructor(tag, data, children, text, elm) {
    /*当前节点的标签名*/
    this.tag = tag;
    /*当前节点的一些数据信息，比如props、attrs等数据*/
    this.data = data;
    /*当前节点的子节点，是一个数组*/
    this.children = children;
    /*当前节点的文本*/
    this.text = text;
    /*当前虚拟节点对应的真实dom节点*/
    this.elm = elm;
  }
}

function render() {
  return new VNode(
    "span",
    {
      /* 指令集合数组 */
      directives: [
        {
          /* v-show指令 */
          rawName: "v-show",
          expression: "isShow",
          name: "show",
          value: true,
        },
      ],
      /* 静态class */
      staticClass: "demo",
    },
    [new VNode(undefined, undefined, undefined, "This is a span.")]
  );
}

let html =
  '<div :class="c" class="demo" v-if="isShow"><span v-for="item in sz">{{item}}</span></div>';
const ast = {
  /* 标签属性的map，记录了标签上属性 */
  attrsMap: {
    ":class": "c",
    class: "demo",
    "v-if": "isShow",
  },
  /* 解析得到的:class */
  classBinding: "c",
  /* 标签属性v-if */
  if: "isShow",
  /* v-if的条件 */
  ifConditions: [
    {
      exp: "isShow",
    },
  ],
  /* 标签属性class */
  staticClass: "demo",
  /* 标签的tag */
  tag: "div",
  /* 子标签数组 */
  children: [
    {
      attrsMap: {
        "v-for": "item in sz",
      },
      /* for循环的参数 */
      alias: "item",
      /* for循环的对象 */
      for: "sz",
      /* for循环是否已经被处理的标记位 */
      forProcessed: true,
      tag: "span",
      children: [
        {
          /* 表达式，_s是一个转字符串的函数 */
          expression: "_s(item)",
          text: "{{item}}",
        },
      ],
    },
  ],
};
// 正则
const ncname = "[a-zA-Z_][\\w\\-\\.]*";
const singleAttrIdentifier = /([^\s"'<>/=]+)/;
const singleAttrAssign = /(?:=)/;
const singleAttrValues = [
  /"([^"]*)"+/.source,
  /'([^']*)'+/.source,
  /([^\s"'=<>`]+)/.source,
];
const attribute = new RegExp(
  "^\\s*" +
    singleAttrIdentifier.source +
    "(?:\\s*(" +
    singleAttrAssign.source +
    ")" +
    "\\s*(?:" +
    singleAttrValues.join("|") +
    "))?"
);

const qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
const startTagOpen = new RegExp("^<" + qnameCapture);
const startTagClose = /^\s*(\/?)>/;

const endTag = new RegExp("^<\\/" + qnameCapture + "[^>]*>");

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g;

const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;

// /^<((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)/
console.log(startTagOpen);

// const start = /^<((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)/;
let index = 0;
function advance(n) {
  index += n;
  html = html.substring(n);
}
function parseStartTag() {
  const start = html.match(startTagOpen);
  if (start) {
    const match = {
      tagName: start[1],
      attrs: [],
      start: index,
    };
    advance(start[0].length);

    let end, attr;
    // 通过正则解析html 给end和attr赋值
    // 判断如果非end attr有值
    // 放到match.attrs数组中，继续判断不是end，继续解析attr，直至遇到end
    while (
      !(end = html.match(startTagClose)) &&
      (attr = html.match(attribute))
    ) {
      advance(attr[0].length); // 继续删掉处理过的字符串
      match.attrs.push({
        name: attr[1], // attr的键
        value: attr[3], // attr的值
      });
    }
    if (end) {
      match.unarySlash = end[1]; // unary 一元
      advance(end[0].length);
      match.end = index; // 标记结束位置
      return match; // 返回结果
    }
  }
}
parseHTML(html);

function parseHTML() {
  const stack = [];
  let currentParent, root;
  while (html) {
    let textEnd = html.indexOf("<");
    if (textEnd === 0) {
      if (html.match(endTag)) {
        //...process end tag
        continue;
      }
      if (html.match(startTagOpen)) {
        //...process start tag
        // 调用parseStartTag 解析完起始标签后的结果
        const startTagMatch = parseStartTag();
        const element = {
          type: 1,
          tag: startTagMatch.tagName,
          lowerCasedTag: startTagMatch.tagName.toLowerCase(),
          attrsList: startTagMatch.attrs,
          attrsMap: makeAttrsMap(startTagMatch.attrs),
          parent: currentParent,
          children: [],
        };
        // root没有值，那么解析到的第一个标签就是root
        if (!root) {
          root = element;
        }
        // currentParent 有值 记录元素之间的父子层级关系
        if (currentParent) {
          currentParent.children.push(element);
        }
        // 依次将元素放到栈中
        // 下一个还是头标签或者文本就是成为当前节点的子节点，如果是结束标签就要把当前元素从栈中取出
        //
        stack.push(element);
        // 将当前元素置为currentParent，再接着往下解析时 就是当前元素的子元素
        currentParent = element;
        continue;
      }
    } else {
      //...process text
      continue;
    }
  }
}

// <div class="123" id="abc" :key="g">

/* 
^ 限定开头
< 匹配左侧<

后面整个在括号中
((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)

分为两部分
1. 括号中匹配0次或1次
(?:[a-zA-Z_][\w\-\.]*\:)?

2. ?: 表示不获取括号中的匹配结果
(?:[a-zA-Z_][\w\-\.]*\:)

3. 第一个字符是大小写字母或者_
4. 后面是 [字母、数字、下划线 - .] 大于等于0个
5. 冒号 ？？
[a-zA-Z_][\w\-\.]*\:

第二部分 
[a-zA-Z_][\w\-\.]*

*/
