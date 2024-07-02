function render() {
  with (this) {
    console.log(this);
    // this就是vm
    // with执行，_c => this._c => vm._c
    return _c("div", { staticClass: "box" }, []);
  }
}
const vm = {
  name: "vm",
};
const vnode = render.call(vm, vm._c);

vm._c = function (a, b, c, d) {
  console.log(a, b, c, d);
};
