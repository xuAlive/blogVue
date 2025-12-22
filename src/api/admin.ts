import {$post, setToken} from "../utils/request";
import {reactive} from "vue";
import { ElNotification } from 'element-plus'
import { setUserInfo } from '../utils/userInfo'

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

        // 保存用户信息
        setUserInfo({
            account: params.account,
            token: token
        })

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