/**
 * 用户信息管理工具类
 */

import type { Menu } from '../api/menu'

interface UserInfo {
  account: string
  token: string
  [key: string]: any
}

const USER_INFO_KEY = 'user_info'
const USER_MENUS_KEY = 'user_menus'

/**
 * 保存用户信息到 sessionStorage
 */
export const setUserInfo = (userInfo: UserInfo): void => {
  try {
    sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  } catch (error) {
    console.error('保存用户信息失败:', error)
  }
}

/**
 * 获取用户信息
 */
export const getUserInfo = (): UserInfo | null => {
  try {
    const userInfoStr = sessionStorage.getItem(USER_INFO_KEY)
    if (userInfoStr) {
      return JSON.parse(userInfoStr)
    }
    return null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 获取当前登录用户的账号
 */
export const getAccount = (): string => {
  const userInfo = getUserInfo()
  return userInfo?.account || ''
}

/**
 * 获取用户显示名称（优先级：昵称 > 真实姓名 > 账号）
 */
export const getDisplayName = (): string => {
  const userInfo = getUserInfo()
  return userInfo?.name || userInfo?.userName || userInfo?.account || '用户'
}

/**
 * 获取当前登录用户的 token
 */
export const getToken = (): string => {
  const userInfo = getUserInfo()
  return userInfo?.token || sessionStorage.getItem('token') || ''
}

/**
 * 清除用户信息
 */
export const clearUserInfo = (): void => {
  try {
    sessionStorage.removeItem(USER_INFO_KEY)
    sessionStorage.removeItem(USER_MENUS_KEY)
    sessionStorage.removeItem('token')
  } catch (error) {
    console.error('清除用户信息失败:', error)
  }
}

/**
 * 检查用户是否已登录
 */
export const isLoggedIn = (): boolean => {
  const userInfo = getUserInfo()
  return !!userInfo && !!userInfo.token
}

/**
 * 保存用户菜单到 sessionStorage
 */
export const setUserMenus = (menus: Menu[]): void => {
  try {
    sessionStorage.setItem(USER_MENUS_KEY, JSON.stringify(menus))
  } catch (error) {
    console.error('保存用户菜单失败:', error)
  }
}

/**
 * 获取用户菜单
 */
export const getUserMenus = (): Menu[] => {
  try {
    const menusStr = sessionStorage.getItem(USER_MENUS_KEY)
    if (menusStr) {
      return JSON.parse(menusStr)
    }
    return []
  } catch (error) {
    console.error('获取用户菜单失败:', error)
    return []
  }
}
