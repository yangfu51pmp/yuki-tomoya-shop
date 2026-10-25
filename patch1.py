import re

with open("src/components/AiVideoPlayer.tsx", "r") as f:
    content = f.read()

# Replace the initial Playback Overlays section to check !hasStarted for the initial button
# And add the center ▶ 繼續播放 button when hasStarted && !isPlaying && !isExporting

old_block = """        {/* Playback Overlays */}
        {!isPlaying && !isExporting && (
          <div className="absolute inset-0 z-40 pointer-events-auto flex items-center justify-center bg-black/40"
               onClick={() => {
                 const v = videoRef.current;
                 if (v) {
                   v.muted = false;
                   v.volume = 1.0;
                   if (v.paused) {
                     v.play().catch(() => { v.muted = true; v.play(); });
                   } else {
                     v.pause();
                   }
                 }
               }}
          >
            <div className="bg-[#78C4EC] text-white px-6 py-3 rounded-full font-extrabold shadow-2xl flex items-center gap-2 hover:bg-[#6db3e0] transition transform hover:scale-105 cursor-pointer text-lg">
              ▶ 點擊播放影片（含聲音＋AI特效）
            </div>
          </div>
        )}"""

new_block = """        {/* Playback Overlays */}
        {!hasStarted && !isExporting && (
          <div className="absolute inset-0 z-40 pointer-events-auto flex items-center justify-center bg-black/40"
               onClick={() => {
                 const v = videoRef.current;
                 if (v) {
                   v.muted = false;
                   v.volume = 1.0;
                   if (v.paused) {
                     v.play().catch(() => { v.muted = true; v.play(); });
                   } else {
                     v.pause();
                   }
                 }
               }}
          >
            <div className="bg-[#78C4EC] text-white px-6 py-3 rounded-full font-extrabold shadow-2xl flex items-center gap-2 hover:bg-[#6db3e0] transition transform hover:scale-105 cursor-pointer text-lg">
              ▶ 點擊播放影片（含聲音＋AI特效）
            </div>
          </div>
        )}

        {hasStarted && !isPlaying && !isExporting && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
            <div className="pointer-events-auto bg-black/50 text-white p-4 rounded-full backdrop-blur-sm cursor-pointer hover:bg-black/70 transition shadow-xl border border-white/20"
                 onClick={(e) => {
                   e.stopPropagation();
                   const v = videoRef.current;
                   if (v && v.paused) v.play().catch(() => { v.muted = true; v.play(); });
                 }}
            >
              <div className="flex items-center gap-2 text-lg font-bold pr-2">
                <span className="text-2xl">▶</span> 繼續播放
              </div>
            </div>
          </div>
        )}"""

content = content.replace(old_block, new_block)

# Add onClick handler to the video wrapper to toggle play/pause when clicking anywhere
container_div_start_old = """      <div onClick={unlockAudio} className={`${containerClass} ${isFullscreen && isRotated ? 'rotate-90 w-[100dvh] h-[100vw] origin-center' : ''}`} ref={containerRef}>"""
container_div_start_new = """      <div onClick={(e) => {
        unlockAudio();
        // Ignore clicks on buttons/inputs
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.tagName === 'BUTTON' || target.tagName === 'INPUT') return;
        const v = videoRef.current;
        if (v && hasStarted) {
          if (v.paused) v.play().catch(() => { v.muted = true; v.play(); });
          else v.pause();
        }
      }} className={`${containerClass} ${isFullscreen && isRotated ? 'rotate-90 w-[100dvh] h-[100vw] origin-center' : ''}`} ref={containerRef}>"""

content = content.replace(container_div_start_old, container_div_start_new)

with open("src/components/AiVideoPlayer.tsx", "w") as f:
    f.write(content)
