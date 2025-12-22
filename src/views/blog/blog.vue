<template>
  <div class="blog-editor-container">
    <el-card class="editor-card">
      <template #header>
        <div class="card-header">
          <h2>新作发布</h2>
          <span class="subtitle">创作属于你的精彩内容</span>
        </div>
      </template>

      <!-- 标题输入 -->
      <div class="title-section">
        <el-input
          v-model="blogTitle"
          placeholder="请输入文章标题（最多100字）"
          maxlength="100"
          show-word-limit
          size="large"
          clearable
        />
      </div>

      <!-- 编辑器工具栏 -->
      <div class="toolbar">
        <el-button-group>
          <el-tooltip content="加粗" placement="top">
            <el-button @click="execCommand('bold')" size="small">
              <el-icon><strong>B</strong></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="斜体" placement="top">
            <el-button @click="execCommand('italic')" size="small">
              <el-icon><em>I</em></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="下划线" placement="top">
            <el-button @click="execCommand('underline')" size="small">
              <el-icon><u>U</u></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-tooltip content="左对齐" placement="top">
            <el-button @click="execCommand('justifyLeft')" size="small">
              <el-icon><Operation /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="居中对齐" placement="top">
            <el-button @click="execCommand('justifyCenter')" size="small">
              <el-icon><Operation /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="右对齐" placement="top">
            <el-button @click="execCommand('justifyRight')" size="small">
              <el-icon><Operation /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-button-group>
          <el-tooltip content="无序列表" placement="top">
            <el-button @click="execCommand('insertUnorderedList')" size="small">
              <el-icon><List /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="有序列表" placement="top">
            <el-button @click="execCommand('insertOrderedList')" size="small">
              <el-icon><Tickets /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <el-select v-model="fontSize" @change="changeFontSize" size="small" style="width: 100px">
          <el-option label="12px" value="1" />
          <el-option label="14px" value="2" />
          <el-option label="16px" value="3" />
          <el-option label="18px" value="4" />
          <el-option label="24px" value="5" />
          <el-option label="32px" value="6" />
          <el-option label="48px" value="7" />
        </el-select>

        <el-color-picker v-model="textColor" @change="changeTextColor" size="small" />
      </div>

      <!-- 富文本编辑区域 -->
      <div
        ref="editorRef"
        class="editor-content"
        contenteditable="true"
        @input="handleInput"
        @blur="saveDraft"
        placeholder="开始你的创作..."
      ></div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="handleCancel" size="large">
          取消
        </el-button>
        <el-button @click="handleSaveDraft" type="info" size="large">
          暂存
        </el-button>
        <el-button @click="handlePublish" type="primary" size="large">
          发布
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Operation, List, Tickets } from '@element-plus/icons-vue'
import { saveDraft as saveDraftApi, publishArticle } from '../../api/article'

const router = useRouter()

// 编辑器引用
const editorRef = ref<HTMLDivElement | null>(null)

// 文章数据
const blogTitle = ref('')
const fontSize = ref('3')
const textColor = ref('#000000')

// 自动保存定时器
let autoSaveTimer: number | null = null

// 加载草稿
const loadDraft = () => {
  try {
    const draft = localStorage.getItem('blog_draft')
    if (draft) {
      const draftData = JSON.parse(draft)
      blogTitle.value = draftData.title || ''
      if (editorRef.value) {
        editorRef.value.innerHTML = draftData.content || ''
      }
      ElMessage.info('已加载上次保存的草稿')
    }
  } catch (error) {
    console.error('加载草稿失败:', error)
  }
}

// 保存草稿
const saveDraft = () => {
  try {
    const draftData = {
      title: blogTitle.value,
      content: editorRef.value?.innerHTML || '',
      updateTime: new Date().toISOString()
    }
    localStorage.setItem('blog_draft', JSON.stringify(draftData))
  } catch (error) {
    console.error('保存草稿失败:', error)
  }
}

// 清除草稿
const clearDraft = () => {
  try {
    localStorage.removeItem('blog_draft')
  } catch (error) {
    console.error('清除草稿失败:', error)
  }
}

// 执行富文本命令
const execCommand = (command: string, value: string | undefined = undefined) => {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
}

// 改变字体大小
const changeFontSize = () => {
  execCommand('fontSize', fontSize.value)
}

// 改变文字颜色
const changeTextColor = () => {
  execCommand('foreColor', textColor.value)
}

// 处理输入
const handleInput = () => {
  // 自动保存（延迟3秒）
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = window.setTimeout(() => {
    saveDraft()
  }, 3000)
}

// 处理取消
const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要取消吗？未保存的内容将会丢失',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '再想想',
      type: 'warning',
    }
  ).then(() => {
    // 清空内容
    blogTitle.value = ''
    if (editorRef.value) {
      editorRef.value.innerHTML = ''
    }
    clearDraft()
    ElMessage.success('已取消编辑')
  }).catch(() => {
    ElMessage.info('继续编辑')
  })
}

// 处理暂存
const handleSaveDraft = async () => {
  if (!blogTitle.value.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  if (!editorRef.value?.innerText.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  // 先保存到本地草稿
  saveDraft()

  // 调用后端接口保存草稿
  const success = await saveDraftApi(
    blogTitle.value,
    editorRef.value?.innerHTML || ''
  )

  if (success) {
    ElMessage.success('草稿已保存')
  }
}

// 处理发布
const handlePublish = async () => {
  if (!blogTitle.value.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  if (!editorRef.value?.innerText.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  ElMessageBox.confirm(
    '确定要发布这篇文章吗？',
    '发布确认',
    {
      confirmButtonText: '发布',
      cancelButtonText: '取消',
      type: 'success',
    }
  ).then(async () => {
    // 调用后端接口发布文章
    const success = await publishArticle(
      blogTitle.value,
      editorRef.value?.innerHTML || ''
    )

    if (success) {
      // 清空内容和草稿
      blogTitle.value = ''
      if (editorRef.value) {
        editorRef.value.innerHTML = ''
      }
      clearDraft()

      ElMessage.success('文章发布成功！')
      // 可选：跳转到我的记录页面
      // router.push('/index/blogInfo/myRecords')
    }
  }).catch(() => {
    ElMessage.info('已取消发布')
  })
}

// 组件挂载时加载草稿
onMounted(() => {
  loadDraft()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>

<style scoped lang="sass">
.blog-editor-container
  padding: 20px
  min-height: 100%
  background: #f5f7fa

  .editor-card
    max-width: 1200px
    margin: 0 auto

    .card-header
      display: flex
      flex-direction: column
      align-items: center

      h2
        margin: 0 0 5px 0
        color: #2c5282
        font-size: 24px
        font-weight: 600

      .subtitle
        color: #718096
        font-size: 14px

  .title-section
    margin-bottom: 20px

  .toolbar
    display: flex
    align-items: center
    gap: 10px
    padding: 15px
    background: #f8f9fa
    border: 1px solid #e2e8f0
    border-radius: 8px
    margin-bottom: 15px
    flex-wrap: wrap

    .el-divider--vertical
      height: 24px
      margin: 0 5px

  .editor-content
    height: 500px
    overflow-y: auto
    padding: 20px
    background: white
    border: 1px solid #e2e8f0
    border-radius: 8px
    font-size: 16px
    line-height: 1.8
    color: #2d3748
    outline: none
    margin-bottom: 20px

    &:empty:before
      content: attr(placeholder)
      color: #a0aec0

    &:focus
      border-color: #4299e1
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1)

  .action-buttons
    display: flex
    justify-content: flex-end
    gap: 15px
    padding-top: 15px
    border-top: 1px solid #e2e8f0

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
