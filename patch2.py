import re

with open("src/components/AiVideoPlayer.tsx", "r") as f:
    content = f.read()

# Replace Bottom Playback Bar
old_bar = """        {/* Bottom Playback Bar */}
        {!isExporting && (
          <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-auto bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between transition-opacity duration-300 opacity-0 hover:opacity-100">
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (v) {
                    if (v.paused) v.play().catch(() => { v.muted = true; v.play(); });
                    else v.pause();
                  }
                }}
                className="text-white hover:text-[#78C4EC] transition"
             >
                {isPlaying ? '⏸ 暫停' : '▶ 播放'}
             </button>
             <div className="text-white/90 text-sm font-bold tracking-wider">
                {formatTime(currentTime)} / {videoRef.current?.duration ? formatTime(videoRef.current.duration) : '0:00'}
             </div>
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (v) {
                    v.muted = !v.muted;
                    setIsVideoMuted(v.muted);
                  }
                }}
                className="text-white hover:text-[#78C4EC] transition"
             >
                {isVideoMuted ? '🔇 靜音' : '🔊 聲音開'}
             </button>
          </div>
        )}"""

new_bar = """        {/* Bottom Playback Bar */}
        {!isExporting && (
          <div className="absolute bottom-2 left-3 right-3 z-40 flex items-center justify-between gap-2 bg-slate-900/75 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs pointer-events-auto shadow-lg border border-white/10">
             <button
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (v) {
                    if (v.paused) v.play().catch(() => { v.muted = true; v.play(); });
                    else v.pause();
                  }
                }}
                className="hover:text-[#78C4EC] transition font-bold shrink-0"
             >
                {isPlaying ? '⏸ 暫停' : '▶ 播放'}
             </button>

             <div className="flex-1 flex items-center gap-2 px-2">
               <input
                 type="range"
                 min={0}
                 max={videoRef.current?.duration || 71}
                 step={0.1}
                 value={currentTime}
                 onChange={(e) => {
                   const t = parseFloat(e.target.value);
                   if (videoRef.current) videoRef.current.currentTime = t;
                   setCurrentTime(t);
                 }}
                 className="flex-1 accent-sky-400 h-1 cursor-pointer"
               />
               <span className="font-bold tracking-wider shrink-0 text-[10px] sm:text-xs">
                 {formatTime(currentTime)} / {formatTime(videoRef.current?.duration || 71)}
               </span>
             </div>

             <button
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (v) {
                    v.muted = !v.muted;
                    setIsVideoMuted(v.muted);
                  }
                }}
                className="hover:text-[#78C4EC] transition font-bold shrink-0"
             >
                {isVideoMuted ? '🔇 已靜音' : '🔊 聲音：開'}
             </button>

             {!isFullscreen && (
               <button
                 onClick={(e) => { e.stopPropagation(); unlockAudio(); setIsFullscreen(true); }}
                 className="hover:text-[#78C4EC] transition font-bold shrink-0 ml-1 border-l border-white/20 pl-2"
               >
                 ⛶ 放大
               </button>
             )}
          </div>
        )}"""

content = content.replace(old_bar, new_bar)

# Remove the old Floating Fullscreen button outside
old_floating_fullscreen = """        {/* Floating Fullscreen button */}
        {!isFullscreen && (
          <button
            onClick={() => { unlockAudio(); setIsFullscreen(true); }}
            className="absolute bottom-3 right-3 z-40 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur transition shadow-lg flex items-center justify-center"
            title="全螢幕放大"
          >
            ⛶ 放大
          </button>
        )}"""

content = content.replace(old_floating_fullscreen, "")

# Shift subtitles up to bottom-12
old_subtitle = """className="absolute bottom-6 left-0 right-0 z-30 flex justify-center px-4\""""
new_subtitle = """className="absolute bottom-12 left-0 right-0 z-30 flex justify-center px-4\""""
content = content.replace(old_subtitle, new_subtitle)

# Move the rotate button when fullscreen
old_rotate_btn = """          <button onClick={() => setIsRotated(!isRotated)} className="absolute bottom-4 right-4 z-50 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur transition">
            🔄 橫向滿版
          </button>"""
new_rotate_btn = """          <button onClick={() => setIsRotated(!isRotated)} className="absolute top-4 left-4 z-50 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-bold text-sm backdrop-blur transition">
            🔄 橫向滿版
          </button>"""
content = content.replace(old_rotate_btn, new_rotate_btn)

with open("src/components/AiVideoPlayer.tsx", "w") as f:
    f.write(content)
