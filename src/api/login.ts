import { $get, $post } from "../utils/request"
import { ElMessage } from 'element-plus'

/**
 * 登录记录接口
 */
export interface LoginRecord {
  account: string
  ip: string
  address: string | null
  loginCount: number
  lastLoginTime: string
}

/**
 * 获取登录记录
 * @param account 账号（可选，不传则获取当前用户）
 */
export const getLoginRecords = async (account?: string) => {
  try {
    const params = account ? { account } : {}
    const ret = await $get('/sys/getLoginRecords', params)

    if (ret.code === 1) {
      return ret.data as LoginRecord[]
    } else {
      ElMessage.error(ret.msg || '获取登录记录失败')
      return []
    }
  } catch (error) {
    console.error('获取登录记录失败:', error)
    ElMessage.error('获取登录记录失败')
    return []
  }
}

/**
 * 用户注册
 * @param data 注册信息 { account, password }
 */
export const $register = async (data: { account: string; password: string }) => {
  try {
    const ret = await $post('/sys/register', data)
    if (ret.code === 1) {
      ElMessage.success('注册成功')
      return true
    } else {
      ElMessage.error(ret.msg || '注册失败')
      return false
    }
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error('注册失败')
    return false
  }
}
