<template>
  <div class="login-list-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2 class="page-title">登录信息</h2>
          <el-button type="primary" @click="loadLoginRecords">
            <el-icon><Refresh /></el-icon> 刷新
          </el-button>
        </div>
      </template>

      <el-table :data="loginList" style="width: 100%" v-loading="loading">
        <el-table-column prop="account" label="账号" width="150" />
        <el-table-column prop="ip" label="登录IP" width="180" />
        <el-table-column prop="address" label="登录地点" width="200">
          <template #default="scope">
            {{ scope.row.address || '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="loginCount" label="登录次数" width="120" align="center" />
        <el-table-column prop="lastLoginTime" label="最后登录时间" width="200">
          <template #default="scope">
            {{ formatDateTime(scope.row.lastLoginTime) }}
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && loginList.length === 0" description="暂无登录记录" />
    </el-card>

    <!-- 登录地图可视化 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <h3 class="map-title">登录地点分布</h3>
      </template>
      <div ref="mapChart" style="width: 100%; height: 600px"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getLoginRecords, type LoginRecord } from '../../api/login'
import * as echarts from 'echarts'

const loginList = ref<LoginRecord[]>([])
const loading = ref(false)
const mapChart = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null
let mapRegistered = false
let resizeListenerAdded = false

// 城市坐标映射（常用城市）
const cityCoordinates: Record<string, [number, number]> = {
  '北京': [116.4074, 39.9042],
  '上海': [121.4737, 31.2304],
  '广州': [113.2644, 23.1291],
  '深圳': [114.0579, 22.5431],
  '杭州': [120.1551, 30.2741],
  '成都': [104.0668, 30.5728],
  '武汉': [114.3055, 30.5931],
  '西安': [108.9398, 34.3416],
  '南京': [118.7969, 32.0603],
  '重庆': [106.5516, 29.5630],
  '天津': [117.2010, 39.0842],
  '苏州': [120.5954, 31.2989],
  '郑州': [113.6254, 34.7466],
  '长沙': [112.9388, 28.2282],
  '沈阳': [123.4328, 41.8045],
  '青岛': [120.3826, 36.0671],
  '济南': [117.1205, 36.6519],
  '大连': [121.6147, 38.9140],
  '厦门': [118.0894, 24.4798],
  '合肥': [117.2272, 31.8206],
  '福州': [119.2965, 26.0745],
  '石家庄': [114.5149, 38.0428],
  '哈尔滨': [126.5349, 45.8038],
  '昆明': [102.8329, 24.8801],
  '南昌': [115.8581, 28.6832],
  '贵阳': [106.6302, 26.6477],
  '太原': [112.5489, 37.8706],
  '本地': [116.4074, 39.9042], // 默认北京坐标
  '未知': [116.4074, 39.9042]
}

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'

  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return dateTime

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 从地址中提取城市名
const extractCityName = (address: string): string => {
  if (!address) return '未知'

  // 遍历所有已知城市，查找地址中是否包含该城市名
  for (const city in cityCoordinates) {
    if (address.includes(city)) {
      return city
    }
  }

  // 如果没有匹配到，尝试使用正则提取省市名
  // 匹配格式：XX省XX市 或 XX市
  const cityMatch = address.match(/([^省]+省)?([^市]+市)/)
  if (cityMatch && cityMatch[2]) {
    const extractedCity = cityMatch[2].replace('市', '')
    // 检查提取的城市是否在已知城市列表中
    if (cityCoordinates[extractedCity]) {
      return extractedCity
    }
  }

  return '未知'
}

// 加载登录记录
const loadLoginRecords = async () => {
  loading.value = true
  try {
    const data = await getLoginRecords()
    loginList.value = data
    await nextTick()
    initMap()
  } finally {
    loading.value = false
  }
}

// 初始化地图
const initMap = () => {
  if (!mapChart.value) return

  // 如果已有实例，直接更新数据
  if (!chartInstance) {
    chartInstance = echarts.init(mapChart.value)
  }

  // 处理登录数据，聚合相同地点的登录次数
  const locationMap = new Map<string, number>()
  loginList.value.forEach(record => {
    const location = record.address || '未知'
    const count = locationMap.get(location) || 0
    locationMap.set(location, count + record.loginCount)
  })

  // 准备散点图数据
  const scatterData = Array.from(locationMap.entries()).map(([location, count]) => {
    const cityName = extractCityName(location)
    const coords = cityCoordinates[cityName] || cityCoordinates['未知']
    return {
      name: location,
      value: [...coords, count],
      itemStyle: {
        color: '#5470c6'
      }
    }
  })

  const option = {
    title: {
      text: '登录地点分布图',
      subtext: '圆圈大小表示登录次数',
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>登录次数: ${params.value[2]}`
      }
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.2,
      itemStyle: {
        areaColor: '#f3f3f3',
        borderColor: '#999'
      },
      emphasis: {
        itemStyle: {
          areaColor: '#e0e0e0'
        }
      }
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: (val: number[]) => {
          // 根据登录次数调整圆圈大小，最小10，最大50
          return Math.min(Math.max(val[2] * 2, 10), 50)
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'right',
          fontSize: 11
        },
        emphasis: {
          label: {
            show: true
          }
        }
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: scatterData.slice(0, 5), // 只对前5个地点添加特效
        symbolSize: (val: number[]) => {
          return Math.min(Math.max(val[2] * 2, 10), 50)
        },
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke',
          scale: 3,
          period: 4
        },
        label: {
          show: false
        },
        itemStyle: {
          color: '#f56c6c',
          shadowBlur: 10,
          shadowColor: '#f56c6c'
        }
      }
    ]
  }

  // 注册地图（只注册一次）
  const updateChart = () => {
    if (chartInstance) {
      chartInstance.setOption(option, true) // true 参数表示不合并，直接替换
    }
  }

  if (!mapRegistered) {
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then(response => response.json())
      .then(geoJson => {
        echarts.registerMap('china', geoJson)
        mapRegistered = true
        updateChart()
      })
      .catch(error => {
        console.error('加载地图数据失败:', error)
      })
  } else {
    updateChart()
  }

  // 监听窗口大小变化（只绑定一次）
  if (chartInstance && !resizeListenerAdded) {
    window.addEventListener('resize', () => {
      chartInstance?.resize()
    })
    resizeListenerAdded = true
  }
}

onMounted(() => {
  loadLoginRecords()
})
</script>

<style scoped lang="sass">
.login-list-container
  padding: 20px

  .card-header
    display: flex
    justify-content: space-between
    align-items: center

  .page-title
    font-size: 24px
    color: #2c5282
    margin: 0
    font-family: xiaxingkai, cursive

  .map-title
    font-size: 18px
    color: #2c5282
    margin: 0
    font-family: xiaxingkai, cursive
</style>
