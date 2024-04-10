框架：Bootstrap+jQuery
实现必填项、手机、邮箱、最大值、最小值校验
使用方法：通过给表单添加自定义属性

```
data-vl="true" // 添加该属性表示该项需要校验
data-vl-required="true" // 是否为必填项
data-vl-required-error="该项为必填项" // 必填项错误提示
data-vl-email="true" // 邮箱校验
data-vl-email-error="请输入正确的邮箱" // 邮箱校验错误提示

// 支持自定义触发校验的事件
// 1. 通过设置`vl-myevent`自定义属性
// 2. 传入myevent配置
// 3. 默认为change
```

具体实现

```
// validate.js
(function(global, factory, plugin) {
  return factory.call(global, global.jQuery, plugin)
})(this, function($, plugin) {
  // 默认配置
  var _defaultOptions = {
    myevent: 'change'
  }
  // 校验规则
  var _rules = {
    "required": function () {
      return !!this.val()
    },
    "email": function () {
      return /^[\da-z]+([\-\.\_]?[\da-z]+)*@[\da-z]+([\-\.]?[\da-z]+)*(\.[a-z]{2,})+$/i.test(this.val())
    },
    "phone": function () {
      return /^1[3|5|7|8|9]\d{9}$/.test(this.val())
    },
    "max": function () {
      return this.val() <= this.data('vl-max')
    },
    "min": function () {
      return this.val() >= this.data('vl-min')
    },
  }
  $.fn[plugin] = function (options) {
    this.each(function () {
      var $this = $(this)
      $.extend($this, options)
      $this.myevent = $this.data('vl-myevent') || $this.myevent || _defaultOptions.myevent
      var $fields = $this.find('[data-vl=true]')
      $fields.on($this.myevent, function(){
        var $field = $(this)
        var $group = $field.parents('.form-group').removeClass('has-success has-error')
        $group.find('.help-block').remove()
        var result = true, error = null
        $.each(_rules, function (rule, valid) {
          if ($field.data('vl-' + rule)) {
            result = valid.call($field)
            error = $field.data('vl-' + rule + '-error')
            if (!result && error) {
              $field.after('<span class="help-block">'+error+'</span>')
            }
            return result
          }
        })
        $group.addClass(result?'has-success':'has-error')
      })
    })
  }
}, 'validate')
```

使用

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
  <script src="https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@3.3.7/dist/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
  <style>
    #box {
      width: 500px;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div id="box">
    <form>
      <div class="form-group">
        <label for="exampleInputEmail1">Email address</label>
        <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Email"
          data-vl="true"
          data-vl-required="true"
          data-vl-required-error="该项为必填项"
          data-vl-email="true"
          data-vl-email-error="请输入正确的邮箱"
        >
      </div>
      <div class="form-group">
          <label for="exampleInputPhone1">Phone</label>
          <input type="text" class="form-control" id="exampleInputPhone1" placeholder="Phone"
            data-vl="true"
            data-vl-required="true"
            data-vl-required-error="该项为必填项"
            data-vl-phone="true"
            data-vl-phone-error="请输入正确的手机号"
          >
        </div>
      <div class="form-group">
        <label for="exampleInputNumber1">MaxNumber</label>
        <input type="text" class="form-control" id="exampleInputNumber1"
        placeholder="MaxNumber"
        data-vl="true"
        data-vl-max="100"
        data-vl-max-error="请输入小于100的值"
        >
      </div>
      <div class="form-group">
        <label for="exampleInputNumber2">MinNumber</label>
        <input type="text" class="form-control" id="exampleInputNumber2"
        placeholder="MinNumber"
        data-vl="true"
        data-vl-min="10"
        data-vl-min-error="请输入大于10的值"
        >
      </div>
      <button type="submit" class="btn btn-default">Submit</button>
    </form>
  </div>
</body>
<script src="./validate.js"></script>
<script>
$(document).ready(function () {
  $('form').validate({
    myevent: 'keyup'
  })
})
</script>
</html>
```
