<template>
  <div class="zhihu-home">
    <!-- 顶部导航栏 -->
    <div class="header">
      <h1 class="title">博客广场</h1>
      <div class="search-box">
        <el-input
          v-model="searchTitle"
          placeholder="搜索文章..."
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <el-button type="primary" @click="goToPublish" class="publish-btn">
        <el-icon><EditPen /></el-icon>
        写文章
      </el-button>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧博客列表 -->
      <div class="feed-list" v-loading="loading">
        <div
          v-for="article in blogList"
          :key="article.id"
          class="feed-item"
          @click="goToDetail(article.id)"
        >
          <div class="feed-content">
            <!-- 作者信息 -->
            <div class="author-info">
              <el-avatar :size="24" class="avatar">
                {{ (article.account || 'U').charAt(0).toUpperCase() }}
              </el-avatar>
              <span class="author-name">{{ article.account }}</span>
              <span class="separator">·</span>
              <span class="publish-time">{{ formatTime(article.createTime) }}</span>
            </div>

            <!-- 文章标题 -->
            <h2 class="article-title">{{ article.title }}</h2>

            <!-- 文章摘要 -->
            <p class="article-excerpt">
              {{ article.intro || getExcerpt(article.content) }}
            </p>

            <!-- 底部操作栏 -->
            <div class="article-actions">
              <span class="action-item">
                <el-icon><View /></el-icon>
                阅读全文
              </span>
            </div>
          </div>

          <!-- 右侧封面图 -->
          <div v-if="getCoverImage(article.img)" class="feed-cover">
            <img :src="getCoverImage(article.img)" alt="封面" />
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="blogList.length === 0 && !loading" description="暂无文章">
          <el-button type="primary" @click="goToPublish">发布第一篇文章</el-button>
        </el-empty>

        <!-- 分页 -->
        <div class="pagination" v-if="total > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="handlePageChange"
            background
          />
        </div>
      </div>

      <!-- 右侧评论区 -->
      <div class="sidebar">
        <div class="sidebar-card">
          <div class="card-header">
            <span class="card-title">最新评论</span>
            <el-badge :value="commentList.length" :max="99" />
          </div>

          <div class="comments-list">
            <div
              v-for="comment in commentList"
              :key="comment.id"
              class="comment-item"
              @click="goToDetail(comment.articleId)"
            >
              <el-avatar :size="32" class="comment-avatar">
                {{ (comment.commenterName || comment.commenterAccount || 'U').charAt(0) }}
              </el-avatar>
              <div class="comment-body">
                <div class="comment-meta">
                  <span class="commenter">{{ comment.commenterName || comment.commenterAccount }}</span>
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                </div>
                <p class="comment-text">{{ comment.content }}</p>
                <div class="comment-source">
                  <el-icon><Document /></el-icon>
                  {{ truncate(comment.articleTitle, 20) }}
                </div>
              </div>
            </div>
            <el-empty v-if="commentList.length === 0" description="暂无评论" :image-size="60" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, EditPen, View, Document } from '@element-plus/icons-vue'
import { listPublicArticles, Article } from '../../api/article'
import { listLatestComments, Comment } from '../../api/comment'

const router = useRouter()

// 搜索和分页
const searchTitle = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 博客列表数据
const blogList = ref<Article[]>([])

// 评论列表数据
const commentList = ref<Comment[]>([])

// 加载博客列表
const loadBlogList = async () => {
  loading.value = true
  try {
    const result = await listPublicArticles(currentPage.value, pageSize.value, searchTitle.value || undefined)
    if (result) {
      blogList.value = result.records
      total.value = result.total
    }
  } finally {
    loading.value = false
  }
}

// 加载最新评论
const loadComments = async () => {
  commentList.value = await listLatestComments(10)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadBlogList()
}

// 分页
const handlePageChange = () => {
  loadBlogList()
  // 滚动到顶部
  document.querySelector('.feed-list')?.scrollTo(0, 0)
}

// 获取封面图
const getCoverImage = (img: string | null) => {
  if (!img) return null
  try {
    const images = JSON.parse(img)
    return images && images.length > 0 ? images[0] : null
  } catch {
    return null
  }
}

// 获取文章摘要（从内容中提取）
const getExcerpt = (content: string) => {
  if (!content) return '暂无摘要'
  // 移除 HTML 标签
  const text = content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
  return text.length > 120 ? text.slice(0, 120) + '...' : text
}

