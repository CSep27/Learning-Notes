/* 
前序遍历：根节点、左子树、右子树
前、中、后序都是深度遍历，思路相同，只是放入结果数组的时机变了
*/

function getResult(arr, rootIndex) {
  let result = [];
  function recursion(arr, rootIndex) {
    result.push(arr[rootIndex]);
    let leftIndex = 2 * rootIndex + 1;
    if (arr[leftIndex]) {
      recursion(arr, leftIndex);
    }
    let rightIndex = 2 * rootIndex + 2;
    if (arr[rightIndex]) {
      recursion(arr, rightIndex);
    }
  }
  recursion(arr, rootIndex);
  return result;
}
console.log(getResult([1, 2, 3, 4, 5, undefined, 6], 0));
// [ 1, 2, 4, 5, 3, 6 ]
