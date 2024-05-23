/* 
后续遍历：左子树、右子树、根节点
完全二叉树，先有左节点，再有右节点
以 images/完全二叉树 为例
*/

/* 
从根节点一直找左节点，找到叶子节点8为止，放入结果数组
深度往下找，但是找到8之后，要通过8的父节点4再去找到右边的9
所以父节点的值要存储下来，同理2和1也要保存下来
1-8到底，再往上找每一层父节点的右节点时从8-1，
这种符合栈的结构，对称的回溯历史过程，
根节点变化，过程是重复的，那么递归调用栈可以实现

递归的基础结构就是，
变化的根节点，作为参数
函数内容是，获取左右子节点
递归持续的条件是，存在左节点，将左节点作为根节点处理
判断完左节点后，再判断是否存在右节点，将右节点作为根节点处理
*/
function getResult(arr, rootIndex) {
  let result = [];
  function recursion(arr, rootIndex) {
    let leftIndex = 2 * rootIndex + 1;
    if (arr[leftIndex]) {
      // 0. 有左子节点，递归处理，直到没有左子节点了，不再进入这里，去执行注释1后面的代码
      recursion(arr, leftIndex);
      // 2. 回到这里，此时root为4，right为9
      // 7. 再回到这里，此时root为2，right为5
      let rightIndex = 2 * rootIndex + 2;
      if (arr[rightIndex]) {
        // 3. 有right=9，进去处理子节点
        // 5. 出来，root为4，root的左右节点处理完毕
        recursion(arr, rightIndex);
      }
    }
    // 1. 左边到底了，此时root 为8，没有左子节点了，把8放到结果中
    // 4. root 9没有左节点了，把9放到结果中
    // 6. root的子节点处理完毕，把4放进结果中
    result.push(arr[rootIndex]);
  }
  recursion(arr, rootIndex);
  return result;
}
console.log(getResult([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 0));
// [  8, 9,  4, 10, 11,  5, 2, 12,  6,  7,  3, 1]
