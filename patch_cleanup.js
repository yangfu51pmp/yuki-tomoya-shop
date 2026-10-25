const fs = require('fs');
let content = fs.readFileSync('src/components/AiVideoPlayer.tsx', 'utf8');

// I will remove the unused sourceNodeRef as requested by the code review
content = content.replace(
  "const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);\n",
  ""
);

fs.writeFileSync('src/components/AiVideoPlayer.tsx', content);
