<template>
  <div class="login" :style="{ backgroundImage: `url(${loginBgUrl})` }">
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
            <el-button @click="handleRegister(formRef)" style="width: 100%">注册</el-button>
          </el-form-item>
        </el-form>
    </div>
  </div>
</template>
<script setup lang="ts">


// 导入组合式api
import {reactive, ref, computed} from 'vue'
// 导入element-plus的类型
import type {FormInstance, FormRules} from 'element-plus'
// 导入请求api
import {$login} from "../api/admin";
import {$register} from "../api/login";
// 导入路由器
import {useRouter} from "vue-router";
// 返回路由器对象
const router = useRouter();

// 获取登录背景图片URL
const loginBgUrl = computed(() => {
  const config = (window as any).__APP_CONFIG__ || {}
  const images = config.LOGIN_BG_IMAGES || []
  const index = (config.LOGIN_BG_INDEX || 1) - 1
  return images[index] || ''
})

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

// 注册
const handleRegister = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      const success = await $register(formData)
      if (success) {
        // 注册成功后自动登录
        let ret = await $login(formData)
        if (ret) {
          router.push('/index/home')
        }
      }
    } else {
      return false
    }
  })
}
</script>
<style scoped lang="sass">
.login
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  width: 100%
  height: 100%
  margin: 0
  padding: 0
  background-color: #e8f4f8
  background-size: 100% 100%
  background-position: center
  background-repeat: no-repeat
  display: flex
  justify-content: flex-end
  align-items: center
  overflow: hidden

  .login-box
    width: 400px
    padding: 40px
    margin-right: 100px
    background: rgba(255, 255, 255, 0.9)
    border-radius: 12px
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2)

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
