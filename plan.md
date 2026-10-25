1. **Toggle Play/Pause on Video Click & Show Center Play Button**:
   - In `AiVideoPlayer.tsx`, add an `onClick` handler to the main video overlay / wrapper that checks if the click is not on an existing button, and calls `videoRef.current.play()` or `pause()`.
   - Add a translucent center button `▶ 繼續播放` when `!isPlaying && !isExporting && hasStarted` (or similar state). The requirements say: `When paused (!isPlaying && !isExporting), show a sleek translucent center button (z-40 pointer-events-auto) over the video: ▶ 繼續播放.`

2. **Always-Accessible Floating Playback & Mute Bar**:
   - Refactor the existing `Bottom Playback Bar` to match the requirements:
     - `bottom-2 left-3 right-3 z-40 flex items-center justify-between gap-2 bg-slate-900/75 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs`.
     - `⏸ 暫停` when playing, `▶ 播放` when paused.
     - `🔊 聲音：開` / `🔇 已靜音` button that also updates `isVideoMuted`.
     - Add the scrubber: `<input type="range" min={0} max={duration || 71} step={0.1} value={currentTime} ... />`
     - Display timestamp: `<span>{formatTime(currentTime)} / {formatTime(duration || 71)}</span>`.
     - Add `⛶ 放大` button inside this bar when `!isFullscreen`, removing the old floating Fullscreen button outside.
     - Ensure subtitles move to `bottom-12` so they don't overlap.
   - Adjust `🔄 橫向滿版` button position: when `isFullscreen`, move to `top-4 left-4` (next to `✕ 關閉全螢幕` at `top-4 right-4`).

3. **White Control Panel Updates**:
   - Add `⏸ 暫停影片 / ▶ 播放影片` button.
   - Add `🔊 影片聲音：開 / 🔇 影片聲音：靜音` button (replaces/updates the current "🔊 特效音" button).
   - Change export button text to `🎬 匯出有聲 MP4 影片 (v5.3)`.

4. **Minor Canvas Export Details**:
   - `target_focus`: Change crosshair compact radius (`radius = h * 0.045` and `h * 0.025` at `x = w * 0.32, y = h * 0.36`) and draw dark rounded label pill right next to it.
   - Top-Left Badge: Make sure `✨ ユキ&トモヤ｜日本實拍` is drawn with an opaque white pill (`rgba(255, 255, 255, 0.96)`) so it covers the original video's badge.

5. **Run Pre-Commit Checks**:
   - Call `pre_commit_instructions` to ensure testing and checks are done. Ensure `npx tsc --noEmit` passes.

6. **Submit Change**.
