<template>
  <div class="mail-container">
    <el-row :gutter="20">
      <!-- 左侧邮件列表 -->
      <el-col :span="8">
        <el-card class="mail-list-card">
          <template #header>
            <div class="card-header">
              <h3>收件箱</h3>
              <el-badge :value="unreadCount" class="badge" />
            </div>
          </template>

          <div class="mail-list">
            <div
              v-for="mail in mailList"
              :key="mail.id"
              class="mail-item"
              :class="{ unread: !mail.read, active: currentMail?.id === mail.id }"
              @click="selectMail(mail)"
            >
              <div class="mail-header">
                <span class="sender">{{ mail.sender }}</span>
                <span class="time">{{ mail.time }}</span>
              </div>
              <div class="subject">{{ mail.subject }}</div>
              <div class="preview">{{ mail.preview }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧邮件详情 -->
      <el-col :span="16">
        <el-card class="mail-detail-card" v-if="currentMail">
          <template #header>
            <h3>{{ currentMail.subject }}</h3>
          </template>

          <div class="mail-info">
            <p><strong>发件人：</strong>{{ currentMail.sender }}</p>
            <p><strong>收件人：</strong>{{ currentMail.receiver }}</p>
            <p><strong>时间：</strong>{{ currentMail.time }}</p>
          </div>

          <el-divider />

          <div class="mail-content">
            {{ currentMail.content }}
          </div>

          <div class="mail-actions">
            <el-button type="primary">回复</el-button>
            <el-button>转发</el-button>
            <el-button type="danger">删除</el-button>
          </div>
        </el-card>

        <el-empty v-else description="请选择一封邮件查看" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const mailList = ref([
  {
    id: 1,
    sender: '系统通知',
    receiver: 'admin@example.com',
    subject: '欢迎使用博客系统',
    preview: '感谢您使用我们的博客系统，祝您使用愉快...',
    content: '尊敬的用户，感谢您使用我们的博客系统。如有任何问题，请随时联系我们。祝您使用愉快！',
    time: '2025-03-15 10:30',
    read: false
  },
  {
    id: 2,
    sender: '管理员',
    receiver: 'admin@example.com',
    subject: '系统维护通知',
    preview: '定于本周六晚上22:00进行系统维护...',
    content: '各位用户：定于本周六晚上22:00-24:00进行系统维护，届时系统将暂停服务，请提前安排好工作。给您带来的不便敬请谅解。',
    time: '2025-03-14 15:20',
    read: true
  },
  {
    id: 3,
    sender: '张三',
    receiver: 'admin@example.com',
    subject: '关于博客文章的问题咨询',
    preview: '您好，我在阅读您的文章时遇到了一些问题...',
    content: '您好，我在阅读您关于 Vue 3 的文章时遇到了一些问题，能否详细解释一下组合式 API 的使用场景？谢谢！',
    time: '2025-03-13 09:15',
    read: true
  }
])

const currentMail = ref(null as any)

const unreadCount = computed(() => {
  return mailList.value.filter(m => !m.read).length
})

const selectMail = (mail: any) => {
  currentMail.value = mail
  if (!mail.read) {
    mail.read = true
  }
}
</script>

<style scoped lang="sass">
.mail-container
  padding: 20px
  height: 100%

  .card-header
    display: flex
    justify-content: space-between
    align-items: center

    h3
      margin: 0
      font-family: xiaxingkai, cursive
      color: #2c5282

  .mail-list-card
    height: calc(100vh - 120px)

    .mail-list
      overflow-y: auto
      max-height: calc(100vh - 220px)

    .mail-item
      padding: 15px
      border-bottom: 1px solid #e2e8f0
      cursor: pointer
      transition: all 0.3s

      &:hover
        background: #f7fafc

      &.active
        background: #ebf8ff

      &.unread
        background: #fffbeb

        .subject
          font-weight: 600

      .mail-header
        display: flex
        justify-content: space-between
        margin-bottom: 8px

        .sender
          font-weight: 600
          color: #2d3748

        .time
          font-size: 12px
          color: #a0aec0

      .subject
        font-size: 14px
        color: #2d3748
        margin-bottom: 5px

      .preview
        font-size: 13px
        color: #718096
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap

  .mail-detail-card
    height: calc(100vh - 120px)

    h3
      margin: 0
      color: #2c5282

    .mail-info
      p
        margin: 8px 0
        color: #4a5568

    .mail-content
      padding: 20px 0
      line-height: 1.8
      color: #2d3748
      min-height: 300px

    .mail-actions
      margin-top: 20px
      text-align: center
</style>
