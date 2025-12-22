<template>
  <div class="login">
    <!-- 左侧品牌区域 -->
    <div class="brand-section">
      <div class="brand-container">
        <div class="background-text">博客</div>
        <div class="main-character">徐</div>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-section">
      <div class="login-box">
        <h2>欢迎登录</h2>
        <el-form
            size="large"
            ref="formRef"
            :model="formData"
            status-icon
            :rules="rules"
            label-width="60px"
        >
          <el-form-item label="账号" prop="loginId">
            <el-input v-model.number="formData.account" placeholder="请输入账号"/>
          </el-form-item>
          <el-form-item label="密码" prop="loginPwd">
            <el-input v-model="formData.password" type="password" placeholder="请输入密码"/>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm(formRef)" style="width: 100%">登录</el-button>
          </el-form-item>
          <el-form-item>
            <el-button @click="resetForm(formRef)" style="width: 100%">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">


// 导入组合式api
import {reactive, ref} from 'vue'
// 导入element-plus的类型
import type {FormInstance, FormRules} from 'element-plus'
// 导入请求api
import {$login} from "../api/admin";
// 导入路由器
import {useRouter} from "vue-router";
// 返回路由器对象
const router = useRouter();

// 定义一个ref绑定表单
const formRef = ref<FormInstance>()
// 表单数据
const formData = reactive({
  account: '',
  password: ''
})

// 验证账号
const validateLoginId = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入账号'))
  } else {
    callback()
  }
}
// 验证密码
const validateLoginPwd = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}


// 验证对象
const rules = reactive<FormRules<typeof formData>>({
  account: [{validator: validateLoginId, trigger: 'blur'}],
  password: [{validator: validateLoginPwd, trigger: 'blur'}],
})
// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      let ret = await $login(formData)
      console.log(ret)
      //跳转页面 - 登录后直接跳转到博客广场
      if (ret){
        router.push('/index/home')
      }


    } else {
      return false
    }
  })
}
// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>
<style scoped lang="sass">
.login
  width: 100vw
  height: 100vh
  background: #e8f4f8
  display: flex
  flex-direction: row

  .brand-section
    flex: 1
    display: flex
    justify-content: center
    align-items: center
    position: relative

    .brand-container
      position: relative
      display: flex
      justify-content: center
      align-items: center

      .background-text
        position: absolute
        font-size: 180px
        font-weight: bold
        color: rgba(100, 149, 237, 0.15)
        z-index: 1
        letter-spacing: 20px
        user-select: none

      .main-character
        position: relative
        font-size: 280px
        font-family: xiaxingkai, cursive
        color: #2c5282
        z-index: 2
        text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1)
        user-select: none

  .login-section
    flex: 1
    display: flex
    justify-content: center
    align-items: center
    background: rgba(255, 255, 255, 0.3)

    .login-box
      width: 400px
      padding: 40px
      background: white
      border-radius: 12px
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1)

      h2
        color: #2c5282
        font-size: 28px
        text-align: center
        margin-bottom: 30px
        font-weight: 600

      ::v-deep .el-form-item__label
        color: #4a5568
        font-weight: 500

      ::v-deep .el-input__wrapper
        border-radius: 8px

      ::v-deep .el-button--primary
        background: #4299e1
        border-color: #4299e1
        border-radius: 8px
        height: 44px
        font-size: 16px
        &:hover
          background: #3182ce
          border-color: #3182ce

      ::v-deep .el-button--default
        border-radius: 8px
        height: 44px
        font-size: 16px

</style>
