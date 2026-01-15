<template>
  <div class="zhihu-editor-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="left-actions">
        <span class="brand">新作发布</span>
      </div>
      <div class="right-actions">
        <el-button @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="showPublishDialog" :loading="publishing">
          发布
        </el-button>
      </div>
    </div>

    <!-- 主编辑区域 -->
    <div class="editor-main">
      <!-- 标题输入 -->
      <div class="title-input-wrapper">
        <input
          v-model="blogTitle"
          type="text"
          class="title-input"
          placeholder="请输入标题（最多100字）"
          maxlength="100"
        />
        <span class="title-count">{{ blogTitle.length }}/100</span>
      </div>

      <!-- wangeditor 编辑器 -->
      <div class="editor-wrapper">
        <Toolbar
          class="toolbar"
          :editor="editorRef"
          :defaultConfig="toolbarConfig"
          mode="default"
        />
        <Editor
          class="editor"
          v-model="valueHtml"
          :defaultConfig="editorConfig"
          mode="default"
          @onCreated="handleCreated"
          @onChange="handleChange"
        />
      </div>
    </div>

    <!-- 发布设置弹窗 -->
    <el-dialog
      v-model="publishDialogVisible"
      title="发布设置"
      width="560px"
      :close-on-click-modal="false"
    >
      <div class="publish-settings">
        <!-- 文章简介 -->
        <div class="setting-item">
          <label class="setting-label">
            <span class="required">*</span>
            编写摘要
          </label>
          <el-input
            v-model="blogIntro"
            type="textarea"
            :rows="4"
            placeholder="摘要会展示在文章列表，帮助读者快速了解内容（最多200字）"
            maxlength="200"
            show-word-limit
          />
        </div>

        <!-- 封面设置 -->
        <div class="setting-item">
          <label class="setting-label">添加封面</label>
          <div class="cover-upload">
            <el-upload
              class="cover-uploader"
              :show-file-list="false"
              :before-upload="beforeCoverUpload"
              accept="image/*"
            >
              <div v-if="coverImage" class="cover-preview">
                <img :src="coverImage" alt="封面" />
                <div class="cover-actions">
                  <el-icon @click.stop="removeCover"><Delete /></el-icon>
                </div>
              </div>
              <div v-else class="cover-placeholder">
                <el-icon><Plus /></el-icon>
                <span>上传封面</span>
              </div>
            </el-upload>
            <div class="cover-tips">
              <p>建议尺寸：900 x 500</p>
              <p>支持 jpg、png 格式</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="publishDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handlePublish" :loading="publishing">
            确认发布
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css'
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { saveDraft as saveDraftApi, publishArticle } from '../../api/article'

// 编辑器实例
const editorRef = shallowRef<IDomEditor>()

// 文章数据
const blogTitle = ref('')
const blogIntro = ref('')
const valueHtml = ref('')
const coverImage = ref('')

// 状态
const saving = ref(false)
const publishing = ref(false)
const publishDialogVisible = ref(false)

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: [
    'group-video',
    'fullScreen'
  ]
}

// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '开始你的创作...',
  MENU_CONF: {
    uploadImage: {
      // 图片上传配置（这里使用 base64）
      customUpload: (file: File, insertFn: any) => {
        const reader = new FileReader()
        reader.onload = () => {
          insertFn(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }
}

// 编辑器创建完成
const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
  loadDraft()
}

// 内容变化时自动保存草稿到本地
let autoSaveTimer: number | null = null
const handleChange = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = window.setTimeout(() => {
    saveLocalDraft()
  }, 3000)
}

// 保存草稿到本地存储
const saveLocalDraft = () => {
  try {
    const draftData = {
      title: blogTitle.value,
      intro: blogIntro.value,
      content: valueHtml.value,
      cover: coverImage.value,
      updateTime: new Date().toISOString()
    }
    localStorage.setItem('blog_draft', JSON.stringify(draftData))
  } catch (error) {
    console.error('保存草稿失败:', error)
  }
}

// 加载本地草稿
const loadDraft = () => {
  try {
    const draft = localStorage.getItem('blog_draft')
    if (draft) {
      const draftData = JSON.parse(draft)
      blogTitle.value = draftData.title || ''
      blogIntro.value = draftData.intro || ''
      valueHtml.value = draftData.content || ''
      coverImage.value = draftData.cover || ''
      if (draftData.title || draftData.content) {
        ElMessage.info('已加载上次保存的草稿')
      }
    }
  } catch (error) {
    console.error('加载草稿失败:', error)
  }
}

// 清除本地草稿
const clearDraft = () => {
  try {
    localStorage.removeItem('blog_draft')
  } catch (error) {
    console.error('清除草稿失败:', error)
  }
}

// 封面上传前处理
const beforeCoverUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }

  // 转为 base64
  const reader = new FileReader()
  reader.onload = () => {
    coverImage.value = reader.result as string
  }
  reader.readAsDataURL(file)
  return false
}

// 移除封面
const removeCover = () => {
  coverImage.value = ''
}

