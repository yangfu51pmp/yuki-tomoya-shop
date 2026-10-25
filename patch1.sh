#!/bin/bash

# Add hasStarted state
sed -i '' 's/const \[isPlaying, setIsPlaying\] = useState(false);/const \[isPlaying, setIsPlaying\] = useState(false);\n  const \[hasStarted, setHasStarted\] = useState(false);/g' src/components/AiVideoPlayer.tsx

# In handleTimeUpdate or similar, set hasStarted(true) if currentTime > 0? No, just set hasStarted in onPlay.
sed -i '' 's/onPlay={() => setIsPlaying(true)}/onPlay={() => { setIsPlaying(true); setHasStarted(true); }}/g' src/components/AiVideoPlayer.tsx
