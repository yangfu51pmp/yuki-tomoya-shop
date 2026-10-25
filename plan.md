1. **Fix Website Video Freeze & Restore Smooth 60fps Playback (`src/components/AiVideoPlayer.tsx`)**
   - Use throttling in `handleTimeUpdate` to call `setCurrentTime` at most once every 120ms to prevent freezing iOS Safari decoder.
   - For `speechSegments` jump-cut, ensure it seeks only if `jumpCutEnabled` (or `cutEnabled` in code) is true and with an 800ms cooldown so it doesn't get trapped. Default `cutEnabled` to false.
   - Add a `isPlaying` state for the video playback.
   - When `!isPlaying && !isExporting`, render a big Center Play Button: `▶ 點擊播放影片（含聲音＋AI特效）` and a sleek bottom Playback Bar with a `▶ 播放 / ⏸ 暫停`, current time, and a `🔊 聲音開 / 🔇 靜音` button.
   - Ensure the user click function can correctly un-mute and play the video.

2. **Fix Cover & Card Overlapping on 16:9 Landscape Video**
   - Hide the top-left badge `✨ ユキ&トモヤ｜日本實拍` when the Cover is visible (`currentTime <= 2.4`).
   - Tweak Cover (`0.0s - 2.4s`) to be compact for 16:9 video:
     - Top bar height: `py-1 px-3 text-xs`.
     - Center title: `text-2xl sm:text-3xl font-black`.
     - Subtitle under title: `text-xs`.
     - Move circular stamp to **top-right (`top-8 right-4 w-12 h-12 text-xs`)**.
     - Make speaker card bottom-left compact: `bottom-10 left-3 px-2.5 py-1 text-xs`.

3. **Fix Black / Unplayable Exported MP4 on iPhone (`🎬 匯出 MP4 影片 (v4.0)`)**
   - Update export button text to `🎬 匯出 MP4 影片 (v4.0)`.
   - In `exportVideo`, use pure `canvas.captureStream(30)` for `MediaRecorder` on iOS. **Do NOT add WebAudio tracks or video capture stream** to it, since it causes black output on iOS.
   - Implement `drawRoundedRect(ctx, x, y, w, h, r)` using pure paths (`beginPath`, `moveTo`, `arcTo`, `closePath`, `fill`) instead of `ctx.roundRect()` which throws on iOS.
   - Fast forward export (via requestAnimationFrame approach instead of `for` loop): wait for `video.currentTime = 0`, start `mediaRecorder.start(200)`. Set `video.muted = true`, `await video.play()`.
   - In a recursive `requestAnimationFrame`, do:
     - Draw video on canvas.
     - Draw cover/events/subtitles using safe drawing methods.
     - If `video.ended` or `video.currentTime >= video.duration - 0.15`, call `mediaRecorder.stop()`, restore `video.muted = false`. Show exported URL.

4. **Ensure Verification and Quality**
   - Since we cannot do temporary scripts, we will directly edit the file and review.
   - Run Pre-commit steps.
   - Finally, submit PR.
