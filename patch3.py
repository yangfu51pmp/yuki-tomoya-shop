import re

with open("src/components/AiVideoPlayer.tsx", "r") as f:
    content = f.read()

# Replace the control buttons in the white panel
old_panel_buttons = """                <div className="flex flex-wrap items-center justify-center gap-3 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-sm border border-[#bbe3f8] mt-2 w-full max-w-sm sm:max-w-md">
                  <button
                    onClick={() => { unlockAudio(); setEffectEnabled(!effectEnabled); }}
                    disabled={(!resolvedScript) || isExporting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                      (!resolvedScript) ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" :
                      effectEnabled
                        ? "bg-[#78C4EC] text-white shadow-md hover:bg-[#6db3e0]"
                        : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
                    }`}
                  >
                    {effectEnabled ? <Sparkles className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                    {effectEnabled ? "✨ AI 特效開啟" : "🎬 原始影片"}
                  </button>

                  <button
                    onClick={() => { unlockAudio(); setSoundEnabled(!soundEnabled); }}
                    disabled={(!resolvedScript) || isExporting || !effectEnabled}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                      !effectEnabled ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" :
                      soundEnabled
                        ? "bg-[#bbe3f8] text-[#333] shadow-sm hover:bg-[#a9d9f2]"
                        : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
                    }`}
                  >
                    {soundEnabled ? "🔊 特效音：開" : "🔇 特效音：關"}
                  </button>"""

new_panel_buttons = """                <div className="flex flex-wrap items-center justify-center gap-3 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-sm border border-[#bbe3f8] mt-2 w-full max-w-sm sm:max-w-md">
                  <button
                    onClick={() => {
                      unlockAudio();
                      const v = videoRef.current;
                      if (v) {
                        if (v.paused) v.play().catch(() => { v.muted = true; v.play(); });
                        else v.pause();
                      }
                    }}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors bg-gray-100 text-[#333] hover:bg-gray-200"
                  >
                    {isPlaying ? '⏸ 暫停影片' : '▶ 播放影片'}
                  </button>

                  <button
                    onClick={() => {
                      unlockAudio();
                      const v = videoRef.current;
                      if (v) {
                        v.muted = !v.muted;
                        setIsVideoMuted(v.muted);
                      }
                    }}
                    disabled={isExporting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                      !isVideoMuted
                        ? "bg-[#bbe3f8] text-[#333] shadow-sm hover:bg-[#a9d9f2]"
                        : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
                    }`}
                  >
                    {!isVideoMuted ? "🔊 影片聲音：開" : "🔇 影片聲音：靜音"}
                  </button>

                  <button
                    onClick={() => { unlockAudio(); setEffectEnabled(!effectEnabled); }}
                    disabled={(!resolvedScript) || isExporting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                      (!resolvedScript) ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400" :
                      effectEnabled
                        ? "bg-[#78C4EC] text-white shadow-md hover:bg-[#6db3e0]"
                        : "bg-gray-100 text-[#6d6d6d] hover:bg-gray-200"
                    }`}
                  >
                    {effectEnabled ? <Sparkles className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                    {effectEnabled ? "✨ AI 特效" : "🎬 原始影片"}
                  </button>"""

content = content.replace(old_panel_buttons, new_panel_buttons)

# Also update the export button text
old_export_btn = """🎬 匯出有聲 MP4 影片 (v5.2)"""
new_export_btn = """🎬 匯出有聲 MP4 影片 (v5.3)"""
content = content.replace(old_export_btn, new_export_btn)

with open("src/components/AiVideoPlayer.tsx", "w") as f:
    f.write(content)
