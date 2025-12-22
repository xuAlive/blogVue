<template>
  <div class="deepseek-container">
    <el-container class="chat-layout">
      <!-- 左侧历史对话列表 -->
      <el-aside width="280px" class="history-aside">
        <div class="history-header">
          <h3>历史对话</h3>
          <el-button type="primary" size="small" @click="startNewChat" icon="Plus">
            新对话
          </el-button>
        </div>

        <el-scrollbar class="history-scrollbar">
          <div class="history-list">
            <div
              v-for="history in historyList"
              :key="history.dialogueId"
              class="history-item"
              :class="{ active: currentDialogueId === history.dialogueId }"
              @click="loadHistory(history.dialogueId)"
            >
              <div class="history-content">
                {{ history.content }}
              </div>
            </div>

            <el-empty
              v-if="historyList.length === 0"
              description="暂无历史对话"
              :image-size="80"
            />
          </div>
        </el-scrollbar>
      </el-aside>

      <!-- 右侧对话区域 -->
      <el-main class="chat-main">
        <div class="chat-content">
          <!-- 消息列表 -->
          <el-scrollbar ref="scrollbarRef" class="message-scrollbar">
            <div class="message-list">
              <div
                v-for="(message, index) in messages"
                :key="index"
                class="message-item"
                :class="message.role"
              >
                <div class="message-avatar">
                  <el-avatar v-if="message.role === 'user'" :size="36">
                    用户
                  </el-avatar>
                  <el-avatar v-else :size="36" style="background-color: #409eff">
                    AI
                  </el-avatar>
                </div>
                <div class="message-bubble">
                  <div class="message-content markdown-body" v-html="renderMarkdown(message.content)"></div>
                </div>
              </div>

              <!-- 加载中状态 -->
              <div v-if="loading" class="message-item assistant">
                <div class="message-avatar">
                  <el-avatar :size="36" style="background-color: #409eff">
                    AI
                  </el-avatar>
                </div>
                <div class="message-bubble">
                  <div class="message-content typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>

              <el-empty
                v-if="messages.length === 0 && !loading"
                description="开始新的对话吧"
                :image-size="120"
              />
            </div>
          </el-scrollbar>

          <!-- 输入框 -->
          <div class="input-area">
            <el-input
              v-model="inputContent"
              type="textarea"
              :rows="3"
              placeholder="请输入消息内容，按 Enter 发送，Shift + Enter 换行"
              :disabled="loading"
              @keydown.enter="handleKeyDown"
              class="chat-input"
            />
            <div class="input-actions">
              <span class="input-tip">Enter 发送 / Shift + Enter 换行</span>
              <el-button
                type="primary"
                @click="sendMessage"
                :loading="loading"
                :disabled="!inputContent.trim()"
              >
                发送
              </el-button>
            </div>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import {
  getCompletionHistoryList,
  getCompletionList,
  sendCompletion,
  type DialogueHistory,
  type Message
} from '../../../api/deepseek'

// 初始化 Markdown 渲染器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

// 渲染 Markdown 内容
const renderMarkdown = (content: string) => {
  return md.render(content)
}

// 数据状态
const historyList = ref<DialogueHistory[]>([])
const messages = ref<Message[]>([])
const inputContent = ref('')
const loading = ref(false)
const currentDialogueId = ref<number | null>(null)
const scrollbarRef = ref()

// 加载历史对话列表
const loadHistoryList = async () => {
  const list = await getCompletionHistoryList()
  historyList.value = list
}

// 加载指定对话的消息
const loadHistory = async (dialogueId: number) => {
  currentDialogueId.value = dialogueId
  const messageList = await getCompletionList(dialogueId)
  messages.value = messageList
  scrollToBottom()
}

// 开始新对话
const startNewChat = () => {
  currentDialogueId.value = null
  messages.value = []
  inputContent.value = ''
}

