import re

with open("src/components/AiVideoPlayer.tsx", "r") as f:
    content = f.read()

# target_focus canvas export replacement
old_canvas_target = """                        } else if (evt.type === 'target_focus') {
                           ctx.strokeStyle = 'red';
                           ctx.lineWidth = 4;
                           ctx.setLineDash([15, 15]);
                           ctx.beginPath();
                           ctx.arc(cx, cy, 60 * scaleX, 0, 2*Math.PI);
                           ctx.stroke();
                           ctx.setLineDash([]);

                           ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                           const tw = ctx.measureText(evt.title).width + 20;
                           drawRoundedRect(ctx, cx - tw/2, cy + 80 * scaleY, tw, 30 * scaleY, 4);
                           ctx.fillStyle = "#333";
                           ctx.textAlign = "center";
                           ctx.font = `bold ${14 * scaleY}px sans-serif`;
                           ctx.fillText(evt.title, cx, cy + 95 * scaleY);
                        }"""

new_canvas_target = """                        } else if (evt.type === 'target_focus') {
                           const tX = vw * 0.32;
                           const tY = vh * 0.36;
                           const radius1 = vh * 0.045;
                           const radius2 = vh * 0.025;

                           ctx.strokeStyle = 'red';
                           ctx.lineWidth = 3;
                           ctx.setLineDash([10, 5]);
                           ctx.beginPath();
                           ctx.arc(tX, tY, radius1, 0, 2*Math.PI);
                           ctx.stroke();

                           ctx.strokeStyle = '#78C4EC';
                           ctx.setLineDash([]);
                           ctx.beginPath();
                           ctx.arc(tX, tY, radius2, 0, 2*Math.PI);
                           ctx.stroke();

                           ctx.fillStyle = "red";
                           ctx.beginPath();
                           ctx.arc(tX, tY, 3, 0, 2*Math.PI);
                           ctx.fill();

                           ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                           const pillText = `🎯 ${evt.title}｜${evt.subtitle}`;
                           ctx.font = `bold ${vh * 0.025}px sans-serif`;
                           const tw = ctx.measureText(pillText).width + 20;
                           drawRoundedRect(ctx, tX + radius1 + 10, tY - vh * 0.02, tw, vh * 0.04, vh * 0.01);

                           ctx.fillStyle = "#fff";
                           ctx.textAlign = "center";
                           ctx.textBaseline = "middle";
                           ctx.fillText(pillText, tX + radius1 + 10 + tw/2, tY);
                           ctx.textBaseline = "alphabetic";
                        }"""

content = content.replace(old_canvas_target, new_canvas_target)

# target_focus React rendering replacement
old_react_target = """                case 'target_focus':
                  return (
                    <div key={evt.id} className={`absolute z-20 flex items-center justify-center ${baseAnim}`} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                       <div className="relative flex items-center justify-center">
                          <div className="absolute w-24 h-24 border-2 border-dashed border-red-500 rounded-full animate-[spin_4s_linear_infinite]" />
                          <div className="absolute w-32 h-32 border border-[#78C4EC] rounded-full animate-ping opacity-50" />
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                       </div>
                       <div className="absolute top-16 bg-white/90 px-3 py-1 rounded text-[#333] font-bold text-sm shadow-md whitespace-nowrap">
                         {evt.title}
                       </div>
                    </div>
                  );"""

new_react_target = """                case 'target_focus':
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

content = content.replace(old_react_target, new_react_target)

# Fix Top-Left Badge (✨ ユキ&トモヤ｜日本實拍) during Export
old_top_badge = """                    if (!(resolvedScript.cover && cTime <= 3.5)) {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                        drawRoundedRect(ctx, 20 * scaleX, 20 * scaleY, 170 * scaleX, 28 * scaleY, 14 * Math.min(scaleX, scaleY));
                        ctx.fillStyle = "#6d6d6d";
                        ctx.font = `bold ${12 * scaleY}px sans-serif`;
                        ctx.fillText("✨ ユキ&トモヤ｜日本實拍", 28 * scaleX, 34 * scaleY);
                    }"""

new_top_badge = """                    if (!(resolvedScript.cover && cTime <= 3.5)) {
                        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
                        drawRoundedRect(ctx, vw * 0.03, vh * 0.05, vw * 0.28, vh * 0.075, vh * 0.0375);
                        ctx.fillStyle = "#6d6d6d";
                        ctx.textAlign = "left";
                        ctx.textBaseline = "middle";
                        ctx.font = `bold ${vh * 0.035}px sans-serif`;
                        ctx.fillText("✨ ユキ&トモヤ｜日本實拍", vw * 0.03 + vw * 0.02, vh * 0.05 + vh * 0.0375);
                        ctx.textBaseline = "alphabetic";
                    }"""

content = content.replace(old_top_badge, new_top_badge)

# Fix React rendering Top-Left Badge style (must match export)
old_react_top_badge = """            {!activeEffects.cover && (
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                <span className="text-[10px] sm:text-xs font-bold text-[#6d6d6d]">✨ ユキ&トモヤ｜日本實拍</span>
              </div>
            )}"""

new_react_top_badge = """            {!activeEffects.cover && (
              <div className="absolute z-10 flex items-center justify-center bg-white/95 px-3 rounded-full shadow-sm border border-white/50" style={{ top: '5%', left: '3%', width: '28%', height: '7.5%' }}>
                <span className="font-bold text-[#6d6d6d] whitespace-nowrap" style={{ fontSize: '3.5cqh' }}>✨ ユキ&トモヤ｜日本實拍</span>
              </div>
            )}"""
content = content.replace(old_react_top_badge, new_react_top_badge)

with open("src/components/AiVideoPlayer.tsx", "w") as f:
    f.write(content)
