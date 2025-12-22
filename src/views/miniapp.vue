<template>
  <div class="miniapp-container">
    <el-card class="header-card">
      <h2 class="page-title">小程序中心</h2>
      <p class="page-desc">这里是小程序管理中心，您可以管理和使用各种小程序工具</p>
    </el-card>

    <el-row :gutter="20" class="miniapp-grid">
      <el-col :span="6" v-for="app in miniApps" :key="app.id">
        <el-card shadow="hover" class="miniapp-card" @click="openApp(app)">
          <div class="card-icon">
            <el-icon :size="60" :color="app.color">
              <component :is="app.icon" />
            </el-icon>
          </div>
          <h3 class="card-title">{{ app.name }}</h3>
          <p class="card-desc">{{ app.description }}</p>
          <div class="card-footer">
            <el-tag :type="app.type" size="small">
              {{ app.category }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="miniApps.length === 0" description="暂无小程序" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ChatDotSquare,
  Document,
  Search,
  Calendar,
  ShoppingCart,
  Picture
} from '@element-plus/icons-vue'

const router = useRouter()

// 小程序列表数据
const miniApps = ref([
  {
    id: 1,
    name: 'DeepSeek对话',
    description: '智能AI对话助手，支持多轮对话和知识问答',
    icon: ChatDotSquare,
    color: '#409EFF',
    category: 'AI工具',
    type: 'primary',
    link: 'deepSeekChat'
  },
  {
    id: 2,
    name: '百度翻译',
    description: '支持多语言翻译，提供专业准确的翻译服务',
    icon: Document,
    color: '#67C23A',
    category: '实用工具',
    type: 'success',
    link: 'https://fanyi.baidu.com/mtpe-individual/multimodal?#/'
  },
  {
    id: 3,
    name: '百度一下',
    description: '全球最大的中文搜索引擎，快速找到所需信息',
    icon: Search,
    color: '#E6A23C',
    category: '搜索引擎',
    type: 'warning',
    link: 'https://www.baidu.com/index.htm'
  },
  {
    id: 4,
    name: '日程管理',
    description: '个人日程安排和任务提醒工具',
    icon: Calendar,
    color: '#F56C6C',
    category: '效率工具',
    type: 'danger',
    link: 'https://example.com/calendar'
  },
  {
    id: 5,
    name: '订单系统',
    description: '订单管理系统，支持订单查询、处理和统计',
    icon: ShoppingCart,
    color: '#909399',
    category: '管理系统',
    type: 'info',
    link: 'https://example.com/orders'
  },
  {
    id: 6,
    name: '相册管理',
    description: '照片云存储和管理，支持分类和分享',
    icon: Picture,
    color: '#409EFF',
    category: '存储工具',
    type: 'primary',
    link: 'https://example.com/photos'
  }
])

// 打开应用
const openApp = (app: any) => {
  if (app.link === 'deepSeekChat') {
    // 跳转到 DeepSeek 对话页面
    router.push('/index/deepseek')
    ElMessage.success(`正在打开 ${app.name}`)
  } else if (app.link.startsWith('http')) {
    // 外部链接在新窗口打开
    window.open(app.link, '_blank')
    ElMessage.info(`正在新窗口打开 ${app.name}`)
  } else {
    ElMessage.info(`${app.name} 功能开发中...`)
  }
}
</script>

<style scoped lang="sass">
.miniapp-container
  padding: 20px
  background: #f5f7fa
  min-height: 100%

  .header-card
    margin-bottom: 20px
    text-align: center

    .page-title
      font-size: 28px
      color: #2c5282
      margin: 0 0 10px 0
      font-family: xiaxingkai, cursive

    .page-desc
      color: #718096
      margin: 0
      font-size: 14px

  .miniapp-grid
    margin-top: 20px

  .miniapp-card
    margin-bottom: 20px
    transition: all 0.3s
    text-align: center
    cursor: pointer

    &:hover
      transform: translateY(-8px)
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2)

    .card-icon
      margin-bottom: 15px

    .card-title
      font-size: 18px
      font-weight: 600
      color: #2d3748
      margin: 10px 0

    .card-desc
      font-size: 14px
      color: #718096
      line-height: 1.6
      min-height: 60px
      margin: 10px 0

    .card-footer
      margin-top: 15px
      padding-top: 15px
      border-top: 1px solid #e2e8f0
</style>
