// 运行时配置文件
// 使用相对路径，通过 Nginx 代理转发到后端
window.__APP_CONFIG__ = {
  // 本地测试地址
  // API_BASE_URL: "http://127.0.0.1:6101/blog",
  API_BASE_URL: "/blog",
  // 排班系统API地址
  // 本地测试使用
  // SCHEDULE_API_URL: "http://127.0.0.1:6102/schedule",
  SCHEDULE_API_URL: "/schedule",
  // 日历系统API地址
  // 本地测试使用
  // CALENDAR_API_URL: "http://127.0.0.1:6103/calendar",
  CALENDAR_API_URL: "/calendar",
  // 登录页背景图片配置：1 或 2
  LOGIN_BG_INDEX: 2,
  // 可用的背景图片列表
  LOGIN_BG_IMAGES: [
    "/images/blog20260114210536_53_43.jpg",
    "/images/blog20260114210537_54_43.jpg"
  ]
};
