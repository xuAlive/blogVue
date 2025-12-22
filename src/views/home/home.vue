<template>
  <div class="blog-home">
    <!-- 顶部导航栏 -->
    <div class="header">
      <h1 class="title">博客广场</h1>
      <el-button type="primary" @click="goToMyBlog" class="my-blog-btn">
        我的博客
      </el-button>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧博客列表 -->
      <div class="blog-list">
        <el-card v-for="blog in blogList" :key="blog.id" class="blog-card" shadow="hover">
          <div class="blog-item">
            <div class="blog-header">
              <h3 class="blog-title">{{ blog.title }}</h3>
              <span class="blog-date">{{ formatDate(blog.date) }}</span>
            </div>
            <p class="blog-author">作者：{{ blog.author }}</p>
            <p class="blog-description">{{ blog.description }}</p>
            <div class="blog-footer">
              <el-tag size="small" type="info">{{ blog.category }}</el-tag>
              <div class="blog-stats">
                <span><i class="el-icon-view"></i> {{ blog.views }}</span>
                <span><i class="el-icon-chat-line-round"></i> {{ blog.comments }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore">
          <el-button @click="loadMore" :loading="loading">加载更多</el-button>
        </div>
      </div>

      <!-- 右侧评论区 -->
      <div class="comments-section">
        <el-card class="comments-card">
          <template #header>
            <div class="card-header">
              <span>最新评论</span>
              <el-badge :value="commentList.length" class="badge" />
            </div>
          </template>

          <div class="comments-list">
            <div v-for="comment in commentList" :key="comment.id" class="comment-item">
              <div class="comment-avatar">
                <el-avatar :size="40">{{ comment.author.charAt(0) }}</el-avatar>
              </div>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{ comment.author }}</span>
                  <span class="comment-time">{{ formatTime(comment.time) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-blog-title">
                  来自：<span>{{ comment.blogTitle }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 博客列表数据
const blogList = ref([
  {
    id: 1,
    title: 'Vue 3 组合式 API 最佳实践',
    author: '张三',
    date: '2025-03-15T10:30:00',
    description: '深入探讨 Vue 3 组合式 API 的使用技巧，包括 ref、reactive、computed 等核心概念的实际应用场景...',
    category: '前端开发',
    views: 1234,
    comments: 45
  },
  {
    id: 2,
    title: 'TypeScript 进阶指南',
    author: '李四',
    date: '2025-03-14T15:20:00',
    description: '从基础到进阶，全面讲解 TypeScript 的类型系统、泛型、装饰器等高级特性，助你成为 TS 高手...',
    category: '编程语言',
    views: 2156,
    comments: 67
  },
  {
    id: 3,
    title: 'Vite 构建优化实战',
    author: '王五',
    date: '2025-03-13T09:15:00',
    description: '分享 Vite 项目构建优化的实用技巧，包括代码分割、懒加载、预渲染等方法，大幅提升应用性能...',
    category: '工程化',
    views: 987,
    comments: 32
  },
  {
    id: 4,
    title: 'Element Plus 组件库使用心得',
    author: '赵六',
    date: '2025-03-12T14:40:00',
    description: '总结了 Element Plus 在实际项目中的使用经验，包括主题定制、按需引入、常见问题解决方案...',
    category: 'UI框架',
    views: 1567,
    comments: 28
  },
  {
    id: 5,
    title: 'Pinia 状态管理完全指南',
    author: '钱七',
    date: '2025-03-11T11:25:00',
    description: 'Pinia 作为 Vue 3 官方推荐的状态管理库，本文详细介绍其核心概念和最佳实践...',
    category: '状态管理',
    views: 1890,
    comments: 41
  }
])

// 评论列表数据
const commentList = ref([
  {
    id: 1,
    author: '小明',
    content: '这篇文章写得太好了！对我帮助很大，特别是关于组合式 API 的部分。',
    time: '2025-03-15T11:30:00',
    blogTitle: 'Vue 3 组合式 API 最佳实践'
  },
  {
    id: 2,
    author: '小红',
    content: '作者讲解得很清晰，示例代码也很实用，已经收藏了！',
    time: '2025-03-15T11:15:00',
    blogTitle: 'TypeScript 进阶指南'
  },
  {
    id: 3,
    author: '小刚',
    content: '请问有源码示例吗？想参考学习一下。',
    time: '2025-03-15T10:50:00',
    blogTitle: 'Vite 构建优化实战'
  },
  {
    id: 4,
    author: '小丽',
    content: '非常实用的技巧，解决了我项目中的性能问题，感谢分享！',
    time: '2025-03-15T10:20:00',
    blogTitle: 'Element Plus 组件库使用心得'
  },
  {
    id: 5,
    author: '小强',
    content: 'Pinia 确实比 Vuex 简洁很多，学习成本也低。',
    time: '2025-03-15T09:45:00',
    blogTitle: 'Pinia 状态管理完全指南'
  },
  {
    id: 6,
    author: '小美',
    content: '期待更多这样的高质量文章！',
    time: '2025-03-15T09:30:00',
    blogTitle: 'Vue 3 组合式 API 最佳实践'
  },
  {
    id: 7,
    author: '小华',
    content: '代码示例很详细，跟着敲了一遍，收获满满。',
    time: '2025-03-15T09:00:00',
    blogTitle: 'TypeScript 进阶指南'
  },
  {
    id: 8,
    author: '小伟',
    content: '这个优化方案在我的项目中实测有效，构建速度提升了30%！',
    time: '2025-03-14T18:30:00',
    blogTitle: 'Vite 构建优化实战'
  }
])

const loading = ref(false)
const hasMore = ref(true)

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 格式化时间
const formatTime = (timeStr: string) => {
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now.getTime() - time.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(timeStr)
}

// 加载更多
const loadMore = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    // 模拟没有更多数据
    hasMore.value = false
  }, 1000)
}

