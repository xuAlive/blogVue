import {createRouter, createWebHashHistory, RouterOptions} from 'vue-router'

const router = createRouter(<RouterOptions>{
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            meta: {title: '登陆'},
            component: () => import('../views/login.vue')
        },
        {
            path: '/login',
            redirect: '/'
        },
        {
            path: '/index',
            meta: {title: '首页'},
            component: () => import('../views/index.vue'),
            children: [
                {
                    path: 'home',
                    meta: {title: '博客广场'},
                    component: () => import('../views/home/home.vue')
                },
                {
                    path: 'articleDetail/:id',
                    meta: {title: '文章详情'},
                    component: () => import('../views/home/articleDetail.vue')
                },
                {
                    path: 'miniapp',
                    meta: {title: '小程序'},
                    component: () => import('../views/miniapp.vue')
                },
                {
                    path: 'deepseek',
                    meta: {title: 'DeepSeek对话'},
                    component: () => import('../views/play/deepseek/deepseek.vue')
                },
                {
                    path: 'mail',
                    meta: {title: '邮件'},
                    component: () => import('../views/mail.vue')
                },
                {
                    path: 'message',
                    meta: {title: '消息'},
                    component: () => import('../views/message.vue')
                },
                {
                    path: 'blogInfo',
                    meta: {title: '个人博客'},
                    component: () => import('../views/blog/blogInfo.vue')
                },
                {
                    path: 'account',
                    meta: {title: '账号管理'},
                    component: () => import('../views/system/account.vue')
                },
                {
                    path: 'accountInfo',
                    meta: {title: '账号详情'},
                    component: () => import('../views/system/accountInfo.vue')
                },
                {
                    path: 'loginList',
                    meta: {title: '登录信息'},
                    component: () => import('../views/system/loginList.vue')
                },
                {
                    path: 'menuManage',
                    meta: {title: '菜单管理'},
                    component: () => import('../views/system/menuManage.vue')
                },
                {
                    path: 'roleManage',
                    meta: {title: '角色管理'},
                    component: () => import('../views/system/roleManage.vue')
                },
                {
                    path: 'permissionManage',
                    meta: {title: '权限管理'},
                    component: () => import('../views/system/permissionManage.vue')
                },
                {
                    path: 'schedule',
                    meta: {title: '排班系统'},
                    component: () => import('../views/apps/ScheduleApp.vue')
                },
                {
                    path: 'calendar',
                    meta: {title: '日程管理'},
                    component: () => import('../views/apps/CalendarApp.vue')
                }
            ]
        }
    ]
})
export default router