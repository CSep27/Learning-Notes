function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c(
    "div",
    { attrs: { id: "app" } },
    [
      _c(
        "nav",
        [
          _c("router-link", { attrs: { to: "/" } }, [_vm._v("Home")]),
          _vm._v(" | "),
          _c("router-link", { attrs: { to: "/about" } }, [_vm._v("About")]),
          _vm._v(" | "),
          _c("router-link", { attrs: { to: "/ele" } }, [_vm._v("ele")]),
          _vm._v(" | "),
          _c("router-link", { attrs: { to: "/update-children" } }, [
            _vm._v("update-children"),
          ]),
          _vm._v(" | "),
          _c("router-link", { attrs: { to: "/async-comp" } }, [
            _vm._v("async-comp"),
          ]),
          _vm._v(" | "),
          _c("router-link", { attrs: { to: "/table-element-ui" } }, [
            _vm._v("table-element-ui"),
          ]),
          _vm._v(" | "),
          _c("router-link", { attrs: { to: "/table-new-elementui-memo" } }, [
            _vm._v("table-new-elementui-memo"),
          ]),
          _vm._v(" | "),
          _c("router-link", { attrs: { to: "/keep-alive" } }, [
            _vm._v("keep-alive"),
          ]),
          _vm._v(" | "),
        ],
        1
      ),
      _c("router-view"),
    ],
    1
  );
}
