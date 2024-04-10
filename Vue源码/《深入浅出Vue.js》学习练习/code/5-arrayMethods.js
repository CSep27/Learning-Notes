import { arrayMethods } from "./array";

// __proto__ 是否可用
// const hasProto = '__proto__' in {};
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

export class Observer {
  constructor(value) {
    this.value = value;
    if (Array.isArray(value)) {
      // 修改
      const augment = hasProto ? protoAugment : copyAugment;
      augment(value, arrayMethods, arrayKeys);
    } else {
      this.walk(value);
    }
  }
}
function protoAugment(target, src, keys) {
  target.__proto__ = src;
}
function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i];
    def(target, key, src[key]);
  }
}
