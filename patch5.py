import re

with open("src/components/AiVideoPlayer.tsx", "r") as f:
    content = f.read()

# Fix 1: Make sure toggling video muted also toggles soundEnabled so SFX mutes/unmutes properly
old_mute_toggle1 = """                    v.muted = !v.muted;
                    setIsVideoMuted(v.muted);"""
new_mute_toggle1 = """                    v.muted = !v.muted;
                    setIsVideoMuted(v.muted);
                    setSoundEnabled(!v.muted);"""
content = content.replace(old_mute_toggle1, new_mute_toggle1)

# Fix 2: Prevent Flexbox from offsetting the crosshair center in React view
old_react_target = """                case 'target_focus':
                  return (
                    <div key={evt.id} className={`absolute z-20 flex items-center gap-3 ${baseAnim}`} style={{ top: '36%', left: '32%', transform: 'translate(-50%, -50%)' }}>
                       <div className="relative flex items-center justify-center">
                          <div className="absolute border-2 border-dashed border-red-500 rounded-full animate-[spin_4s_linear_infinite]" style={{ width: '9vh', height: '9vh' }} />
                          <div className="absolute border border-[#78C4EC] rounded-full animate-ping opacity-50" style={{ width: '5vh', height: '5vh' }} />
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                       </div>
                       <div className="bg-black/85 text-white px-3 py-1.5 rounded-full font-bold text-[1.8vh] shadow-xl whitespace-nowrap border border-white/20 ml-[4.5vh]">
                         🎯 {evt.title}｜{evt.subtitle}
                       </div>
                    </div>
                  );"""

new_react_target = """                case 'target_focus':
                  return (
                    <div key={evt.id} className={`absolute z-20 ${baseAnim}`} style={{ top: '36%', left: '32%' }}>
                       <div className="absolute flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
                          <div className="absolute border-2 border-dashed border-red-500 rounded-full animate-[spin_4s_linear_infinite]" style={{ width: '9vh', height: '9vh' }} />
                          <div className="absolute border border-[#78C4EC] rounded-full animate-ping opacity-50" style={{ width: '5vh', height: '5vh' }} />
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                       </div>
                       <div className="absolute top-[-2vh] left-[5.5vh] bg-black/85 text-white px-3 py-1.5 rounded-full font-bold text-[1.8vh] shadow-xl whitespace-nowrap border border-white/20">
                         🎯 {evt.title}｜{evt.subtitle}
                       </div>
                    </div>
                  );"""
content = content.replace(old_react_target, new_react_target)

with open("src/components/AiVideoPlayer.tsx", "w") as f:
    f.write(content)