// 发送消息
const sendMessage = async () => {
  if (!inputContent.value.trim() || loading.value) return

  const content = inputContent.value.trim()

  // 添加用户消息到界面
  messages.value.push({
    role: 'user',
    content: content
  })

  inputContent.value = ''
  loading.value = true
  scrollToBottom()

  try {
    // 调用 API 发送消息
    const response = await sendCompletion(content, currentDialogueId.value)

    if (response) {
      // 如果是新对话，保存对话ID
      if (!currentDialogueId.value) {
        currentDialogueId.value = response.dialogueId
        // 重新加载历史列表
        await loadHistoryList()
      }

      // 添加 AI 回复到界面
      messages.value.push({
        role: 'assistant',
        content: response.content,
        dialogueId: response.dialogueId
      })

      scrollToBottom()
    }
  } catch (error) {
    console.error('发送消息失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // Shift + Enter 换行，单独 Enter 发送
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (scrollbarRef.value) {
    const scrollElement = scrollbarRef.value.$refs.wrap
    scrollElement.scrollTop = scrollElement.scrollHeight
  }
}

// 页面加载时获取历史列表
onMounted(() => {
  loadHistoryList()
})
</script>

<style scoped lang="scss">
// 导入代码高亮样式
@import 'highlight.js/styles/github-dark.css';

.deepseek-container {
  height: calc(100vh - 40px);  // 视口高度减去可能的边距
  max-height: calc(100vh - 40px);
  padding: 20px;
  background: #f5f7fa;
  overflow: hidden;  // 防止整体页面滚动

  .chat-layout {
    height: 100%;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;  // 防止内容溢出
  }

  .history-aside {
    border-right: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    height: 100%;

    .history-header {
      padding: 20px;
      border-bottom: 1px solid #e4e7ed;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;  // 防止压缩

      h3 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }
    }

    .history-scrollbar {
      flex: 1;
      height: 0;
      overflow: hidden;
    }

    .history-list {
      padding: 10px;

      .history-item {
        padding: 12px 15px;
        margin-bottom: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
        background: #f5f7fa;

        &:hover {
          background: #e4e7ed;
        }

        &.active {
          background: #409eff;
          color: white;
        }

        .history-content {
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .chat-main {
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    .chat-content {
      height: 100%;
      display: flex;
      flex-direction: column;

      .message-scrollbar {
        flex: 1;
        height: 0;
        padding: 20px;
        overflow: hidden;
      }

      .message-list {
        .message-item {
          display: flex;
          margin-bottom: 20px;
          align-items: flex-start;

          &.user {
            flex-direction: row-reverse;

            .message-bubble {
              background: #409eff;
              color: white;
              margin-right: 12px;
              margin-left: 0;
            }
          }

          &.assistant {
            .message-bubble {
              background: #f4f4f5;
              color: #303133;
              margin-left: 12px;
            }
          }

          .message-avatar {
            flex-shrink: 0;
          }

          .message-bubble {
            max-width: 60%;
            padding: 12px 16px;
            border-radius: 8px;
            word-break: break-word;
            line-height: 1.6;

            .message-content {
              font-size: 14px;

              &.typing {
                display: flex;
                gap: 4px;

                span {
                  width: 8px;
                  height: 8px;
                  background: #909399;
                  border-radius: 50%;
                  animation: typing 1.4s infinite;

                  &:nth-child(2) {
                    animation-delay: 0.2s;
                  }

                  &:nth-child(3) {
                    animation-delay: 0.4s;
                  }
                }
              }
            }
          }
        }
      }

      .input-area {
        border-top: 1px solid #e4e7ed;
        padding: 20px;
        background: #fafafa;
        flex-shrink: 0;  // 防止被压缩

        .chat-input {
          margin-bottom: 12px;
        }

        .input-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .input-tip {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

// Markdown 样式
.markdown-body {
  line-height: 1.8;

  // 标题样式
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    line-height: 1.4;
  }

  :deep(h1) { font-size: 1.8em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
  :deep(h2) { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 6px; }
  :deep(h3) { font-size: 1.25em; }
  :deep(h4) { font-size: 1.1em; }
  :deep(h5) { font-size: 1em; }
  :deep(h6) { font-size: 0.9em; color: #6a737d; }

  // 段落样式
  :deep(p) {
    margin-top: 0;
    margin-bottom: 12px;
  }

  // 列表样式
  :deep(ul), :deep(ol) {
    margin-top: 0;
    margin-bottom: 12px;
    padding-left: 2em;
  }

  :deep(li) {
    margin-bottom: 4px;
  }

  // 代码块样式
  :deep(pre) {
    background: #282c34;
    border-radius: 6px;
    padding: 16px;
    overflow-x: auto;
    margin: 12px 0;

    code {
      background: transparent;
      padding: 0;
      font-size: 13px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    }
  }

  // 行内代码样式
  :deep(code) {
    background: #f6f8fa;
    border-radius: 3px;
    padding: 2px 6px;
    font-size: 0.9em;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    color: #e83e8c;
  }

  // 引用块样式
  :deep(blockquote) {
    border-left: 4px solid #dfe2e5;
    padding: 0 16px;
    margin: 12px 0;
    color: #6a737d;
  }

  // 表格样式
  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;

    th, td {
      border: 1px solid #dfe2e5;
      padding: 8px 13px;
    }

    th {
      background: #f6f8fa;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: #f6f8fa;
    }
  }

  // 链接样式
  :deep(a) {
    color: #0366d6;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  // 分割线样式
  :deep(hr) {
    border: none;
    border-top: 2px solid #eaecef;
    margin: 24px 0;
  }

  // 图片样式
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 8px 0;
  }

  // 强调样式
  :deep(strong) {
    font-weight: 600;
  }

  :deep(em) {
    font-style: italic;
  }
}

// 用户消息的 Markdown 样式（白色背景）
.message-item.user {
  .markdown-body {
    :deep(code) {
      background: rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.9);
    }

    :deep(pre) {
      background: rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
