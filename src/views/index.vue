<template>
  <div class="index">
    <div class="left">
      <h2>起飞博客</h2>
      <el-menu
          router="true"
          active-text-color="#ffa60f"
          background-color="#314a43"
          default-active="2"
          class="el-menu-vertical-demo"
      >
        <el-sub-menu index="1">
          <template #title>
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </template>
          <el-menu-item index="/index/home">博客广场</el-menu-item>
          <el-menu-item index="/index/miniapp">小程序</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>个人博客</span>
          </template>
          <el-menu-item index="/index/blogInfo">我的家园</el-menu-item>
          <el-menu-item index="/index/accountInfo">账号详情</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>
            <el-icon><Tools /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/index/account">账号管理</el-menu-item>
          <el-menu-item index="/index/menuManage">菜单管理</el-menu-item>
          <el-menu-item index="/index/roleManage">角色管理</el-menu-item>
          <el-menu-item index="/index/permissionManage">权限管理</el-menu-item>
          <el-menu-item index="/index/loginList">登录信息</el-menu-item>
        </el-sub-menu>
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
        <el-menu-item index="/index/mail"><el-icon><Message /></el-icon>邮件</el-menu-item>
        <el-menu-item index="/index/message"><el-icon><ChatDotSquare /></el-icon>
          消息</el-menu-item>
        <el-sub-menu index="3">
          <template #title><el-icon><Avatar /></el-icon>管理员</template>
          <el-menu-item index="3-1">问题反馈</el-menu-item>
          <el-menu-item index="3-2" @click="handleLogout">退出登录</el-menu-item>
        </el-sub-menu>

      </el-menu></div>
      <div class="center">
        <router-view></router-view>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import {HomeFilled,UserFilled,Tools,Message,ChatDotSquare,Avatar} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { clearUserInfo } from '../utils/userInfo'

const router = useRouter()

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
