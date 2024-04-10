/* template模板编译 */
/* 
节点类型
1 ELEMENT_NODE 元素节点
2 ATTRIBUTE_NODE 属性节点
3 TEXT_NODE 文本节点
*/

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

const stack = [];
let currentParent, root;

let index = 0;

// 用来删除已解析的部分，逐渐减小html长度
function advance(n) {
  index += n;
  html = html.substring(n);
}

function makeAttrsMap(attrs) {
  const map = {};
  for (let i = 0, l = attrs.length; i < l; i++) {
    map[attrs[i].name] = attrs[i].value;
  }
  return map;
}
// 解析起始标签
function parseStartTag() {
  const start = html.match(startTagOpen);
  // 第一次 start 匹配结果 数组 ['<div', 'div'] 起始div标签
  if (start) {
    // match记录起始标签的信息
    // 需要继续解析后面的内容，是当前标签上的属性
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
      advance(attr[0].length);
      match.attrs.push({
        name: attr[1],
        value: attr[3],
      });
    }
    // 遇到了end，起始标签解析结束
    if (end) {
      match.unarySlash = end[1];
      advance(end[0].length);
      match.end = index; // 标记结束位置
      // 返回起始标签解析完后的对象，记录了起始标签的所有相关信息
      return match;
    }
  }
}

function parseEndTag(tagName) {
  let pos;
  // 从后往前处理
  for (pos = stack.length - 1; pos >= 0; pos--) {
    if (stack[pos].lowerCasedTag === tagName.toLowerCase()) {
      break;
    }
  }

  if (pos >= 0) {
    if (pos > 0) {
      // 匹配元素下标大于0，那么上一个元素是当前元素的父元素
      currentParent = stack[pos - 1];
    } else {
      // 匹配元素下标为0，那么是根元素
      currentParent = null;
    }
    // 弹出栈顶的元素
    stack.length = pos;
  }
}
// 解析文本 {{item}} => '_s(item)'
function parseText(text) {
  // 判断是不是{{}}这种形式
  if (!defaultTagRE.test(text)) return;

  const tokens = [];
  // 开始下一个匹配的起始索引值。
  let lastIndex = (defaultTagRE.lastIndex = 0);
  let match, index;
  // 循环解析有多个{{}}的情况
  while ((match = defaultTagRE.exec(text))) {
    index = match.index;

    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)));
    }

    const exp = match[1].trim();
    tokens.push(`_s(${exp})`);
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push(JSON.stringify(text.slice(lastIndex)));
  }
  return tokens.join("+");
}
// 删除v-if v-for这种attr
// 返回attr对应的值 v-if 值 isShow
function getAndRemoveAttr(el, name) {
  let val;
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList;
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break;
      }
    }
  }
  return val;
}

function processFor(el) {
  let exp; // v-for对应的值 'item in sz'
  if ((exp = getAndRemoveAttr(el, "v-for"))) {
    // 通过正则拿到inMatch ["item in sz","item","sz"]
    const inMatch = exp.match(forAliasRE);
    // for 是 sz
    el.for = inMatch[2].trim();
    // alias 是 item
    el.alias = inMatch[1].trim();
  }
}

function processIf(el) {
  const exp = getAndRemoveAttr(el, "v-if");
  if (exp) {
    // 给元素添加if属性，值就是v-if对应的isShow
    el.if = exp;
    // ifConditions数组用来记录和v-if相关的条件，可能不止一个
    // 根据这个条件数组最终判断当前元素显示与否
    if (!el.ifConditions) {
      el.ifConditions = [];
    }
    el.ifConditions.push({
      exp: exp,
      block: el,
    });
  }
}
// 解析html，通过正则不断解析html字符串的内容，每次删除掉已经解析的部分，html长度逐渐变小，直至为0，循环结束
function parseHTML() {
  while (html) {
    let textEnd = html.indexOf("<");
    // 如果 < 在当前字符串的起始位置，有两种情况
    // <div> </div> 一般有起始标签和闭合标签
    // <br> 这种单标签 没有闭合标签，并且有两种写法 <br/>
    if (textEnd === 0) {
      // 第二种，是碰到了结束标签
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        // 碰到结束标签了，需要将栈中最近的匹配的元素取出
        parseEndTag(endTagMatch[1]);
        continue;
      }
      // 第一种，碰到了起始标签
      if (html.match(startTagOpen)) {
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

        processIf(element);
        processFor(element);
        // 如果root没值，那么当前标签就是根标签
        if (!root) {
          root = element;
        }
        // 记录父级元素
        if (currentParent) {
          currentParent.children.push(element);
        }
        // 判断是不是自闭合标签？
        // unarySlash是空的时候进去
        // stack用来记录层级关系
        if (!startTagMatch.unarySlash) {
          stack.push(element);
          // 当前元素赋值给currentParent
          // 用于后续解析子元素时建立父子关系
          currentParent = element;
        }
        continue;
      }
    } else {
      // 不是以< 开头的 就是标签里面的文本了
      // text 就是文本内容了 textEnd表示下一个<的位置
      text = html.substring(0, textEnd);
      advance(textEnd);
      // 文本可能是用{{}}差值包装的，那么就需要解析一下内容
      let expression;
      if ((expression = parseText(text))) {
        currentParent.children.push({
          type: 2,
          text,
          expression,
        });
      } else {
        currentParent.children.push({
          type: 3,
          text,
        });
      }
      continue;
    }
  }
  // 解析完返回根元素，根元素的children里存放了所有子元素信息
  return root;
}

