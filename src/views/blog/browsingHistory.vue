<template>
  <div class="browsing-history-container">
    <!-- 列表视图 -->
    <div v-if="!showDetail" class="list-view">
      <div class="header">
        <h3>浏览记录</h3>
        <el-button type="danger" size="small" @click="clearHistory">
          清空记录
        </el-button>
      </div>

      <el-scrollbar class="list-scrollbar">
        <div class="history-list">
          <el-card
            v-for="history in historyList"
            :key="history.id"
            class="history-item"
            shadow="hover"
            @click="viewDetail(history)"
          >
            <div class="history-header">
              <h4 class="history-title">{{ history.title }}</h4>
              <el-tag type="info" size="small">{{ history.author }}</el-tag>
            </div>
            <div class="history-info">
              <div class="info-row">
                <span class="info-label">创建时间:</span>
                <span class="info-value">{{ history.createTime }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">上次查看:</span>
                <span class="info-value">{{ history.lastViewTime }}</span>
              </div>
            </div>
            <div class="history-footer">
              <span class="view-count">
                <el-icon><View /></el-icon>
                已查看 {{ history.viewCount }} 次
              </span>
              <span class="duration">
                <el-icon><Clock /></el-icon>
                停留 {{ history.duration }}
              </span>
            </div>
          </el-card>
        </div>
      </el-scrollbar>
    </div>

    <!-- 详情视图 -->
    <div v-else class="detail-view">
      <div class="detail-header">
        <el-button type="primary" :icon="ArrowLeft" @click="backToList">
          返回列表
        </el-button>
      </div>

      <el-card class="detail-card">
        <div class="detail-content">
          <h2 class="article-title">{{ currentHistory.title }}</h2>

          <div class="article-meta">
            <el-tag type="success" size="small">{{ currentHistory.author }}</el-tag>
            <span class="meta-item">
              <el-icon><Calendar /></el-icon>
              创建于 {{ currentHistory.createTime }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              上次查看 {{ currentHistory.lastViewTime }}
            </span>
            <span class="meta-item">
              <el-icon><View /></el-icon>
              查看 {{ currentHistory.viewCount }} 次
            </span>
          </div>

          <el-divider />

          <div class="article-summary">
            <h3>摘要</h3>
            <p>{{ currentHistory.summary }}</p>
          </div>

          <div class="article-body" v-html="currentHistory.content"></div>

          <el-divider />

          <div class="article-footer">
            <div class="footer-info">
              <span>分类: {{ currentHistory.category }}</span>
              <span>标签: {{ currentHistory.tags.join(', ') }}</span>
            </div>
            <div class="footer-stats">
              <span>停留时长: {{ currentHistory.duration }}</span>
              <span>字数: {{ currentHistory.wordCount }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Clock, ArrowLeft, Calendar } from '@element-plus/icons-vue'

// 浏览记录数据
interface BrowsingHistory {
  id: number
  title: string
  author: string
  createTime: string
  lastViewTime: string
  viewCount: number
  duration: string
  summary: string
  content: string
  category: string
  tags: string[]
  wordCount: number
}

const historyList = ref<BrowsingHistory[]>([
  {
    id: 1,
    title: 'Vue 3 组合式 API 最佳实践',
    author: '张三',
    createTime: '2024-01-15 10:00:00',
    lastViewTime: '2024-01-20 14:30:25',
    viewCount: 5,
    duration: '12分钟',
    summary: '本文深入探讨了 Vue 3 组合式 API 的使用方法和最佳实践，包括响应式系统、生命周期钩子、依赖注入等核心概念...',
    content: '<p>Vue 3 引入了组合式 API（Composition API），这是一个全新的逻辑组织和复用方式。</p><h3>核心概念</h3><p><strong>ref 和 reactive：</strong>这是创建响应式数据的两种方式。ref 适用于基本类型，reactive 适用于对象类型。</p><p><strong>computed 和 watch：</strong>computed 用于计算属性，watch 用于监听数据变化。</p><h3>最佳实践</h3><ul><li>使用组合函数封装可复用逻辑</li><li>合理使用 toRefs 解构响应式对象</li><li>避免在 setup 中使用 this</li></ul>',
    category: 'Vue',
    tags: ['Vue 3', 'Composition API', '前端开发'],
    wordCount: 2580
  },
  {
    id: 2,
    title: 'TypeScript 进阶指南',
    author: '李四',
    createTime: '2024-01-12 09:00:00',
    lastViewTime: '2024-01-20 10:15:10',
    viewCount: 3,
    duration: '18分钟',
    summary: 'TypeScript 作为 JavaScript 的超集，提供了强大的类型系统。本文介绍高级类型、泛型、装饰器等进阶特性...',
    content: '<p>TypeScript 为 JavaScript 添加了静态类型检查，极大提高了代码的可维护性。</p><h3>高级类型</h3><p><strong>联合类型和交叉类型：</strong>使用 | 和 & 运算符组合类型。</p><p><strong>类型守卫：</strong>使用 typeof、instanceof 等进行类型判断。</p><h3>泛型</h3><p>泛型是 TypeScript 最强大的特性之一，它允许我们编写灵活且类型安全的代码。</p><pre><code>function identity&lt;T&gt;(arg: T): T {\n  return arg;\n}</code></pre>',
    category: 'TypeScript',
    tags: ['TypeScript', '类型系统', '编程语言'],
    wordCount: 3120
  },
  {
    id: 3,
    title: 'Vite 构建优化实战',
    author: '王五',
    createTime: '2024-01-10 14:00:00',
    lastViewTime: '2024-01-19 16:20:00',
    viewCount: 7,
    duration: '25分钟',
    summary: 'Vite 是新一代前端构建工具，本文分享在实际项目中的构建优化经验，包括代码分割、懒加载、预加载等技巧...',
    content: '<p>Vite 基于 ESM 和 Rollup，提供了极快的开发服务器启动速度和热更新体验。</p><h3>代码分割</h3><p>使用动态 import 实现路由懒加载：</p><pre><code>const Home = () => import(\'./views/Home.vue\')</code></pre><h3>依赖预构建</h3><p>Vite 会自动预构建依赖，但某些情况需要手动配置：</p><pre><code>export default {\n  optimizeDeps: {\n    include: [\'lodash-es\']\n  }\n}</code></pre><h3>生产构建优化</h3><ul><li>启用 gzip 压缩</li><li>配置 CDN 加速</li><li>使用 terser 压缩代码</li></ul>',
    category: '构建工具',
    tags: ['Vite', '构建优化', '性能优化'],
    wordCount: 2850
  },
  {
    id: 4,
    title: 'Pinia 状态管理详解',
    author: '赵六',
    createTime: '2024-01-08 11:00:00',
    lastViewTime: '2024-01-18 09:45:30',
    viewCount: 4,
    duration: '15分钟',
    summary: 'Pinia 是 Vue 3 官方推荐的状态管理库，相比 Vuex 更加轻量和易用。本文详细介绍 Pinia 的核心概念和使用方法...',
    content: '<p>Pinia 是 Vue 生态中新一代的状态管理库。</p><h3>核心优势</h3><ul><li>完整的 TypeScript 支持</li><li>极轻量，压缩后仅 1KB</li><li>去除 mutations，只有 state、getters、actions</li><li>支持模块热更新</li></ul><h3>基本使用</h3><pre><code>import { defineStore } from \'pinia\'\n\nexport const useUserStore = defineStore(\'user\', {\n  state: () => ({\n    name: \'张三\',\n    age: 25\n  }),\n  getters: {\n    doubleAge: (state) => state.age * 2\n  },\n  actions: {\n    increment() {\n      this.age++\n    }\n  }\n})</code></pre>',
    category: '状态管理',
    tags: ['Pinia', 'Vue', '状态管理'],
    wordCount: 1980
  },
  {
    id: 5,
    title: 'Element Plus 组件库实战',
    author: '孙七',
    createTime: '2024-01-05 15:30:00',
    lastViewTime: '2024-01-17 13:20:15',
    viewCount: 6,
    duration: '20分钟',
    summary: 'Element Plus 是 Vue 3 的企业级 UI 组件库。本文介绍常用组件的使用技巧和自定义主题方案...',
    content: '<p>Element Plus 是基于 Vue 3 的组件库，提供了丰富的 UI 组件。</p><h3>常用组件</h3><p><strong>表单组件：</strong>el-form、el-input、el-select 等。</p><p><strong>数据展示：</strong>el-table、el-pagination、el-card 等。</p><p><strong>反馈组件：</strong>el-message、el-dialog、el-notification 等。</p><h3>主题定制</h3><p>通过 SCSS 变量自定义主题：</p><pre><code>$--color-primary: #409EFF;\n$--border-radius-base: 4px;</code></pre>',
    category: 'UI 组件库',
    tags: ['Element Plus', 'Vue 3', 'UI'],
    wordCount: 2340
  }
])

const showDetail = ref(false)
const currentHistory = ref<BrowsingHistory | null>(null)

// 查看详情
const viewDetail = (history: BrowsingHistory) => {
  currentHistory.value = { ...history }
  showDetail.value = true
  // 更新查看次数和时间
  const index = historyList.value.findIndex(h => h.id === history.id)
  if (index !== -1) {
    historyList.value[index].viewCount++
    historyList.value[index].lastViewTime = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
  }
}

// 返回列表
const backToList = () => {
  showDetail.value = false
  currentHistory.value = null
}

// 清空记录
const clearHistory = () => {
  ElMessageBox.confirm('确定要清空所有浏览记录吗？此操作不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    historyList.value = []
    ElMessage.success('已清空浏览记录')
  }).catch(() => {
    ElMessage.info('已取消')
  })
}
</script>

<style scoped lang="sass">
.browsing-history-container
  height: 100%
  background: #f5f7fa

  .list-view
    height: 100%
    display: flex
    flex-direction: column

    .header
      display: flex
      justify-content: space-between
      align-items: center
      padding: 20px
      background: white
      border-radius: 8px
      margin-bottom: 20px

      h3
        margin: 0
        color: #2c5282
        font-size: 20px

    .list-scrollbar
      flex: 1
      height: 0

    .history-list
      padding: 0 20px 20px

      .history-item
        margin-bottom: 15px
        cursor: pointer
        transition: all 0.3s

        &:hover
          transform: translateY(-3px)
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

        .history-header
          display: flex
          justify-content: space-between
          align-items: center
          margin-bottom: 15px

          .history-title
            margin: 0
            color: #2d3748
            font-size: 16px
            font-weight: 600

        .history-info
          margin-bottom: 15px

          .info-row
            display: flex
            gap: 10px
            margin-bottom: 8px
            font-size: 14px

            .info-label
              color: #718096
              min-width: 80px

            .info-value
              color: #2d3748

        .history-footer
          display: flex
          justify-content: space-between
          padding-top: 10px
          border-top: 1px solid #e2e8f0

          .view-count,
          .duration
            display: flex
            align-items: center
            gap: 5px
            color: #a0aec0
            font-size: 13px

            .el-icon
              font-size: 14px

  .detail-view
    height: 100%
    display: flex
    flex-direction: column

    .detail-header
      padding: 20px
      background: white
      border-radius: 8px
      margin-bottom: 20px

    .detail-card
      flex: 1
      overflow: auto

      .detail-content
        .article-title
          color: #2c5282
          font-size: 28px
          margin: 0 0 20px 0
          font-weight: 600

        .article-meta
          display: flex
          gap: 20px
          align-items: center
          flex-wrap: wrap
          margin-bottom: 20px

          .meta-item
            display: flex
            align-items: center
            gap: 5px
            color: #718096
            font-size: 14px

            .el-icon
              font-size: 16px

        .article-summary
          margin-bottom: 30px

          h3
            color: #2d3748
            font-size: 20px
            margin: 0 0 15px 0

          p
            color: #718096
            line-height: 1.8
            font-size: 15px

        .article-body
          color: #2d3748
          line-height: 1.8
          font-size: 16px
          margin-bottom: 30px

          h3
            color: #2c5282
            margin: 25px 0 15px 0

          p
            margin-bottom: 15px

          ul, ol
            margin: 15px 0
            padding-left: 30px

          pre
            background: #f7fafc
            padding: 15px
            border-radius: 8px
            overflow-x: auto
            margin: 15px 0

            code
              font-family: 'Courier New', monospace
              font-size: 14px

        .article-footer
          display: flex
          justify-content: space-between
          padding: 20px
          background: #f7fafc
          border-radius: 8px

          .footer-info,
          .footer-stats
            display: flex
            flex-direction: column
            gap: 10px

            span
              color: #718096
              font-size: 14px
</style>
