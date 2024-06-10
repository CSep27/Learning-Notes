import Watcher from "./watcher.js";
export default function watch(vm, expOrFn, cb) {
  const watcher = new Watcher(vm, expOrFn, cb);
  // 暂没实现teardown
  return function unwatchFn() {
    watcher.teardown();
  };
}
