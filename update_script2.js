const fs = require('fs');

let content = fs.readFileSync('src/app/api/line/route.ts', 'utf8');

// 1. Update Help Menu literals
content = content.replace(/\$\{BOT_TITLE\}/g, '🤖 ユキ&トモヤ管理助手');
content = content.replace(/BOT_TITLE/g, '"🤖 ユキ&トモヤ管理助手"'); // Catch any stray ones if they exist

// 2. Update Group text logic
const groupLogicStart = `      const rawText = event.message.text.trim();

      // 1. 群組過濾
      const isCallingBot =
        rawText.includes("@ユキ&トモヤ管理助手") ||
        rawText.includes("ユキ&トモヤ") ||
        rawText.includes("@助手") ||
        rawText.includes("助手") ||
        rawText.includes("截圖") ||
        rawText.includes("修改") ||
        rawText.includes("幫助");

      if (isGroupChat && !isCallingBot) {
        continue;
      }`;

const newGroupLogic = `      const rawText = event.message.text.trim();
      const isGroup = event.source?.type === 'group' || event.source?.type === 'room';

      // Strictly require @ユキ&トモヤ管理助手 in group chats!
      if (isGroup && !rawText.includes('@ユキ&トモヤ管理助手') && !rawText.includes('@管理助手')) {
        continue; // Ignore normal group chat messages completely
      }

      // Strip the @ mention prefix so command matching works cleanly!
      let cleanText = rawText
        .replace(/@ユキ&トモヤ管理助手/g, '')
        .replace(/@管理助手/g, '')
        .replace(/^@\\S+\\s*/, '')
        .trim();

      // 1.5 Stitch commands (highest priority)
      if (cleanText.includes('開始串連') || cleanText.includes('串連模式')) {
        if (REDIS_URL) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();
          await client.set("line_video_stitch_queue", JSON.stringify([]));
          await client.set("line_video_stitch_mode", "collecting");
          await client.quit();

          await replyLine(
            replyToken,
            "🎬 已開啟【多片串連模式】！\\n請依序從手機上傳您要串連的第 1、2、3... 支影片到群組。\\n\\n全部傳完後，請輸入：\\n「@ユキ&トモヤ管理助手 完成串連：[背景音、台詞、是否需要特效字卡需求]」",
            undefined,
            targetId,
            startTime
          );
          continue;
        }
      }

      if (cleanText.startsWith('完成串連') || cleanText.startsWith('串連製片')) {
        if (REDIS_URL) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();
          const queueRaw = await client.get("line_video_stitch_queue");
          let videoUrls = queueRaw ? JSON.parse(queueRaw) : [];
          await client.set("line_video_stitch_mode", "idle");

          if (videoUrls.length === 0) {
            // Fallback to preview_video_data
            const prevDataStr = await client.get("preview_video_data");
            if (prevDataStr) {
               try {
                 const prevData = JSON.parse(prevDataStr);
                 if (prevData.videoUrls && prevData.videoUrls.length > 0) {
                    videoUrls = prevData.videoUrls;
                 }
               } catch (e) {}
            }
          }

          if (videoUrls.length > 0) {
             const directorPrompt = cleanText.split(/[:：]/).slice(1).join(':').trim() || "";

             const aiScript = {
               showCover: !directorPrompt.includes('不要片頭片尾'),
               showOutro: !directorPrompt.includes('不要片頭片尾'),
               showCards: !directorPrompt.includes('不要特效字卡'),
               audioConfig: {
                 clipMuted: videoUrls.map((_: any, i: number) => directorPrompt.includes(\`第\${i+1}段靜音\`)),
                 bgmStyle: 'warm_guitar'
               },
               subtitles: []
             };

             await client.set("preview_video_data", JSON.stringify({
                videoUrl: videoUrls[0],
                videoUrls,
                aiScript,
                timestamp: Date.now()
             }));

             const summary = \`✅ 🎬 串連製片完成！AI 導演已收到您的指示：\\n\${directorPrompt ? '- 導演需求：' + directorPrompt : '- 預設製片模式'}\\n\\n🔗 專屬預覽連結：https://yuki-tomoya-shop.vercel.app/?preview=video\`;
             await replyLine(
                replyToken,
                \`\${summary}\\n\\n💬 後續操作指令：\\n- 確認無誤請輸入：@ユキ&トモヤ管理助手 確認上架影片\\n- 想調整字卡或字幕請輸入：@ユキ&トモヤ管理助手 修改製片：[您的修改要求]\\n- 放棄請輸入：@ユキ&トモヤ管理助手 取消上架影片\`,
                undefined, targetId, startTime
             );
          } else {
             await replyLine(replyToken, "找不到任何串連影片，請重新使用「@ユキ&トモヤ管理助手 開始串連」上傳。", undefined, targetId, startTime);
          }
          await client.quit();
          continue;
        }
      }`;

content = content.replace(groupLogicStart, newGroupLogic);

