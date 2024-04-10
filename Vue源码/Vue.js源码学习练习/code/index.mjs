// import { initMixin } from "./init";

function MyVue(options) {
  this.options = options;

  // 拿到render
  this.options.render.call(this, createElement);
}

function createElement(tag, data, text) {
  const node = document.createElement(tag);
  const attr = document.createAttribute("id");
  attr.value = "app";
  node.setAttributeNode(attr);
  const textNode = document.createTextNode(text);
  node.appendChild(textNode);
  document.body.appendChild(node);
}

function proxy(target, sourceKey, key) {
  Object.defineProperty(target, key, {
    get() {
      return target;
    },
    set() {},
  });
}

MyVue.prototype.$mount = function () {
  console.log(this);
};
export default MyVue;
