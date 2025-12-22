import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
// 倒入路由器
import router from './router'
// 导入element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

createApp(App)
    .use(ElementPlus, { locale: zhCn })
    .use(router)
    .mount('#app')

