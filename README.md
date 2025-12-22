# BlogVue - 个人博客管理系统

基于 Vue 3 + TypeScript + Vite 构建的现代化博客管理系统，提供博客发布、管理、浏览以及集成 AI 对话等功能。

## 项目简介

BlogVue 是一个功能完整的博客管理系统，采用前后端分离架构。前端使用 Vue 3 生态系统构建，提供流畅的用户体验和现代化的界面设计。

## 技术栈

### 核心框架
- **Vue 3.3.11** - 渐进式 JavaScript 框架
- **TypeScript 5.2.2** - JavaScript 的超集，提供类型安全
- **Vite 5.0.8** - 下一代前端构建工具

### UI 组件库
- **Element Plus 2.5.1** - 基于 Vue 3 的组件库

### 状态管理与路由
- **Vue Router 4.2.5** - 官方路由管理器
- **Pinia 2.1.7** - Vue 3 状态管理库

### HTTP 请求
- **Axios 1.6.5** - Promise 基的 HTTP 客户端
- **CORS 2.8.5** - 跨域资源共享

### 工具库
- **Crypto-js 4.2.0** - 加密库，用于 Token 加密

### 样式
- **Sass 1.69.7** - CSS 预处理器

## 项目结构

```
blogVue/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口定义
│   │   ├── admin.ts       # 管理员相关接口
│   │   └── deepseek.ts    # DeepSeek AI 对话接口
│   ├── assets/            # 资源文件
│   │   └── fonts/         # 自定义字体
│   ├── components/        # 公共组件
│   ├── config/            # 配置文件
│   │   └── baseURL.ts     # API 基础地址配置
│   ├── router/            # 路由配置
│   │   └── index.ts       # 路由定义
│   ├── utils/             # 工具函数
│   │   └── request.ts     # Axios 封装
│   ├── views/             # 页面组件
│   │   ├── blog/          # 博客相关页面
│   │   ├── home/          # 首页
│   │   ├── play/          # 娱乐功能
│   │   ├── system/        # 系统管理
│   │   ├── index.vue      # 主布局页面
│   │   ├── login.vue      # 登录页面
│   │   ├── mail.vue       # 邮件页面
│   │   └── message.vue    # 消息页面
│   ├── App.vue            # 根组件
│   ├── main.ts            # 应用入口
│   └── style.css          # 全局样式
├── index.html             # HTML 入口
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

## 核心功能

### 1. 用户认证
- 登录/登出功能
- Token 基于的身份验证
- Token 自动加密（使用 MD5 + 时间戳）
- 请求拦截器自动添加 Token

### 2. 博客管理
- **博客列表** (`/index/blogList`) - 浏览所有博客文章
- **个人博客** (`/index/blogInfo`) - 个人博客信息页面
- **我的记录** (`/index/blogInfo/myRecords`) - 个人发布的博客记录
- **浏览历史** (`/index/blogInfo/browsingHistory`) - 查看浏览过的博客
- **最新发布** (`/index/blogInfo/blog`) - 最新发布的博客内容

### 3. 系统管理
- **账号管理** (`/index/account`) - 用户账号管理
- **账号详情** (`/index/accountInfo`) - 账号详细信息
- **菜单管理** (`/index/menu`) - 系统菜单配置
- **登录记录** (`/index/loginList`) - 登录日志查看

### 4. 娱乐功能
- **DeepSeek AI 对话** (`/index/blogInfo/deepseek`) - 集成 DeepSeek AI 对话功能
- **娱乐工坊** (`/index/blogInfo/playIndex`) - 娱乐功能入口

## 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
默认访问地址：`http://127.0.0.1:5173`

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 配置说明

### API 配置
在 `src/config/baseURL.ts` 中配置后端 API 地址：
```typescript
export const baseURL_test: string = 'http://127.0.0.1:6101/blog'
```

### Vite 配置
在 `vite.config.ts` 中配置开发服务器：
```typescript
server: {
  host: '127.0.0.1',
  // port: 6101  // 可自定义端口
}
```

## HTTP 请求封装

项目封装了统一的 HTTP 请求工具（`src/utils/request.ts`），提供以下功能：

- 统一的请求/响应拦截
- 自动添加 Token 认证
- Token 加密机制（MD5 + 时间戳）
- 统一的错误处理
- 支持 GET/POST 请求

### 使用示例
```typescript
import { $get, $post, setToken } from '@/utils/request'

// GET 请求
const data = await $get('/api/users', { page: 1 })

// POST 请求
const result = await $post('/api/login', { username: 'admin', password: '123456' })

// 设置 Token
setToken('your-token')
```

## 路由配置

项目使用 Vue Router 的 Hash 模式，主要路由结构：

- `/` - 登录页面
- `/index` - 主应用布局
  - `/index/home` - 首页
  - `/index/blogList` - 博客列表
  - `/index/blogInfo` - 博客信息（含子路由）
  - `/index/account` - 账号管理
  - `/index/menu` - 菜单管理

## 开发建议

### IDE 配置
推荐使用 [VS Code](https://code.visualstudio.com/) + 以下插件：
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 支持
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - TS 支持

**注意**：请禁用 Vetur 插件，以避免与 Volar 冲突。

### TypeScript 支持
项目使用 `vue-tsc` 进行类型检查。TypeScript 默认无法识别 `.vue` 文件的类型，需要通过 Volar 插件提供类型支持。

### Volar Take Over 模式
为了获得更好的性能，可以启用 Volar 的 Take Over 模式：

1. 在 VSCode 命令面板运行 `Extensions: Show Built-in Extensions`
2. 找到 `TypeScript and JavaScript Language Features`
3. 右键选择 `Disable (Workspace)`
4. 运行 `Developer: Reload Window` 重新加载窗口

## 安全特性

- Token 基于的身份验证
- Token 使用 MD5 + 时间戳加密
- 请求超时设置（30秒）
- CORS 跨域支持

## 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

建议使用最新版本的现代浏览器以获得最佳体验。

## 许可证

Private

## 联系方式

如有问题或建议，请联系项目维护者。
