#!/bin/sh
# 运行时配置注入脚本
# 将环境变量注入到 config.js 中

CONFIG_FILE=/usr/share/nginx/html/config.js

# 生成配置文件
cat > $CONFIG_FILE << EOF
window.__APP_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL:-http://127.0.0.1:6101/blog}"
};
EOF

echo "Config generated: $CONFIG_FILE"
cat $CONFIG_FILE

# 启动 nginx
exec nginx -g 'daemon off;'
