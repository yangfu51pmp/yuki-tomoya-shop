const fs = require('fs');
let content = fs.readFileSync('src/app/api/line/route.ts', 'utf8');
content = content.replace('const "🤖 ユキ&トモヤ管理助手" = \'【ユキ&トモヤ管理助手】\';', '');
fs.writeFileSync('src/app/api/line/route.ts', content, 'utf8');
