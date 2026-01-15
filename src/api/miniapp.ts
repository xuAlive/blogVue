import { $get } from "../utils/request"
import { ElMessage } from 'element-plus'

/**
 * 小程序接口
 */
export interface Miniapp {
  id: number
  name: string
  intro: string
  icon: string
  color: string
  category: string
  tagType: string  // primary/success/warning/danger/info
  route?: string
  externalLink?: string
  sortOrder: number
}

/**
 * 获取小程序列表
 */
export const getMiniappList = async () => {
  try {
    const ret = await $get('/miniapp/list', {})

    if (ret.code === 1) {
      return ret.data as Miniapp[]
    } else {
      ElMessage.error(ret.msg || '获取小程序列表失败')
      return []
    }
  } catch (error) {
    console.error('获取小程序列表失败:', error)
    ElMessage.error('获取小程序列表失败')
    return []
  }
}
