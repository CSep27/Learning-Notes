/* 
中序遍历：左子树、根节点、右子树
前、中、后序都是深度遍历，思路相同，只是放入结果数组的时机变了
*/

function getResult(arr, rootIndex) {
  let result = [];
  function recursion(arr, rootIndex) {
    let leftIndex = 2 * rootIndex + 1;
    let rightIndex = 2 * rootIndex + 2;
    let left = arr[leftIndex];
    let right = arr[rightIndex];
    if (left || right) {
      if (left) {
        recursion(arr, leftIndex);
      }
      result.push(arr[rootIndex]);
      if (right) {
        recursion(arr, rightIndex);
      }
    } else {
      result.push(arr[rootIndex]);
    }
  }
  recursion(arr, rootIndex);
  return result;
}
console.log(getResult([1, 2, 3, 4, 5, undefined, 6], 0));
// [ 4, 2, 5, 1, 3, 6 ]
