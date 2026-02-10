// 优先使用运行时注入的配置，其次使用构建时环境变量，最后使用默认值
declare global {
  interface Window {
    __APP_CONFIG__?: {
      API_BASE_URL?: string
      SCHEDULE_API_URL?: string
      CALENDAR_API_URL?: string
      LOGIN_BG_INDEX?: number
      LOGIN_BG_IMAGES?: string[]
    }
  }
}

// 使用函数获取，确保在运行时读取 config.js 的值
export function getBaseURL(): string {
  return window.__APP_CONFIG__?.API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '/blog'
}

// 获取排班系统API地址
export function getScheduleBaseURL(): string {
  return window.__APP_CONFIG__?.SCHEDULE_API_URL ||
    import.meta.env.VITE_SCHEDULE_API_URL ||
    '/schedule'
}

// 获取日历系统API地址
export function getCalendarBaseURL(): string {
  return window.__APP_CONFIG__?.CALENDAR_API_URL ||
    import.meta.env.VITE_CALENDAR_API_URL ||
    '/calendar'
}

// 兼容旧代码，但改为 getter 延迟求值
export const baseURL_test: string = getBaseURL()