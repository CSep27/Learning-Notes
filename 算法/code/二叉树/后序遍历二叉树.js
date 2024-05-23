/* 
后续遍历：左子树、右子树、根节点
普通二叉树，可能只有右节点，那么左节点对应的位置为空
*/

function getResult(arr, rootIndex) {
  let result = [];
  function recursion(arr, rootIndex) {
    let leftIndex = 2 * rootIndex + 1;
    if (arr[leftIndex]) {
      recursion(arr, leftIndex);
    }
    let rightIndex = 2 * rootIndex + 2;
    if (arr[rightIndex]) {
      recursion(arr, rightIndex);
    }
    result.push(arr[rootIndex]);
  }
  recursion(arr, rootIndex);
  return result;
}
console.log(getResult([1, 2, 3, 4, 5, undefined, 6], 0));
// [ 4, 5, 2, 6, 3, 1 ]
