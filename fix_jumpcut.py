import re

with open('src/components/AiVideoPlayer.tsx', 'r') as f:
    content = f.read()

content = content.replace('cutEnabled', 'jumpCutEnabled')
content = content.replace('setCutEnabled', 'setJumpCutEnabled')

with open('src/components/AiVideoPlayer.tsx', 'w') as f:
    f.write(content)
