import axios from "axios";
import {baseURL_test} from "../config/baseURL";
import {reactive} from "vue";
import CryptoJS from "crypto-js";
import { getToken } from './userInfo'

const instance=axios.create({
    baseURL: baseURL_test,
    timeout: 300000,  // 5分钟（300000毫秒）

})

// 动态存储 token
let token = "";

// 请求拦截器
instance.interceptors.request.use(
    config => {
        // 每次请求都重新获取和加密token，确保token是最新的
        const storedToken = getToken()
        if (storedToken) {
            // 重新加密token
            const time = Date.now()
            const time5int = Math.floor(time / (1000 * 60)) * 60
            const time5 = time5int * 1000
            const md51 = CryptoJS.MD5(storedToken + time5).toString().toUpperCase()
            const encryptedToken = `${storedToken}##${md51}`

            // 添加到请求头
            config.headers['Token'] = encryptedToken

            // 同步更新内存中的token
            token = encryptedToken
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)
// 更新 token 的方法
export const setToken = (newToken: string) => {
    const time = Date.now(); // 当前时间戳
    const time5int = Math.floor(time / (1000 * 60)) * 60; // 对时间戳进行取整，精确到分钟
    const time5 = time5int * 1000; // 转换为毫秒
    const md51 = CryptoJS.MD5(newToken + time5).toString().toUpperCase();
    token = `${newToken}##${md51}`;
};

let reqDate = reactive({
    code:"",
    codeMessage:"",
    data:""
})
export const $get = async (url:string,params:object={})=>{
    let axiosResponse = await instance.get(url, {params} );

    return axiosResponse.data
}
export const $post = async (url:string,params:object={})=>{
    console.log(params)
    let axiosResponse = await  instance.post(url,params,{
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(axiosResponse.data)
    reqDate = axiosResponse.data
    return reqDate
}