// 保存草稿到后端
const handleSaveDraft = async () => {
  if (!blogTitle.value.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  const textContent = editorRef.value?.getText() || ''
  if (!textContent.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  saving.value = true
  saveLocalDraft()

  const imgArray = coverImage.value ? [coverImage.value] : []
  const success = await saveDraftApi(
    blogTitle.value,
    valueHtml.value,
    blogIntro.value,
    imgArray
  )

  saving.value = false
  if (success) {
    ElMessage.success('草稿保存成功')
  }
}

// 显示发布弹窗
const showPublishDialog = () => {
  if (!blogTitle.value.trim()) {
    ElMessage.warning('请输入文章标题')
    return
  }

  const textContent = editorRef.value?.getText() || ''
  if (!textContent.trim()) {
    ElMessage.warning('请输入文章内容')
    return
  }

  // 自动生成简介（如果没有填写）
  if (!blogIntro.value.trim()) {
    blogIntro.value = textContent.slice(0, 150).replace(/\s+/g, ' ').trim()
  }

  publishDialogVisible.value = true
}

// 发布文章
const handlePublish = async () => {
  if (!blogIntro.value.trim()) {
    ElMessage.warning('请编写文章摘要')
    return
  }

  publishing.value = true

  const imgArray = coverImage.value ? [coverImage.value] : []
  const success = await publishArticle(
    blogTitle.value,
    valueHtml.value,
    blogIntro.value,
    imgArray
  )

  publishing.value = false

  if (success) {
    publishDialogVisible.value = false
    // 清空内容
    blogTitle.value = ''
    blogIntro.value = ''
    valueHtml.value = ''
    coverImage.value = ''
    clearDraft()

    ElMessage.success('文章发布成功!')
  }
}

// 组件销毁前清理
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) {
    editor.destroy()
  }
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})
</script>

<style scoped lang="scss">
.zhihu-editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  // 顶部操作栏
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    border-bottom: 1px solid #f0f0f0;
    background: #fff;

    .left-actions {
      .brand {
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
      }
    }

    .right-actions {
      display: flex;
      gap: 12px;
    }
  }

  // 主编辑区域
  .editor-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
    padding: 24px 48px;
    overflow: hidden;

    // 标题输入
    .title-input-wrapper {
      position: relative;
      margin-bottom: 24px;

      .title-input {
        width: 100%;
        font-size: 28px;
        font-weight: 600;
        color: #1a1a1a;
        border: none;
        outline: none;
        padding: 8px 0;
        border-bottom: 2px solid transparent;
        transition: border-color 0.3s;

        &::placeholder {
          color: #bfbfbf;
          font-weight: 400;
        }

        &:focus {
          border-bottom-color: #1890ff;
        }
      }

      .title-count {
        position: absolute;
        right: 0;
        bottom: 12px;
        font-size: 12px;
        color: #bfbfbf;
      }
    }

    // 编辑器容器
    .editor-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      overflow: hidden;

      .toolbar {
        border-bottom: 1px solid #e8e8e8;
        background: #fafafa;
      }

      .editor {
        flex: 1;
        overflow-y: auto;
      }
    }
  }

  // 发布设置弹窗
  .publish-settings {
    .setting-item {
      margin-bottom: 24px;

      &:last-child {
        margin-bottom: 0;
      }

      .setting-label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #1a1a1a;

        .required {
          color: #ff4d4f;
          margin-right: 4px;
        }
      }
    }

    .cover-upload {
      display: flex;
      gap: 16px;

      .cover-uploader {
        width: 180px;
        height: 100px;

        :deep(.el-upload) {
          width: 100%;
          height: 100%;
        }
      }

      .cover-preview {
        position: relative;
        width: 180px;
        height: 100px;
        border-radius: 4px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cover-actions {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;

          .el-icon {
            font-size: 24px;
            color: #fff;
            cursor: pointer;
          }
        }

        &:hover .cover-actions {
          opacity: 1;
        }
      }

      .cover-placeholder {
        width: 180px;
        height: 100px;
        border: 1px dashed #d9d9d9;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #bfbfbf;
        cursor: pointer;
        transition: border-color 0.3s;

        &:hover {
          border-color: #1890ff;
          color: #1890ff;
        }

        .el-icon {
          font-size: 24px;
          margin-bottom: 4px;
        }

        span {
          font-size: 12px;
        }
      }

      .cover-tips {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;

        p {
          margin: 0;
          font-size: 12px;
          color: #8c8c8c;
          line-height: 1.8;
        }
      }
    }
  }
}

// wangeditor 编辑器样式覆盖
:deep(.w-e-text-container) {
  background: #fff;

  [data-slate-editor] {
    padding: 20px 24px;
    min-height: 400px;

    p {
      margin: 0 0 16px 0;
      line-height: 1.8;
      font-size: 16px;
      color: #1a1a1a;
    }

    h1, h2, h3, h4, h5, h6 {
      margin: 24px 0 16px 0;
      font-weight: 600;
      color: #1a1a1a;
    }

    blockquote {
      margin: 16px 0;
      padding: 12px 16px;
      background: #f7f7f7;
      border-left: 4px solid #1890ff;
      color: #595959;
    }

    ul, ol {
      margin: 16px 0;
      padding-left: 24px;
    }

    img {
      max-width: 100%;
      border-radius: 4px;
    }

    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      font-size: 14px;
    }

    pre {
      background: #282c34;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;

      code {
        background: transparent;
        color: #abb2bf;
        padding: 0;
      }
    }
  }
}

:deep(.w-e-toolbar) {
  background: #fafafa !important;
  border-bottom: 1px solid #e8e8e8 !important;
}
</style>
