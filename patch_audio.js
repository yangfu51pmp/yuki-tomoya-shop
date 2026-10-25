const fs = require('fs');
let content = fs.readFileSync('src/components/AiVideoPlayer.tsx', 'utf8');

// The original file used `audioContextRef` and `AudioContext`, not `audioCtx`.
// Let's modify the file properly.

// First we will remove the duplicate audioCtxRef since we didn't check exactly what was in the file before trying to patch it:
content = content.replace("  const audioCtxRef = useRef<AudioContext | null>(null);\n  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);", "  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);");

fs.writeFileSync('src/components/AiVideoPlayer.tsx', content);
