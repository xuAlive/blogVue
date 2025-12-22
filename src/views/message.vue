<template>
  <div class="message-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h3>系统消息</h3>
          <el-button type="primary" size="small" @click="markAllRead">全部标为已读</el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="系统通知" name="system">
          <div class="message-list">
            <div
              v-for="msg in systemMessages"
              :key="msg.id"
              class="message-item"
              :class="{ unread: !msg.read }"
            >
              <div class="message-icon">
                <el-icon :size="30" color="#409EFF">
                  <Bell />
                </el-icon>
              </div>
              <div class="message-content">
                <div class="message-title">{{ msg.title }}</div>
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
              <div class="message-actions">
                <el-button v-if="!msg.read" type="text" @click="markRead(msg)">
                  标为已读
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="评论通知" name="comment">
          <div class="message-list">
            <div
              v-for="msg in commentMessages"
              :key="msg.id"
              class="message-item"
              :class="{ unread: !msg.read }"
            >
              <div class="message-icon">
                <el-icon :size="30" color="#67C23A">
                  <ChatDotRound />
                </el-icon>
              </div>
              <div class="message-content">
                <div class="message-title">{{ msg.title }}</div>
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
              <div class="message-actions">
                <el-button type="text" @click="viewComment(msg)">
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="点赞收藏" name="like">
          <div class="message-list">
            <div
              v-for="msg in likeMessages"
              :key="msg.id"
              class="message-item"
            >
              <div class="message-icon">
                <el-icon :size="30" color="#F56C6C">
                  <Star />
                </el-icon>
              </div>
              <div class="message-content">
                <div class="message-title">{{ msg.title }}</div>
                <div class="message-text">{{ msg.content }}</div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, ChatDotRound, Star } from '@element-plus/icons-vue'

const activeTab = ref('system')

const systemMessages = ref([
  {
    id: 1,
    title: '系统升级通知',
    content: '系统将于今晚22:00进行版本升级，预计需要2小时',
    time: '2025-03-15 16:30',
    read: false
  },
  {
    id: 2,
    title: '账号安全提醒',
    content: '检测到您的账号在异地登录，请确认是否为本人操作',
    time: '2025-03-14 10:20',
    read: true
  }
])

const commentMessages = ref([
  {
    id: 1,
    title: '新评论通知',
    content: '用户"张三"评论了你的文章《Vue 3 最佳实践》',
    time: '2025-03-15 14:50',
    read: false
  },
  {
    id: 2,
    title: '评论回复',
    content: '用户"李四"回复了你的评论',
    time: '2025-03-15 11:30',
    read: true
  }
])

const likeMessages = ref([
  {
    id: 1,
    title: '获得点赞',
    content: '用户"王五"点赞了你的文章《TypeScript 进阶指南》',
    time: '2025-03-15 15:20'
  },
  {
    id: 2,
    title: '获得收藏',
    content: '用户"赵六"收藏了你的文章《Vite 构建优化》',
    time: '2025-03-15 09:15'
  }
])

const markRead = (msg: any) => {
  msg.read = true
  ElMessage.success('已标为已读')
}

const markAllRead = () => {
  systemMessages.value.forEach(msg => msg.read = true)
  commentMessages.value.forEach(msg => msg.read = true)
  ElMessage.success('已全部标为已读')
}

const viewComment = (msg: any) => {
  ElMessage.info('正在跳转到评论详情...')
}
</script>

<style scoped lang="sass">
.message-container
  padding: 20px

  .card-header
    display: flex
    justify-content: space-between
    align-items: center

    h3
      margin: 0
      font-family: xiaxingkai, cursive
      color: #2c5282

  .message-list
    .message-item
      display: flex
      align-items: flex-start
      padding: 20px
      border-bottom: 1px solid #e2e8f0
      transition: all 0.3s

      &:hover
        background: #f7fafc

      &.unread
        background: #fffbeb

      .message-icon
        margin-right: 15px
        flex-shrink: 0

      .message-content
        flex: 1

        .message-title
          font-size: 16px
          font-weight: 600
          color: #2d3748
          margin-bottom: 8px

        .message-text
          font-size: 14px
          color: #4a5568
          line-height: 1.6
          margin-bottom: 8px

        .message-time
          font-size: 12px
          color: #a0aec0

      .message-actions
        margin-left: 15px
        flex-shrink: 0
</style>
