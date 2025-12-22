<template>
  <div class="my-records-container">
    <!-- 列表视图 -->
    <div v-if="!showDetail" class="list-view">
      <div class="header">
        <h3>我的记录</h3>
        <span class="count">共 {{ total }} 条记录</span>
      </div>

      <el-scrollbar class="list-scrollbar" v-loading="loading">
        <div class="record-list">
          <el-card
            v-for="record in recordList"
            :key="record.id"
            class="record-item"
            shadow="hover"
            @click="viewDetail(record)"
          >
            <div class="record-header">
              <h4 class="record-title">{{ record.title }}</h4>
              <el-tag :type="getStatusType(record.status)" size="small">
                {{ getStatusText(record.status) }}
              </el-tag>
            </div>
            <p class="record-summary">{{ record.intro || '暂无简介' }}</p>
            <div class="record-footer">
              <span class="record-time">
                <el-icon><Clock /></el-icon>
                {{ formatDate(record.updateTime) }}
              </span>
            </div>
          </el-card>

          <el-empty v-if="!loading && recordList.length === 0" description="暂无记录" />
        </div>
      </el-scrollbar>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 详情编辑视图 -->
    <div v-else class="detail-view">
      <div class="detail-header">
        <el-button type="primary" :icon="ArrowLeft" @click="backToList">
          返回列表
        </el-button>
        <div class="detail-actions">
          <el-button type="success" @click="saveRecord">保存</el-button>
          <el-button type="danger" @click="deleteRecord">删除</el-button>
        </div>
      </div>

      <el-card class="detail-card">
        <div class="detail-content">
          <el-form :model="currentRecord" label-width="80px">
            <el-form-item label="标题">
              <el-input
                v-model="currentRecord.title"
                placeholder="请输入标题"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="状态">
              <el-select v-model="currentRecord.status" placeholder="请选择状态">
                <el-option label="草稿" :value="0" />
                <el-option label="已发布" :value="1" />
              </el-select>
            </el-form-item>

            <el-form-item label="简介">
              <el-input
                v-model="currentRecord.intro"
                type="textarea"
                :rows="3"
                placeholder="请输入简介"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="正文">
              <div
                ref="editorRef"
                class="editor-content"
                contenteditable="true"
                v-html="currentRecord.content"
                @input="handleContentInput"
              ></div>
            </el-form-item>

            <el-form-item label="更新时间">
              <el-input :value="formatDate(currentRecord.updateTime)" disabled />
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock, ArrowLeft } from '@element-plus/icons-vue'
import { listArticle, type Article } from '../../api/article'

// 分页数据
const page = ref(1)
const size = ref(10)
const total = ref(0)
const loading = ref(false)

// 记录数据
const recordList = ref<Article[]>([])
const showDetail = ref(false)
const currentRecord = ref<Article | null>(null)
const editorRef = ref<HTMLDivElement | null>(null)

// 获取文章列表
const fetchArticleList = async () => {
  loading.value = true
  try {
    const result = await listArticle(page.value, size.value)
    if (result) {
      recordList.value = result.records
      total.value = result.total
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

// 页码改变
const handlePageChange = (newPage: number) => {
  page.value = newPage
  fetchArticleList()
}

// 每页大小改变
const handleSizeChange = (newSize: number) => {
  size.value = newSize
  page.value = 1  // 重置到第一页
  fetchArticleList()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchArticleList()
})

// 查看详情
const viewDetail = (record: Article) => {
  currentRecord.value = { ...record }
  showDetail.value = true
}

// 返回列表
const backToList = () => {
  showDetail.value = false
  currentRecord.value = null
}

// 处理内容输入
const handleContentInput = () => {
  if (editorRef.value && currentRecord.value) {
    currentRecord.value.content = editorRef.value.innerHTML
  }
}

// 保存记录
const saveRecord = () => {
  if (!currentRecord.value) return

  if (!currentRecord.value.title.trim()) {
    ElMessage.warning('请输入标题')
    return
  }

  ElMessageBox.confirm('确定要保存修改吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    // TODO: 调用更新文章接口
    ElMessage.success('保存成功')
    fetchArticleList()  // 重新获取列表
    backToList()
  }).catch(() => {
    ElMessage.info('已取消保存')
  })
}

// 删除记录
const deleteRecord = () => {
  if (!currentRecord.value) return

  ElMessageBox.confirm('确定要删除这条记录吗？此操作不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用删除文章接口
    ElMessage.success('删除成功')
    fetchArticleList()  // 重新获取列表
    backToList()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 获取状态类型
const getStatusType = (status: number) => {
  const typeMap: Record<number, any> = {
    0: 'info',      // 暂存
    1: 'success',   // 已发布
    [-1]: 'warning' // 已删除
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    0: '草稿',
    1: '已发布',
    [-1]: '已删除'
  }
  return textMap[status] || '未知'
}
</script>

<style scoped lang="sass">
.my-records-container
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

      .count
        color: #718096
        font-size: 14px

    .list-scrollbar
      flex: 1
      height: 0

    .record-list
      padding: 0 20px 20px

      .record-item
        margin-bottom: 15px
        cursor: pointer
        transition: all 0.3s

        &:hover
          transform: translateY(-3px)
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)

        .record-header
          display: flex
          justify-content: space-between
          align-items: center
          margin-bottom: 10px

          .record-title
            margin: 0
            color: #2d3748
            font-size: 16px
            font-weight: 600

        .record-summary
          color: #718096
          font-size: 14px
          line-height: 1.6
          margin: 10px 0
          overflow: hidden
          text-overflow: ellipsis
          display: -webkit-box
          -webkit-line-clamp: 2
          -webkit-box-orient: vertical

        .record-footer
          display: flex
          justify-content: space-between
          align-items: center
          padding-top: 10px
          border-top: 1px solid #e2e8f0

          .record-time
            display: flex
            align-items: center
            gap: 5px
            color: #a0aec0
            font-size: 13px

            .el-icon
              font-size: 14px

    .pagination-container
      padding: 20px
      background: white
      border-radius: 8px
      display: flex
      justify-content: center

  .detail-view
    height: 100%
    display: flex
    flex-direction: column

    .detail-header
      display: flex
      justify-content: space-between
      align-items: center
      padding: 20px
      background: white
      border-radius: 8px
      margin-bottom: 20px

      .detail-actions
        display: flex
        gap: 10px

    .detail-card
      flex: 1
      overflow: auto

      .detail-content
        .editor-content
          min-height: 300px
          padding: 15px
          border: 1px solid #dcdfe6
          border-radius: 4px
          background: white
          outline: none
          font-size: 14px
          line-height: 1.8

          &:focus
            border-color: #409eff

          &:empty:before
            content: "请输入正文内容..."
            color: #c0c4cc

// 富文本编辑器内容样式
::v-deep .editor-content
  p
    margin: 0 0 10px 0

  ul, ol
    margin: 10px 0
    padding-left: 30px

  strong
    font-weight: bold

  em
    font-style: italic

  u
    text-decoration: underline
</style>