function parse() {
  return parseHTML();
}

function optimize(rootAst) {
  // 判断是否静态节点
  // 文本节点时静态节点
  function isStatic(node) {
    if (node.type === 2) {
      return false;
    }
    if (node.type === 3) {
      return true;
    }
    return !node.if && !node.for;
  }
  // 标记静态节点，如果子节点是非静态节点，那么当前节点也是非静态节点。
  function markStatic(node) {
    node.static = isStatic(node);
    if (node.type === 1) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        const child = node.children[i];
        markStatic(child);
        if (!child.static) {
          node.static = false;
        }
      }
    }
  }

  // 标记静态根节点
  // 如果当前节点是静态节点，同时满足该节点并不是只有一个文本节点左右子节点（作者认为这种情况的优化消耗会大于收益）时，标记 staticRoot 为 true，否则为 false。
  function markStaticRoots(node) {
    if (node.type === 1) {
      if (
        node.static &&
        node.children.length &&
        !(node.children.length === 1 && node.children[0].type === 3)
      ) {
        node.staticRoot = true;
        return;
      } else {
        node.staticRoot = false;
      }
    }
  }

  markStatic(rootAst);
  markStaticRoots(rootAst);
}

function generate(rootAst) {
  function genIf(el) {
    // ifProcessed 标记是在if解析过程中
    el.ifProcessed = true;
    // 如果el.ifConditions.length是0
    if (!el.ifConditions.length) {
      return "_e()";
    }
    // length不为0
    // 返回 `isShow ? genElement() : _e()`
    return `(${el.ifConditions[0].exp})?${genElement(
      el.ifConditions[0].block
    )}: _e()`;
  }

  function genFor(el) {
    el.forProcessed = true;

    const exp = el.for; // sz
    const alias = el.alias; // item
    const iterator1 = el.iterator1 ? `,${el.iterator1}` : "";
    const iterator2 = el.iterator2 ? `,${el.iterator2}` : "";

    return (
      `_l((${exp}),` +
      `function(${alias}${iterator1}${iterator2}){` +
      `return ${genElement(el)}` +
      "})"
    );
  }

  function genText(el) {
    return `_v(${el.expression})`;
  }

  function genNode(el) {
    if (el.type === 1) {
      return genElement(el);
    } else {
      return genText(el);
    }
  }

  function genChildren(el) {
    const children = el.children;

    if (children && children.length > 0) {
      return `${children.map(genNode).join(",")}`;
    }
  }

  function genElement(el) {
    if (el.if && !el.ifProcessed) {
      return genIf(el);
    } else if (el.for && !el.forProcessed) {
      return genFor(el);
    } else {
      const children = genChildren(el);
      let code;
      code = `_c('${el.tag},'{
                staticClass: ${el.attrsMap && el.attrsMap[":class"]},
                class: ${el.attrsMap && el.attrsMap["class"]},
            }${children ? `,${children}` : ""})`;
      return code;
    }
  }

  const code = rootAst ? genElement(rootAst) : '_c("div")';
  return {
    render: `with(this){return ${code}}`,
  };
}

//
var html =
  '<div :class="c" class="demo" v-if="isShow"><span v-for="item in sz">{{item}}</span></div>';

// parse 使用正则解析生成AST
const ast = parse();
// 标记静态节点，优化后续Patch过程
optimize(ast);
const code = generate(ast);
