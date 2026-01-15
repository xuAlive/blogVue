import {$post, setToken} from "../utils/request";
import {reactive} from "vue";
import { ElNotification } from 'element-plus'
import { setUserInfo, setUserMenus } from '../utils/userInfo'
import { getUserMenus as fetchUserMenus } from './menu'
import { getUserInfoByAccount } from './user'

export const $login=async (params: any)=>{
    let ret = $post('/sys/login',JSON.stringify(params));

    if (1 == (await ret).code){
        ElNotification({
            title: '通知',
            message: (await ret).codeMessage,
            type: 'success',
        })
        const token = (await ret).data
        setToken(token)
        sessionStorage.setItem("token", token)

        // 获取用户详细信息
        const userDetail = await getUserInfoByAccount(params.account)

        // 保存用户信息（包含昵称和真实姓名）
        setUserInfo({
            account: params.account,
            token: token,
            name: userDetail?.name || '',        // 昵称
            userName: userDetail?.userName || '' // 真实姓名
        })

        // 获取并保存用户菜单
        const menus = await fetchUserMenus()
        setUserMenus(menus)

        return true
    }else {
        ElNotification({
            title: '通知',
            message: (await ret).codeMessage,
            type: 'error',
        })
        return false
    }
}