// 跳转到我的博客
const goToMyBlog = () => {
  router.push('/index/blogInfo/myRecords')
}

onMounted(() => {
  // 组件加载时的初始化操作
})
</script>

<style scoped lang="sass">
.blog-home
  height: 100%
  display: flex
  flex-direction: column
  background: #f5f7fa

  .header
    display: flex
    justify-content: space-between
    align-items: center
    padding: 20px 30px
    background: white
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05)

    .title
      font-size: 28px
      font-weight: 600
      color: #2c5282
      margin: 0
      font-family: xiaxingkai, cursive

    .my-blog-btn
      background: #4299e1
      border-color: #4299e1
      &:hover
        background: #3182ce
        border-color: #3182ce

  .main-content
    flex: 1
    display: flex
    gap: 20px
    padding: 20px
    overflow: hidden

    .blog-list
      flex: 1
      overflow-y: auto
      padding-right: 10px

      &::-webkit-scrollbar
        width: 6px

      &::-webkit-scrollbar-thumb
        background: #cbd5e0
        border-radius: 3px

      &::-webkit-scrollbar-thumb:hover
        background: #a0aec0

      .blog-card
        margin-bottom: 20px
        transition: all 0.3s

        &:hover
          transform: translateY(-4px)
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1)

      .blog-item
        .blog-header
          display: flex
          justify-content: space-between
          align-items: center
          margin-bottom: 10px

          .blog-title
            font-size: 20px
            font-weight: 600
            color: #2d3748
            margin: 0
            cursor: pointer

            &:hover
              color: #4299e1

          .blog-date
            font-size: 14px
            color: #a0aec0

        .blog-author
          font-size: 14px
          color: #718096
          margin: 8px 0

        .blog-description
          font-size: 15px
          color: #4a5568
          line-height: 1.6
          margin: 12px 0

        .blog-footer
          display: flex
          justify-content: space-between
          align-items: center
          margin-top: 15px
          padding-top: 15px
          border-top: 1px solid #e2e8f0

          .blog-stats
            display: flex
            gap: 20px
            font-size: 14px
            color: #718096

            span
              display: flex
              align-items: center
              gap: 5px

      .load-more
        text-align: center
        padding: 20px 0

    .comments-section
      width: 360px
      flex-shrink: 0

      .comments-card
        height: 100%
        display: flex
        flex-direction: column

        .card-header
          display: flex
          align-items: center
          justify-content: space-between
          font-size: 18px
          font-weight: 600
          color: #2d3748

        ::v-deep .el-card__body
          flex: 1
          overflow: hidden
          padding: 0

        .comments-list
          height: 100%
          overflow-y: auto
          padding: 20px

          &::-webkit-scrollbar
            width: 6px

          &::-webkit-scrollbar-thumb
            background: #cbd5e0
            border-radius: 3px

          &::-webkit-scrollbar-thumb:hover
            background: #a0aec0

          .comment-item
            display: flex
            gap: 12px
            margin-bottom: 20px
            padding-bottom: 20px
            border-bottom: 1px solid #e2e8f0

            &:last-child
              border-bottom: none

            .comment-avatar
              flex-shrink: 0

            .comment-content
              flex: 1

              .comment-header
                display: flex
                justify-content: space-between
                align-items: center
                margin-bottom: 8px

                .comment-author
                  font-weight: 600
                  color: #2d3748
                  font-size: 14px

                .comment-time
                  font-size: 12px
                  color: #a0aec0

              .comment-text
                font-size: 14px
                color: #4a5568
                line-height: 1.6
                margin: 8px 0

              .comment-blog-title
                font-size: 12px
                color: #718096
                margin-top: 8px

                span
                  color: #4299e1
                  cursor: pointer

                  &:hover
                    text-decoration: underline
</style>
