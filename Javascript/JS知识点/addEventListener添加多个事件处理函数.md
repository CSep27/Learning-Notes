问题：有图表的页面，点击全屏按钮，按 ESC 返回后，再调整浏览器大小，图表大小不跟随变化。

原因：两个页面代码是不同的人写的，图表页面和点击全屏按钮的代码中都是通过 window.onresize=function(){}来绑定事件，导致事件被覆盖。

解决：通过 addEventListener 可以给同一事件添加多个处理函数。

总结：养成使用 addEventListener 和 removeEventListener 的习惯。尤其在给 window 对象添加事件时。

代码：
框架：Vue+ECharts
横向菜单上有一按钮，点击隐藏菜单，剩下页面内容全屏

```
function clickFullScreen () {
    this.isShowMenu = false
    function onWindowResize () {
        // 非全屏时，document.fullscreenElement为null
        if (!document.fullscreenElement) {
            this.isShowMenu = true
            window.removeEventListener('resize', onWindowResize)
        }
    }
    window.addEventListener('resize', onWindowResize)
}
```

页面内容中有 echarts 图表，浏览器大小改变时，echarts 图大小相应变化

```
data () {
    return {
        lineChart: {} // 生成的echarts图对象
    }
},
mounted () {
    this.lineChart = this.$echarts.init(document.getElementById('line_chart'))
    window.addEventListener('resize', this.onWindowResize)
},
destoryed () {
    window.removeEventListener('resize', this.onWindowResize)
},
methods: {
    onWindowResize () {
        // Object.getOwnPropertyNames(this.lineChart)对象无内容时length为1 ???
        if (this.lineChart && Object.getOwnPropertyNames(this.lineChart).length > 1) {
            this.lineChart.resize()
        }
    }
}
```
