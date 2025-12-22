import { $get, $post } from "../utils/request"
import { ElMessage } from 'element-plus'

/**
 * 权限接口
 */
export interface Permission {
  id?: number
  permissionCode: string
  permissionName: string
  resourceType: string  // API/BUTTON/DATA
  resourcePath?: string
  description?: string
  status?: number  // 0-禁用 1-启用
}

/**
 * 获取当前用户权限列表
 */
export const getUserPermissions = async () => {
  try {
    const ret = await $get('/permission/getUserPermissions', {})

    if (ret.code === 1) {
      return ret.data as Permission[]
    } else {
      ElMessage.error(ret.msg || '获取用户权限失败')
      return []
    }
  } catch (error) {
    console.error('获取用户权限失败:', error)
    ElMessage.error('获取用户权限失败')
    return []
  }
}

/**
 * 获取所有权限列表
 */
export const getAllPermissions = async () => {
  try {
    const ret = await $get('/permission/getAllPermissions', {})

    if (ret.code === 1) {
      return ret.data as Permission[]
    } else {
      ElMessage.error(ret.msg || '获取权限列表失败')
      return []
    }
  } catch (error) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
    return []
  }
}

/**
 * 新增权限
 */
export const addPermission = async (permission: Permission) => {
  try {
    const ret = await $post('/permission/add', JSON.stringify(permission))

    if (ret.code === 1) {
      ElMessage.success('新增权限成功')
      return true
    } else {
      ElMessage.error(ret.msg || '新增权限失败')
      return false
    }
  } catch (error) {
    console.error('新增权限失败:', error)
    ElMessage.error('新增权限失败')
    return false
  }
}

/**
 * 修改权限
 */
export const updatePermission = async (permission: Permission) => {
  try {
    const ret = await $post('/permission/update', JSON.stringify(permission))

    if (ret.code === 1) {
      ElMessage.success('修改权限成功')
      return true
    } else {
      ElMessage.error(ret.msg || '修改权限失败')
      return false
    }
  } catch (error) {
    console.error('修改权限失败:', error)
    ElMessage.error('修改权限失败')
    return false
  }
}

/**
 * 为角色分配权限
 */
export const assignPermissionsToRole = async (roleId: number, permissionIds: number[]) => {
  try {
    const ret = await $post(`/permission/assignToRole?roleId=${roleId}`, JSON.stringify(permissionIds))

    if (ret.code === 1) {
      ElMessage.success('分配权限成功')
      return true
    } else {
      ElMessage.error(ret.msg || '分配权限失败')
      return false
    }
  } catch (error) {
    console.error('分配权限失败:', error)
    ElMessage.error('分配权限失败')
    return false
  }
}
