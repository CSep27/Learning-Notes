// 待整理成笔记
/* 
1. 子应用初始化时`const sandbox = new Sandbox()` 创建一个沙箱实例
1. 子应用mount加载时调用沙箱实例的`sandbox.active()`方法
2. active第一件事，记录window的初始状态，拍一个快照，放到 sandbox.windowSnapshot 上， 此时子应用还没往window上挂载属性
3. 初始状态保存完之后，子应用的mount函数中可以修改window了（放在active后）
4. 卸载子应用，执行 sandbox.inactive 方法。
比较被子应用修改后的window对象 和 sandbox.windowSnapshot 对象有哪些区别。
修改后的window对象记录到sanbox.modifyPropsMap上，将window的内容还原成和 sandbox.windowSnapshot 一样

注意：记录快照或者 diff快照的 对象 在方法执行时置为空对象
*/
/* 
初始状态 =》 记录快照 windowSnapshot
——————子应用挂载
        =》 第二次挂载 时 modifyPropsMap 有值，放到window上去
对window对象进行操作
——————子应用卸载
比较 window 和 windowSnapshot 将变化的部分存储到 modifyPropsMap
window还原为 windowSnapshot的状态

每个子应用有一个 sandbox 实例对象。
sandbox.modifyPropsMap 就会存储该子应用上对于window的修改。

active 函数
1. 记录快照 windowSnapshot
2. modifyPropsMap 有值，同步到window上去

inactive函数
1. 比较window和windowSnapshot的区别，将区别放到modifyPropsMap对象上
2. window对象还原为 windowSnapshot 的状态
*/

export default class SnapshotSandbox {
  // ES2022正式为class添加了私有属性，方法是在属性名之前使用#表示。
  // 子应用挂载前的 初始状态
  #windowSnapshot = {};
  // 记录变更状态
  #modifyPropsMap = {};
  constructor() {
    // this.#windowSnapshot = {};
    // this.#modifyPropsMap = {};
    this.sandboxRunning = false;
  }
  // 私有方法
  #iter(obj, callbackFn) {
    for (const prop in obj) {
      // hasOwnProperty() 方法返回一个布尔值，
      // 表示对象自有属性（而不是继承来的属性）中是否具有指定的属性。
      if (obj.hasOwnProperty(prop)) {
        callbackFn(prop);
      }
    }
  }
  active() {
    // windowSnapshot对象 先置为 一个空对象
    this.#windowSnapshot = {};
    // 1. 记录快照 windowSnapshot
    this.#iter(window, (prop) => {
      this.#windowSnapshot[prop] = window[prop];
    });

    // 2. modifyPropsMap 有值，同步到window上去
    Object.keys[this.#modifyPropsMap].forEach((prop) => {
      window[prop] = this.#modifyPropsMap[prop];
    });

    this.sandboxRunning = true;
  }
  inactive() {
    // modifyPropsMap对象 先置为 一个空对象
    this.#modifyPropsMap = {};
    this.#iter(window, (prop) => {
      // 1. 比较window和windowSnapshot的区别，将区别记录到modifyPropsMap对象上
      if (window[prop] !== this.#windowSnapshot[prop]) {
        this.#modifyPropsMap = window[prop];
        // 2. window对象还原为 windowSnapshot 的状态
        window[prop] = this.#windowSnapshot[prop];
      }
    });

    this.sandboxRunning = false;
  }
}
