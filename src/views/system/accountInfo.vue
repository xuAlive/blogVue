<template>
  <div class="account-info-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2 class="page-title">账号详情</h2>
          <el-button v-if="!isEditing" type="primary" @click="startEdit">编辑资料</el-button>
          <div v-else>
            <el-button type="primary" @click="saveUserInfo">保存</el-button>
            <el-button @click="cancelEdit">取消</el-button>
          </div>
        </div>
      </template>

      <el-form v-if="userInfo" :model="formData" label-width="100px" :disabled="!isEditing">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="账号">
              <el-input v-model="userInfo.account" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="formData.phone" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="真实姓名">
              <el-input v-model="formData.userName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱">
              <el-input v-model="formData.email" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-radio-group v-model="formData.sex">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="0">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-date-picker
                v-model="formData.birthday"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="年龄">
              <el-input-number v-model="formData.age" :min="0" :max="150" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input v-model="formData.idCard" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="个人简介">
              <el-input
                v-model="formData.intro"
                type="textarea"
                :rows="4"
                placeholder="请输入个人简介"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-empty v-else description="加载用户信息失败" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserInfoByAccount, updateUserInfo, type UserInfo } from '../../api/user'

const userInfo = ref<UserInfo | null>(null)
const formData = ref<UserInfo>({
  account: '',
  phone: '',
  name: '',
  userName: '',
  email: '',
  birthday: '',
  age: 0,
  sex: 1,
  idCard: '',
  intro: ''
})
const isEditing = ref(false)

// 加载用户信息
const loadUserInfo = async () => {
  const data = await getUserInfoByAccount()
  if (data) {
    userInfo.value = data
    formData.value = { ...data }
  }
}

// 开始编辑
const startEdit = () => {
  isEditing.value = true
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  if (userInfo.value) {
    formData.value = { ...userInfo.value }
  }
}

// 保存用户信息
const saveUserInfo = async () => {
  const success = await updateUserInfo(formData.value)
  if (success) {
    isEditing.value = false
    await loadUserInfo()
  }
}

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped lang="sass">
.account-info-container
  padding: 20px

  .card-header
    display: flex
    justify-content: space-between
    align-items: center

  .page-title
    font-size: 24px
    color: #2c5282
    margin: 0
    font-family: xiaxingkai, cursive
</style>