// Replace `rawText.startsWith` with `cleanText.startsWith` for URL processing
content = content.replace(/if \(rawText\.startsWith\("http:\/\/"\) \|\| rawText\.startsWith\("https:\/\/"\)\) \{/, 'if (cleanText.startsWith("http://") || cleanText.startsWith("https://")) {');
content = content.replace(/const newVideoUrl = rawText;/g, 'const newVideoUrl = cleanText;');

// Fix `const cleanText = rawText` since we already declared `let cleanText`
content = content.replace(/const cleanText = rawText/g, 'cleanText = cleanText');

// Fix Help menu block
const helpMenuRegex = /if \(cleanText === "" \|\| cleanText === "幫助" \|\| cleanText === "說明"\) \{[\s\S]*?continue;\s*\}/g;
if (content.match(helpMenuRegex)) {
    const helpMenuStr = `if (cleanText === "" || cleanText === "幫助" || cleanText === "說明") {
        await replyLine(
          replyToken,
          "🤖 ユキ&トモヤ管理助手\\n您可以這樣交代我：\\n\\n• 標題改為：因颱風影響全館休息。\\n• 公告改為：民安少棒・巨人盃賽事直播中！\\n• 把「專業嚴選裝備」改成「職人嚴選裝備」\\n• 截圖（查看目前畫面）",
          undefined,
          targetId,
          startTime
        );
        continue;
      }`;
    content = content.replace(helpMenuRegex, helpMenuStr);
} else {
    // If it's at the end
    const lastHelp = `await replyLine(
        replyToken,
        "🤖 ユキ&トモヤ管理助手\\n您可以這樣交代我：\\n\\n• 標題改為：因颱風影響全館休息。\\n• 公告改為：民安少棒・巨人盃賽事直播中！\\n• 把「專業嚴選裝備」改成「職人嚴選裝備」\\n• 截圖（查看目前畫面）"
      , undefined, targetId, startTime);
    }

    return NextResponse.json({ success: true });`;

    const endMatch = /await replyLine\(\s*replyToken,\s*(?:"🤖 ユキ&トモヤ管理助手|"\${BOT_TITLE})[\s\S]*?return NextResponse.json\(\{ success: true \}\);/g;
    content = content.replace(endMatch, `if (cleanText === "" || cleanText === "幫助" || cleanText === "說明") {\n      ${lastHelp}\n      continue;\n      }\n    }\n\n    return NextResponse.json({ success: true });`);
}


// Replace uploadVideoToGitHub definition to include customFilename
const uploadVideoDefOld = `async function uploadVideoToGitHub(base64Content: string, isPreview: boolean = false): Promise<string | null> {`;
const uploadVideoDefNew = `async function uploadVideoToGitHub(base64Content: string, isPreview: boolean = false, customFilename?: string): Promise<string | null> {`;
content = content.replace(uploadVideoDefOld, uploadVideoDefNew);

const filenameOld = `const filename = isPreview ? \`preview-video-\${Date.now()}.mp4\` : "promo.mp4";`;
const filenameNew = `const filename = customFilename || (isPreview ? \`preview-video-\${Date.now()}.mp4\` : "promo.mp4");`;
content = content.replace(filenameOld, filenameNew);


// Video handling stitch mode logic
const videoHandlingStart = `      if (event.message.type === "video") {
        if (REDIS_URL && LINE_CHANNEL_ACCESS_TOKEN) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();`;

const newVideoHandling = `      if (event.message.type === "video") {
        if (REDIS_URL && LINE_CHANNEL_ACCESS_TOKEN) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();

          const stitchMode = await client.get("line_video_stitch_mode");
          if (stitchMode === "collecting") {
            const queueRaw = await client.get("line_video_stitch_queue");
            const queue: string[] = queueRaw ? JSON.parse(queueRaw) : [];

            try {
              const videoRes = await fetch(\`https://api-data.line.me/v2/bot/message/\${event.message.id}/content\`, {
                headers: { Authorization: \`Bearer \${LINE_CHANNEL_ACCESS_TOKEN}\` }
              });
              if (videoRes.ok) {
                const arrayBuffer = await videoRes.arrayBuffer();
                const b64 = Buffer.from(arrayBuffer).toString("base64");
                const filename = \`preview-clip-\${queue.length + 1}.mp4\`;
                const uploadedFilename = await uploadVideoToGitHub(b64, true, filename);

                if (uploadedFilename) {
                  const siteUrl = req.nextUrl.origin;
                  const newVideoUrl = \`\${siteUrl}/\${uploadedFilename}?t=\${Date.now()}\`;
                  queue.push(newVideoUrl);
                  await client.set("line_video_stitch_queue", JSON.stringify(queue));
                  await replyLine(replyToken, "✅ 已收到第 " + queue.length + " 段串連影片！\\n請繼續上傳下一支影片，或輸入：\\n「@ユキ&トモヤ管理助手 完成串連：[背景音/台詞/字卡需求]」", undefined, targetId, startTime);
                  await client.quit();
                  continue;
                }
              }
            } catch (err) {}
          }`;

content = content.replace(videoHandlingStart, newVideoHandling);

fs.writeFileSync('src/app/api/line/route.ts', content, 'utf8');
