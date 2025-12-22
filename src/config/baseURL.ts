// 优先使用运行时注入的配置，其次使用构建时环境变量，最后使用默认值
declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE_URL?: string
    }
  }
}

export const baseURL_test: string =
  window.__APP_CONFIG__?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:6101/blog'