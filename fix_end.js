const fs = require('fs');

let content = fs.readFileSync('src/app/api/line/route.ts', 'utf8');

const oldEnd = `      // 10. 一般引導回覆
      if (cleanText === "" || cleanText === "幫助" || cleanText === "說明") {
      await replyLine(
        replyToken,
        "🤖 ユキ&トモヤ管理助手\\n您可以這樣交代我：\\n\\n• 標題改為：因颱風影響全館休息。\\n• 公告改為：民安少棒・巨人盃賽事直播中！\\n• 把「專業嚴選裝備」改成「職人嚴選裝備」\\n• 截圖（查看目前畫面）"
      , undefined, targetId, startTime);
    }

    return NextResponse.json({ success: true });
      continue;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {`;

const newEnd = `      // 10. 一般引導回覆
      if (cleanText === "" || cleanText === "幫助" || cleanText === "說明") {
        await replyLine(
          replyToken,
          "🤖 ユキ&トモヤ管理助手\\n您可以這樣交代我：\\n\\n• 標題改為：因颱風影響全館休息。\\n• 公告改為：民安少棒・巨人盃賽事直播中！\\n• 把「專業嚴選裝備」改成「職人嚴選裝備」\\n• 截圖（查看目前畫面）"
        , undefined, targetId, startTime);
        continue;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {`;

content = content.replace(oldEnd, newEnd);
fs.writeFileSync('src/app/api/line/route.ts', content, 'utf8');
