<template>
  <div class="blog-info-container">
    <el-tabs v-model="activeTab" type="border-card" class="blog-tabs">
      <el-tab-pane label="我的记录" name="myRecords">
        <MyRecords />
      </el-tab-pane>
      <el-tab-pane label="浏览记录" name="browsingHistory">
        <BrowsingHistory />
      </el-tab-pane>
      <el-tab-pane label="新作发布" name="blog">
        <Blog />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MyRecords from './myRecords.vue'
import BrowsingHistory from './browsingHistory.vue'
import Blog from './blog.vue'

const activeTab = ref('myRecords')
</script>

<style scoped lang="scss">
.blog-info-container {
  height: 100%;
  padding: 20px;
  background: #f5f7fa;

  .blog-tabs {
    height: 100%;

    ::v-deep .el-tabs__content {
      height: calc(100% - 55px);
      overflow: hidden;
    }

    ::v-deep .el-tab-pane {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
