const fs = require('fs');
let content = fs.readFileSync('src/components/AiVideoPlayer.tsx', 'utf8');

content = content.replace(
  "if (!MediaRecorder.isTypeSupported(options.mimeType)) {",
  "if (!options.mimeType || !MediaRecorder.isTypeSupported(options.mimeType)) {"
);

fs.writeFileSync('src/components/AiVideoPlayer.tsx', content);
