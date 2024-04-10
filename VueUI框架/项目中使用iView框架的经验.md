1. 表单校验的写法
   ```
   ruleValidate: {
       // 输入框
       name: [
           { required: true, message: 'The name cannot be empty', trigger: 'change, blur' }
       ],
       // 下拉选择框
       name: [
           { required: true, message: 'The name cannot be empty' }
       ],
       // 单选框
       name: [
           { required: true, message: 'The name cannot be empty' }
       ],
       // 多选框
       name: [
           { required: true, type: 'array', message: 'The name cannot be empty', trigger: 'change' }
       ],
       // 数字输入框
       name: [
           { required: true, message: 'The name cannot be empty' }
       ],
       }
   ```
1. 下拉框有新建功能时，该下拉框不能设置 filterable
1. 不能同时出现两个 this.$Modal 窗口
1. 时间段类型的日期选择框为必填项时，需要手动增加 validator 进行校验
   ```
   <DatePicker v-model="createForm.date" type="daterange" placeholder="Select date" style="width: 200px"\></DatePicker\>
   const validateDateTimeRange = (rule, value, callback) => {
       (value[0] === '' || value[1] === '')
         ? callback(new Error('时间为必选项'))
         : calllback()
   }
   ruleValidate: {
       date: [
           { required: true, message: '时间为必选项' },
           { validator: validateDateTimeRange, trigger: 'change' }
       ]
   }
   ```
