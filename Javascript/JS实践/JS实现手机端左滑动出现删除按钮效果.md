手机端左滑动超过一定距离显示功能按钮，右滑动或点击其他地方隐藏

```js
(function (window) {
  window.mymethod = {};
  /*
   * @method: slideToShow 移动端左滑动显示功能（如删除），右滑动隐藏
   * @params: 1. Object 需要滑动Dom元素
   *          2. Number 滑动超过这个距离定位到最终位置，未超过吸附回去
   *          3. Number 最终定位位置
   * @return: 无
   * */
  mymethod.slideToShow = function (dom, maxdistance, finalposition) {
    /*记录起始  刚刚触摸的点的位置  x的坐标*/
    var startX = 0,
      /*滑动的时候x的位置*/
      moveX = 0,
      /*滑动的距离*/
      distanceX = 0,
      /*是否滑动过*/
      isMove = false,
      /*当前位置*/
      currentX = 0;

    /*公用方法*/
    /*加过渡*/
    var addTransition = function () {
      dom.style.transition = "all 0.3s";
      dom.style.webkitTransition = "all 0.3s";
    };
    /*清除过渡*/
    var removeTransition = function () {
      dom.style.transition = "none";
      dom.style.webkitTransition = "none";
    };
    /*定位*/
    var setTranslateX = function (translateX) {
      dom.style.transform = "translateX(" + translateX + "px)";
      dom.style.webkitTransform = "translateX(" + translateX + "px)";
    };
    dom.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX;
    });
    /*
     * 1. 左滑动时，判断滑动距离，如果超过一定距离，定位到最终位置，如果没有，吸附回去
     * 左为负值
     * 2. 右滑动时，首先判断元素是否有滑动值，如果没有，不滑动。如果有，判断滑动距离如果超过一定距离，定位0，如果没有，定位到滑动前位置
     * 右为正值
     * */
    dom.addEventListener("touchmove", function (e) {
      /*滑动时候的X*/
      moveX = e.touches[0].clientX;
      /*计算移动的距离*/
      distanceX = moveX - startX;
      /*左滑*/
      if (distanceX < 0) {
        /*清除过渡*/
        removeTransition();
        /*左滑动范围 -finalposition 到 0*/
        if (-finalposition < currentX + distanceX && currentX + distanceX < 0) {
          /*实时的定位*/
          setTranslateX(currentX + distanceX);
        }
        /*证明滑动过*/
        isMove = true;
      } else if (distanceX > 0) {
        /*右滑*/
        /*如果当前定位为0 不滑动*/
        if (currentX == 0) {
          return false;
        } else {
          /*当前定位不为0 右滑动范围 -finalposition 到 0*/
          if (
            -finalposition < currentX + distanceX &&
            currentX + distanceX < 0
          ) {
            /*实时的定位*/
            setTranslateX(currentX + distanceX);
          }
        }
        /*证明滑动过*/
        isMove = true;
      } else {
        return false;
      }
    });
    /*在模拟器上模拟的滑动会有丢失的情况  在模拟器的时候用window绑定touchend事件观察效果*/
    window.addEventListener("touchend", function (e) {
      if (isMove && Math.abs(distanceX) > maxdistance) {
        /*当滑动超过了一定的距离  需要 定位到最终位置*/
        /*加过渡*/
        addTransition();
        /*定位*/
        if (distanceX < 0) {
          // 左滑
          setTranslateX(-finalposition);
          currentX = -finalposition;
        } else {
          // 右滑
          setTranslateX(0);
          currentX = 0;
        }
      } else if (isMove && Math.abs(distanceX) <= maxdistance) {
        /*当滑动的距离不超过一定的距离的时候  需要吸附回去 */
        /*加过渡*/
        addTransition();
        /*定位*/
        if (distanceX < 0) {
          // 左滑
          setTranslateX(0);
          currentX = 0;
        } else {
          // 右滑
          setTranslateX(-finalposition);
          currentX = -finalposition;
        }
      } else {
        return false;
      }
      /*重置参数*/
      startX = 0;
      moveX = 0;
      distanceX = 0;
      isMove = false;
    });
    /*点击页面任何部位，滑动回去*/
    document.addEventListener("click", function () {
      /*加过渡*/
      addTransition();
      /*定位*/
      setTranslateX(0);
    });
  };
})(window);
```
