import re

with open("src/components/AiVideoPlayer.tsx", "r") as f:
    content = f.read()

# Add videoRef.current.currentTime = 0; before play
old = """        videoRef.current.play();
        mediaRecorder.start();"""

new = """        videoRef.current.currentTime = 0;
        videoRef.current.play();
        mediaRecorder.start();"""

content = content.replace(old, new)

with open("src/components/AiVideoPlayer.tsx", "w") as f:
    f.write(content)
