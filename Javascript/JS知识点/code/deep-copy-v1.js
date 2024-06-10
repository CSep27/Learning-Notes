/* 
1. 只拷贝普通对象和数组，无法拷贝函数等其他复杂类型
2. 循环引用可以继续保留
*/
const deepClone = (x) => {
  const isPlainObject = (x) => {
    return x !== null && typeof x === "object";
  };

  const wmap = new WeakMap();

  const copy = (x) => {
    if (!isPlainObject(x)) {
      return x;
    }
    let newObj;
    if (Array.isArray(x)) {
      newObj = [];
    } else {
      newObj = {};
    }
    // 将x作为键，新对象作为值，存储到WeakMap对象中
    wmap.set(x, newObj);
    for (const key in x) {
      const value = x[key];
      if (isPlainObject(value)) {
        // 此时这个value就是a对象 wmap中以a对象为键存储了 值为a的副本
        // 在复制时也用副本
        newObj[key] = wmap.has(value) ? wmap.get(value) : copy(value);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  };
  return copy(x);
};

const a = {
  name: "a",
};
const b = {
  name: "b",
  property: a,
};
a.property = b;
const c = deepClone(a);
c.name = "c";
/* 
a.property = b
b.property = a

<ref *1> {
  name: 'a',
  property: { name: 'b', property: [Circular *1] }
}

c是a的副本
c.property = b
b.property = c 如何保留这个引用
{ name: 'c', property: { name: 'b', property: null } }

*/
console.log(a);
console.log(c);
// console.log(JSON.stringify(c));
console.log(c.property.property); //

// const d = [a, 9, "d"];

// const e = deepClone(d);
// // e[0].name = "ea";
// e[2] = "e";
// console.log(d);
// console.log(e);

/* const f = function () {
  console.log("f");
};
f.name = "f";
const g = deepClone(f);
g.name = "g";
console.log(f.name);
console.log(g.name); */