// 截断文本
const truncate = (text: string, length: number) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now.getTime() - time.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  if (days < 30) return `${Math.floor(days / 7)} 周前`

  const year = time.getFullYear()
  const month = String(time.getMonth() + 1).padStart(2, '0')
  const day = String(time.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 跳转到文章详情
const goToDetail = (id: number) => {
  router.push(`/index/articleDetail/${id}`)
}

// 跳转到发布页
const goToPublish = () => {
  router.push('/index/blogInfo')
}

onMounted(() => {
  loadBlogList()
  loadComments()
})
</script>

<style scoped lang="scss">
.zhihu-home {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f6f6f6;

  // 顶部导航栏
  .header {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;

    .title {
      font-size: 24px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
      font-family: xiaxingkai, cursive;
    }

    .search-box {
      flex: 1;
      max-width: 400px;
      margin: 0 32px;

      .search-input {
        :deep(.el-input__wrapper) {
          background: #f6f6f6;
          border-radius: 20px;
          box-shadow: none;

          &:hover, &:focus-within {
            background: #fff;
            box-shadow: 0 0 0 1px #1890ff;
          }
        }
      }
    }

    .publish-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 20px;
      padding: 10px 20px;
    }
  }

  // 主内容区域
  .main-content {
    flex: 1;
    display: flex;
    gap: 24px;
    padding: 24px;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    overflow: hidden;

    // 左侧文章列表
    .feed-list {
      flex: 1;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #d9d9d9;
        border-radius: 3px;
      }

      // 文章卡片
      .feed-item {
        display: flex;
        gap: 16px;
        padding: 20px;
        background: #fff;
        border-radius: 4px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: box-shadow 0.2s;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

          .article-title {
            color: #1890ff;
          }
        }

        .feed-content {
          flex: 1;
          min-width: 0;

          .author-info {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-size: 13px;
            color: #8590a6;

            .avatar {
              background: #1890ff;
              color: #fff;
              font-size: 12px;
            }

            .author-name {
              color: #1a1a1a;
              font-weight: 500;
            }

            .separator {
              color: #d9d9d9;
            }
          }

          .article-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 0 0 10px 0;
            line-height: 1.5;
            transition: color 0.2s;

            // 限制两行
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .article-excerpt {
            font-size: 14px;
            color: #8590a6;
            line-height: 1.7;
            margin: 0 0 12px 0;

            // 限制两行
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .article-actions {
            display: flex;
            align-items: center;
            gap: 24px;

            .action-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 13px;
              color: #8590a6;
              transition: color 0.2s;

              &:hover {
                color: #1890ff;
              }
            }
          }
        }

        .feed-cover {
          width: 160px;
          height: 108px;
          flex-shrink: 0;
          border-radius: 4px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .pagination {
        text-align: center;
        padding: 24px 0;
      }
    }

    // 右侧边栏
    .sidebar {
      width: 300px;
      flex-shrink: 0;

      .sidebar-card {
        background: #fff;
        border-radius: 4px;
        overflow: hidden;

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;

          .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
          }
        }

        .comments-list {
          max-height: 500px;
          overflow-y: auto;

          &::-webkit-scrollbar {
            width: 4px;
          }

          &::-webkit-scrollbar-thumb {
            background: #d9d9d9;
            border-radius: 2px;
          }

          .comment-item {
            display: flex;
            gap: 12px;
            padding: 16px 20px;
            border-bottom: 1px solid #f0f0f0;
            cursor: pointer;
            transition: background 0.2s;

            &:last-child {
              border-bottom: none;
            }

            &:hover {
              background: #fafafa;
            }

            .comment-avatar {
              flex-shrink: 0;
              background: #52c41a;
              color: #fff;
              font-size: 12px;
            }

            .comment-body {
              flex: 1;
              min-width: 0;

              .comment-meta {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 6px;

                .commenter {
                  font-size: 14px;
                  font-weight: 500;
                  color: #1a1a1a;
                }

                .comment-time {
                  font-size: 12px;
                  color: #8590a6;
                }
              }

              .comment-text {
                font-size: 13px;
                color: #595959;
                line-height: 1.6;
                margin: 0 0 8px 0;

                // 限制两行
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }

              .comment-source {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                color: #8590a6;

                .el-icon {
                  font-size: 14px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
