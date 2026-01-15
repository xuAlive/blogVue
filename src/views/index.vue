<template>
  <div class="index">
    <div class="left">
      <h2>忘川阁</h2>
      <el-menu
          router="true"
          active-text-color="#ffa60f"
          background-color="#314a43"
          :default-active="currentPath"
          class="el-menu-vertical-demo"
      >
        <!-- 动态渲染菜单 -->
        <template v-for="menu in sideMenus" :key="menu.id">
          <!-- 有子菜单的目录 -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="String(menu.id)">
            <template #title>
              <el-icon><component :is="getIconComponent(menu.icon)" /></el-icon>
              <span>{{ menu.menuName }}</span>
            </template>
            <template v-for="child in menu.children" :key="child.id">
              <el-menu-item
                v-if="child.visible === 1"
                :index="child.path"
              >
                {{ child.menuName }}
              </el-menu-item>
            </template>
          </el-sub-menu>
          <!-- 没有子菜单的菜单项 -->
          <el-menu-item
            v-else-if="menu.menuType === 2 && menu.visible === 1"
            :index="menu.path"
          >
            <el-icon><component :is="getIconComponent(menu.icon)" /></el-icon>
            <span>{{ menu.menuName }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </div>
    <div class="right">
      <div class="top"><el-menu
          :ellipsis="false"
          mode="horizontal"
          background-color="#314a43"
          text-color="#fff"
          active-text-color="#ffd04b"
          router="true"
      >
        <!-- 动态渲染顶部菜单（邮件、消息等） -->
        <template v-for="menu in topMenus" :key="menu.id">
          <el-menu-item :index="menu.path">
            <el-icon><component :is="getIconComponent(menu.icon)" /></el-icon>
            {{ menu.menuName }}
          </el-menu-item>
        </template>
        <el-sub-menu index="user-menu">
          <template #title><el-icon><Avatar /></el-icon>{{ userName }}</template>
          <el-menu-item index="feedback">问题反馈</el-menu-item>
          <el-menu-item index="logout" @click="handleLogout">退出登录</el-menu-item>
        </el-sub-menu>

      </el-menu></div>
      <div class="center">
        <router-view></router-view>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { HomeFilled, UserFilled, Tools, Message, ChatDotSquare, Avatar, House, Reading, Cellphone, Bell, Edit, HomeFilled as HomeFilledIcon, User, InfoFilled, Document, Menu as MenuIcon, Lock, Setting } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { clearUserInfo, getUserMenus, getUserInfo } from '../utils/userInfo'
import type { Menu } from '../api/menu'

const router = useRouter()
const route = useRoute()

// 用户菜单数据
const menus = ref<Menu[]>([])

// 当前路径
const currentPath = computed(() => route.path)

// 用户名（优先级：昵称 > 真实姓名 > 账号）
const userName = computed(() => {
  const userInfo = getUserInfo()
  return userInfo?.name || userInfo?.userName || userInfo?.account || '用户'
})

// 图标映射
const iconMap: Record<string, any> = {
  'el-icon-house': markRaw(House),
  'el-icon-home-filled': markRaw(HomeFilled),
  'el-icon-reading': markRaw(Reading),
  'el-icon-cellphone': markRaw(Cellphone),
  'el-icon-chat-dot-round': markRaw(ChatDotSquare),
  'el-icon-message': markRaw(Message),
  'el-icon-bell': markRaw(Bell),
  'el-icon-edit': markRaw(Edit),
  'el-icon-setting': markRaw(Setting),
  'el-icon-user': markRaw(User),
  'el-icon-info-filled': markRaw(InfoFilled),
  'el-icon-document': markRaw(Document),
  'el-icon-menu': markRaw(MenuIcon),
  'el-icon-avatar': markRaw(Avatar),
  'el-icon-lock': markRaw(Lock),
  'el-icon-tools': markRaw(Tools),
}

// 获取图标组件
const getIconComponent = (iconName: string | undefined) => {
  if (!iconName) return HomeFilled
  return iconMap[iconName] || HomeFilled
}

// 侧边栏菜单（parent_id=0的一级目录及其子菜单）
const sideMenus = computed(() => {
  return menus.value.filter(menu => menu.parentId === 0 && menu.visible === 1)
})

// 顶部菜单（parent_id=-1的菜单显示在右上角）
const topMenus = computed(() => {
  return menus.value.filter(menu => menu.parentId === -1 && menu.visible === 1)
})

// 初始化加载菜单
onMounted(() => {
  menus.value = getUserMenus()
  // 如果没有菜单数据，可能需要重新登录
  if (menus.value.length === 0) {
    ElMessage.warning('请先登录')
    router.push('/')
  }
})

// 退出登录处理函数
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    // 清除用户信息
    clearUserInfo()

    // 显示退出成功提示
    ElMessage.success('退出登录成功')

    // 跳转到登录页
    router.push('/')
  }).catch(() => {
    // 用户取消退出
    ElMessage.info('已取消退出')
  })
}
</script>
<style scoped lang="scss">
.index{
  width: 100vw;
  height: 100vh;
  display: flex;
  .left{
    width: 200px;
    background-color: #314a43;
    color: #ffa60f;
    padding-right: 5px;
    .el-menu{
      border-right: none;
      color: #ffa60f;
    }
    .el-menu-item.is-active {
      color: #ffa60f;
    }
    .el-menu-item{
      color: white;
    }
    ::v-deep .el-sub-menu__title{
      color: white;
    }
    h2{
      text-align: center;
      font-size: 40px;
      font-family: xiaxingkai;
      height: 60px;
      line-height: 60px;
    }
  }
  .right{
    flex: 1;
    display: flex;
    flex-direction: column;
    .top{
      height: 60px;
      background-color: #314a43;
      color: #ffa60f;
      display: flex;
      justify-content: flex-end;
    }
    .center{
      flex: 1;

    }
  }
}
</style>
