import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "redis";

export const maxDuration = 60;

// 智慧輪詢等待部署完成
async function waitForDeployment(expectedText?: string) {
  console.log("Waiting 15 seconds before first deployment check...");
  await new Promise(r => setTimeout(r, 15000));

  for (let i = 0; i < 7; i++) {
    try {
      const url = `${SITE_URL}?_t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      const html = await res.text();

      if (expectedText && html.includes(expectedText)) {
        console.log(`Deployment verified: found expected text "${expectedText}" on attempt ${i + 1}.`);
        return; // Found text, skip waiting
      }
      console.log(`Deployment check attempt ${i + 1} did not find expected text. Checking again in 3s...`);
    } catch (e) {
      console.error(`Deployment check error on attempt ${i + 1}:`, e);
    }

    // Wait 3 seconds before the next check
    if (i < 6) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  console.log("Finished waiting for deployment (max attempts reached).");
}

const REDIS_URL =
  process.env.REDIS_URL ||
  process.env.STORAGE_URL ||
  process.env.KV_URL ||
  "";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const LINE_ADMIN_USER_ID = process.env.LINE_ADMIN_USER_ID || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

const BOT_TITLE = '【ユキ&トモヤ管理助手】';
const REPO_FULL_NAME = 'yangfu51pmp/yuki-tomoya-shop';

// 取得 SITE_URL 並清除可能的 Google 轉址與強制替換舊網址
const SITE_URL = "https://yuki-tomoya-shop.vercel.app";
// Removed google and old url replaces



// 提供給前端 page.tsx 即時讀取 Redis 標題、公告與連結的 GET 通道
export async function GET(req: NextRequest) {
  try {
    // 讀取網址參數讓 Next.js 自動判定為動態 API，無須額外設定 dynamic
    const _t = req.nextUrl.searchParams.get("t");

    if (!REDIS_URL) {
      return NextResponse.json({
        site_title: "",
        site_announcement: "",
        site_announcement_url: "",
        site_hero_image: "",
        _t,
      });
    }

    const client = createClient({ url: REDIS_URL });
    await client.connect();


    const catImgId = req.nextUrl.searchParams.get("cat_img");
    if (catImgId) {
      const b64 = await client.get(`yt_cat_img_${catImgId}_b64`);
      const mime = await client.get(`yt_cat_img_${catImgId}_mime`) || "image/jpeg";
      await client.quit();

      if (b64) {
        const buffer = Buffer.from(b64, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
      return new NextResponse("Not Found", { status: 404 });
    }

    if (req.nextUrl.searchParams.get("hero_img") === "1") {
      const b64 = await client.get("yt_site_hero_image_b64");
      const mime = await client.get("yt_site_hero_image_mime") || "image/png";
      await client.quit();

      if (b64) {
        const buffer = Buffer.from(b64, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": mime,
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
      return new NextResponse("Not Found", { status: 404 });
    }

    if (req.nextUrl.searchParams.get("promo_poster") === "1") {
      const b64 = await client.get("yt_site_promo_poster_b64");
      await client.quit();

      if (b64) {
        const buffer = Buffer.from(b64, "base64");
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      }
      return new NextResponse("Not Found", { status: 404 });
    }

    const [
      site_title, site_announcement, site_announcement_url, site_hero_image, site_promo_video, site_promo_video_title, site_promo_poster, site_promo_orientation,
      cat_img_1, cat_img_2, cat_img_3, cat_img_4, cat_img_5, cat_img_6, cat_img_7, cat_img_8,
      cat_products_1, cat_products_2, cat_products_3
    ] = await Promise.all([
      client.get("yt_site_title"),
      client.get("yt_site_announcement"),
      client.get("yt_site_announcement_url"),
      client.get("yt_site_hero_image"),
      client.get("yt_site_promo_video"),
      client.get("yt_site_promo_video_title"),
      client.get("yt_site_promo_poster"),
      client.get("yt_site_promo_orientation"),
      client.get("yt_cat_img_1"),
      client.get("yt_cat_img_2"),
      client.get("yt_cat_img_3"),
      client.get("yt_cat_img_4"),
      client.get("yt_cat_img_5"),
      client.get("yt_cat_img_6"),
      client.get("yt_cat_img_7"),
      client.get("yt_cat_img_8"),
      client.get("yt_cat_products_1"),
      client.get("yt_cat_products_2"),
      client.get("yt_cat_products_3"),
    ]);
    await client.quit();

    return NextResponse.json(
      {
        site_title: site_title || "",
        site_announcement: site_announcement || "",
        site_announcement_url: site_announcement_url || "",
        site_hero_image: site_hero_image || "",
        site_promo_video: site_promo_video || "",
        site_promo_video_title: site_promo_video_title || "",
        site_promo_poster: site_promo_poster || "",
        site_promo_orientation: site_promo_orientation || "",
        cat_img_1: cat_img_1 || "",
        cat_img_2: cat_img_2 || "",
        cat_img_3: cat_img_3 || "",
        cat_img_4: cat_img_4 || "",
        cat_img_5: cat_img_5 || "",
        cat_img_6: cat_img_6 || "",
        cat_img_7: cat_img_7 || "",
        cat_img_8: cat_img_8 || "",
        cat_products_1: cat_products_1 ? JSON.parse(cat_products_1) : null,
        cat_products_2: cat_products_2 ? JSON.parse(cat_products_2) : null,
        cat_products_3: cat_products_3 ? JSON.parse(cat_products_3) : null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("GET Redis error:", error);
    return NextResponse.json({
      site_title: "",
      site_announcement: "",
      site_announcement_url: "",
      site_hero_image: "",
    });
  }
}

function getJpegOrientation(buffer: Buffer): "vertical" | "horizontal" {
  try {
    let i = 0;
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) {
      return "horizontal";
    }
    i += 2;
    while (i < buffer.length) {
      if (buffer[i] !== 0xFF) break;
      while (buffer[i] === 0xFF) i++; // skip padding 0xFF
      const marker = buffer[i];
      i++;

      // SOF0, SOF1, SOF2
      if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
        const height = buffer.readUInt16BE(i + 3);
        const width = buffer.readUInt16BE(i + 5);
        return height > width ? "vertical" : "horizontal";
      } else {
        const length = buffer.readUInt16BE(i);
        i += length;
      }
    }
  } catch (e) {
    console.error("Failed to parse JPEG dimensions", e);
  }
  return "horizontal";
}


async function callOpenRouterText(prompt: string, models: string[]): Promise<string | null> {
  if (!OPENROUTER_API_KEY) return null;
  for (const model of models) {
    try {
      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const rawText = aiData?.choices?.[0]?.message?.content || "";
        if (rawText) return rawText.trim();
      }
    } catch (err) {
      console.error(`OpenRouter text model ${model} error:`, err);
    }
  }
  return null;
}

// 將中文轉換為英文商業攝影提示詞
async function translateToEnglishPrompt(chinesePrompt: string): Promise<string> {
  const prompt = `Translate the following user request into a precise English text-to-image prompt, optimized for a commercial photography style. Provide ONLY the translated English prompt, without any extra text or quotes: "${chinesePrompt}"`;
  const orResult = await callOpenRouterText(prompt, ["openai/gpt-4o-mini", "openai/gpt-4o"]);
  if (orResult) return orResult;

  const result = await callGeminiJson(prompt, true);
  if (result.translatedPrompt) {
    return result.translatedPrompt;
  }
  return chinesePrompt; // Fallback to original if AI fails
}

// 支援傳送文字與截圖
async function replyLine(replyToken: string, text: string, imageUrl?: string | null, targetId?: string, startTime?: number) {
  if (!LINE_CHANNEL_ACCESS_TOKEN) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [{ type: "text", text }];

  if (imageUrl) {
    messages.push({
      type: "image",
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl,
    });
  }

  let usePush = false;
  if (startTime && targetId) {
    const elapsed = Date.now() - startTime;
    if (elapsed > 25000) {
      usePush = true;
    }
  }

  const sendMessages = async (msgs: unknown[], push: boolean) => {
    const endpoint = push && targetId
      ? "https://api.line.me/v2/bot/message/push"
      : "https://api.line.me/v2/bot/message/reply";

    const body = push && targetId
      ? { to: targetId, messages: msgs }
      : { replyToken, messages: msgs };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(body),
    });

    return res;
  };

  let res;
  try {
    res = await sendMessages(messages, usePush);
  } catch (error) {
    console.error("sendMessages fetch threw an error:", error);
  }

  // 強制使用 pushMessage 保底：若回傳 400（token 過期）或其他錯誤，改呼叫 pushMessage API
  if ((!res || !res.ok) && !usePush && targetId) {
    console.log("replyMessage failed (token expired or other error), falling back to pushMessage");
    try {
      res = await sendMessages(messages, true);
    } catch (error) {
      console.error("fallback pushMessage also failed:", error);
    }
  }

  if (res && !res.ok && messages.length > 1) {
    console.log("Sending both text and image failed, retrying with only text");
    try {
      await sendMessages([{ type: "text", text }], true);
    } catch (error) {
      console.error("Final text-only push failed:", error);
    }
  }
}

// 雲端無人瀏覽器即時截圖（自動帶入 Redis 最新標題與公告，確保截圖 100% 零延遲）
async function captureWebsiteScreenshot(overrideTitle?: string, overrideNotice?: string, overrideBg?: string, overrideVideo?: string, overrideVideoTitle?: string, height: number = 1950): Promise<string | null> {
  try {
    let title = overrideTitle || "";
    let notice = overrideNotice || "";
    let bg = overrideBg || "";
    let video = overrideVideo || "";
    let videoTitle = overrideVideoTitle || "";
    let poster = "";
    let orientation = "";

    if ((!title || !notice || !bg || !video || !videoTitle) && REDIS_URL) {
      try {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        if (!title) title = (await client.get("yt_site_title")) || "";
        if (!notice) notice = (await client.get("yt_site_announcement")) || "";
        if (!bg) bg = (await client.get("yt_site_hero_image")) || "";
        if (!video) video = (await client.get("yt_site_promo_video")) || "";
        if (!videoTitle) videoTitle = (await client.get("yt_site_promo_video_title")) || "";
        poster = (await client.get("yt_site_promo_poster")) || "";
        orientation = (await client.get("yt_site_promo_orientation")) || "";
        await client.quit();
      } catch (e) {
        console.error("Redis read for screenshot error:", e);
      }
    }

    const params = new URLSearchParams({
      preview_key: "cafe888",
      t: String(Date.now()),
      cb: String(Date.now()),
    });
    if (title) params.set("live_title", title);
    if (notice) params.set("live_notice", notice);
    if (bg) params.set("live_bg", bg);
    if (video) params.set("live_video", video);
    if (videoTitle) params.set("live_video_title", videoTitle);
    if (poster) params.set("live_poster", poster);
    if (orientation) params.set("live_orientation", orientation);

    const targetUrl = `${SITE_URL}/?screenshot=true&t=${Date.now()}&${params.toString()}`;
    const screenshotApi = `https://api.microlink.io/?url=${encodeURIComponent(
      targetUrl
    )}&screenshot=true&meta=false&waitForTimeout=1500&viewport.isMobile=true&viewport.width=390&viewport.height=${height}&force=true`;

    let data;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        // Add fresh timestamp on retry to avoid microlink cache completely if needed, but the original logic didn't.
        // Actually, we'll just append it to targetUrl if it fails, or just fetch again.
        // Let's just fetch the screenshotApi.
        const res = await fetch(attempt === 1 ? screenshotApi : `${screenshotApi}&t=${Date.now()}`, { signal: controller.signal, cache: "no-store" });
        clearTimeout(timer);

        if (!res.ok) {
          throw new Error(`Screenshot attempt ${attempt} failed with status: ${res.status}`);
        }
        data = await res.json();

        if (data?.data?.screenshot?.url) {
          return data.data.screenshot.url;
        }
      } catch (err) {
        console.error(`Screenshot attempt ${attempt} failed:`, err);
        if (attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    return null;
  } catch (err) {
    console.error("截圖產生失敗:", err);
    return null;
  }
}

// 彈性字串替換函式
function applyFlexibleReplace(content: string, search: string, replace: string): { newContent: string; ok: boolean } {
  if (!search || !replace) return { newContent: content, ok: false };

  if (content.includes(search)) {
    return { newContent: content.replaceAll(search, replace), ok: true };
  }

  const normC = content.replace(/\r\n/g, "\n");
  const normS = search.replace(/\r\n/g, "\n");
  const normR = replace.replace(/\r\n/g, "\n");

  if (normC.includes(normS)) {
    return { newContent: normC.replaceAll(normS, normR), ok: true };
  }

  try {
    const escaped = normS
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "\\s+");
    const reg = new RegExp(escaped, "g");
    if (reg.test(normC)) {
      return { newContent: normC.replace(reg, normR), ok: true };
    }
  } catch (e) {
    console.error("Regex replacement error:", e);
  }

  // Fallback: Extremely flexible whitespace matcher
  try {
    // Strip ALL whitespace from both the source and search strings
    const stripWhitespace = (str: string) => str.replace(/\s+/g, '');
    const strippedC = stripWhitespace(normC);
    const strippedS = stripWhitespace(normS);

    const matchIndex = strippedC.indexOf(strippedS);
    if (matchIndex !== -1) {
      // We found a match when ignoring whitespace!
      // Now we need to find where this match starts and ends in the ORIGINAL string.
      let startIdxInOriginal = -1;
      let endIdxInOriginal = -1;
      let strippedIdx = 0;

      for (let i = 0; i < normC.length; i++) {
        if (!/\s/.test(normC[i])) {
          if (strippedIdx === matchIndex) {
            startIdxInOriginal = i;
          }
          if (strippedIdx === matchIndex + strippedS.length - 1) {
            endIdxInOriginal = i;
            break;
          }
          strippedIdx++;
        }
      }

      if (startIdxInOriginal !== -1 && endIdxInOriginal !== -1) {
        const pre = normC.substring(0, startIdxInOriginal);
        const post = normC.substring(endIdxInOriginal + 1);
        return { newContent: pre + normR + post, ok: true };
      }
    }
  } catch (e) {
    console.error("Advanced whitespace replacement error:", e);
  }

  return { newContent: content, ok: false };
}

// 呼叫 Gemini API（支援多模型自動容錯切換）
async function callGeminiJson(prompt: string, textOnly = false): Promise<{ summary?: string; operations?: Array<{ search: string; replace: string }>; translatedPrompt?: string; modelName?: string }> {
  if (!GEMINI_API_KEY) return {};

  const models = ["gemini-3.1-pro-preview", "gemini-3.1-pro", "gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"];

  for (const model of models) {
    try {
      const aiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: textOnly ? "text/plain" : "application/json",
              temperature: 0.1,
            },
          }),
        }
      );

      if (!aiRes.ok) continue;

      const aiData = await aiRes.json();
      const rawText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (!rawText) continue;

      if (textOnly) {
        return { translatedPrompt: rawText.trim(), modelName: model };
      }

      const rawJson = rawText.replace(/^```[a-zA-Z]*\n/m, "").replace(/\n```$/m, "").trim();
      const parsed = JSON.parse(rawJson);
      if (parsed && Array.isArray(parsed.operations) && parsed.operations.length > 0) {
        return { ...parsed, modelName: model };
      }
    } catch (err) {
      console.error(`Model ${model} error:`, err);
    }
  }

  return {};
}


// 呼叫 OpenRouter API
async function callOpenRouterJson(prompt: string, models: string[]): Promise<{ summary?: string; operations?: Array<{ search: string; replace: string }>; translatedPrompt?: string; modelName?: string; error?: string }> {
  if (!OPENROUTER_API_KEY) return { error: "尚未設定 OPENROUTER_API_KEY" };

  const jsonPrompt = prompt + "\n\n請務必只回傳包含 'summary' 與 'operations' 陣列的 JSON 格式字串，不要包含任何其他說明文字。";
  let lastError = "";

  for (const model of models) {
    try {
      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: jsonPrompt }],
        }),
      });

      if (!aiRes.ok) {
        lastError = `API 請求失敗 (狀態碼: ${aiRes.status})`;
        console.error(`OpenRouter ${model} failed with status: ${aiRes.status}`);
        continue;
      }

      const aiData = await aiRes.json();
      const rawText = aiData?.choices?.[0]?.message?.content || "";
      if (!rawText) {
        lastError = "模型沒有回傳內容";
        continue;
      }

      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        lastError = "回傳內容找不到 JSON 區塊";
        continue;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && Array.isArray(parsed.operations) && parsed.operations.length > 0) {
        return { ...parsed, modelName: model };
      } else {
        lastError = "回傳的 JSON 缺少 operations 或為空";
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`OpenRouter model ${model} error:`, err);
    }
  }

  return { error: `OpenRouter 呼叫失敗 (${lastError})` };
}

// GitHub 程式碼修改核心（用於服務項目文字、顏色、版面調整）
async function uploadVideoToGitHub(base64Content: string): Promise<boolean> {
  const githubToken = (process.env.GITHUB_TOKEN || '').trim();
  if (!githubToken) {
    console.error("No GITHUB_TOKEN provided.");
    return false;
  }

  try {
    let sha = "";
    // 1. 取得 public 目錄檔案列表，尋找 promo.mp4 以取得 sha
    const listRes = await fetch(`https://api.github.com/repos/${REPO_FULL_NAME}/contents/public`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (listRes.ok) {
      const files = await listRes.json();
      const existingFile = files.find((f: { name: string; sha: string }) => f.name === "promo.mp4");
      if (existingFile) {
        sha = existingFile.sha;
      }
    }

    // 2. 上傳或覆蓋檔案
    const putUrl = `https://api.github.com/repos/${REPO_FULL_NAME}/contents/public/promo.mp4`;
    const putBody: { message: string; content: string; branch: string; sha?: string } = {
      message: "Update promo.mp4 via LINE bot",
      content: base64Content,
      branch: "main",
    };
    if (sha) {
      putBody.sha = sha;
    }

    const putRes = await fetch(putUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(putBody),
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.error("GitHub API upload failed:", errText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("uploadVideoToGitHub error:", error);
    return false;
  }
}

async function modifyFrontendCode(userInstruction: string): Promise<{ success: boolean; message: string; modelName?: string; expectedText?: string }> {
  const githubToken = (process.env.GITHUB_TOKEN || '').trim();
  if (!githubToken) {
    return { success: false, message: "尚未在 Vercel 設定 GITHUB_TOKEN。" };
  }

  const getUrl = `https://api.github.com/repos/${REPO_FULL_NAME}/contents/src/app/page.tsx`;

  const getRes = await fetch(getUrl, {
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "SportCafe-Bot",
    },
    cache: "no-store",
  });

  if (!getRes.ok) {
    return { success: false, message: `讀取 GitHub 失敗 (狀態碼: ${getRes.status}, 路徑: ${getUrl}, Token: ${githubToken ? '已設定' : '未設定'})` };
  }

  const fileData = await getRes.json();
  const currentContent = Buffer.from(fileData.content, "base64").toString("utf-8");
  const fileSha = fileData.sha;

  // 判斷指令包含特定模型
  const claudeMatch = userInstruction.match(/用\s*claude/i);
  const gptMatch = userInstruction.match(/用\s*(?:chatgpt|openai|gpt)/i);
  const grokMatch = userInstruction.match(/用\s*grok/i);

  // 清除 "用XXX" 字樣
  const cleanInstruction = userInstruction
    .replace(/用\s*claude/ig, "")
    .replace(/用\s*(?:chatgpt|openai|gpt)/ig, "")
    .replace(/用\s*grok/ig, "")
    .trim();

  const finalPrompt = `你是一位精通 Tailwind CSS 與 Next.js 的資深前端工程師。
以下是 ユキ&トモヤ 日本選物代購 官網首頁檔案：src/app/page.tsx。

【色彩庫與 Class 映射】：
- 純金 / 香檳金: bg-[#C8A878] hover:bg-[#B89868] 或 bg-[#BA9868] hover:bg-[#a68455]
- LINE 綠色: bg-[#06C755] hover:bg-[#05b34c]
- 英爵酒紅: bg-[#7A1B28] hover:bg-[#63141f]

【重要處理規則】：
1. 根據管理員指令，精準找出 page.tsx 中需要被替換的文字內容（例如 services 陣列裡的標題或描述）或 Tailwind CSS 樣式（例如 pureGoldStyle）。
2. 回傳嚴格的 JSON 格式：
{
  "summary": "修改摘要說明",
  "operations": [
    {
      "search": "要被替換的原始程式碼片段",
      "replace": "替換後的新程式碼片段"
    }
  ]
}
3. 嚴禁回傳空的 operations！

【管理員指令】：
"${cleanInstruction}"

【目前首頁程式碼】：
${currentContent}`;

  let parsed: { summary?: string; operations?: Array<{ search: string; replace: string }>; modelName?: string; error?: string } = {};
  let openRouterError = "";

  if (grokMatch) {
    parsed = await callOpenRouterJson(finalPrompt, ["x-ai/grok-3-mini-beta", "x-ai/grok-3-beta", "openai/gpt-4o"]);
    if (parsed.error || (!parsed.operations || parsed.operations.length === 0)) {
      openRouterError = parsed.error || "Grok failed to return valid operations.";
      parsed = await callOpenRouterJson(finalPrompt, ["openai/gpt-4o"]);
    }
  } else if (claudeMatch) {
    parsed = await callOpenRouterJson(finalPrompt, ["anthropic/claude-3.5-sonnet", "openai/gpt-4o"]);
    if (parsed.error || (!parsed.operations || parsed.operations.length === 0)) {
      openRouterError = parsed.error || "Claude failed to return valid operations.";
      parsed = await callOpenRouterJson(finalPrompt, ["openai/gpt-4o"]);
    }
  } else if (gptMatch) {
    parsed = await callOpenRouterJson(finalPrompt, ["openai/gpt-4o"]);
    if (parsed.error) openRouterError = parsed.error;
  } else {
    // 預設 Gemini -> 備援 OpenAI GPT-4o
    parsed = await callGeminiJson(finalPrompt);
    if (!parsed.operations || parsed.operations.length === 0) {
      parsed = await callOpenRouterJson(finalPrompt, ["openai/gpt-4o"]);
      if (parsed.error) openRouterError = parsed.error;
    }
  }

  // AI 回傳若空，確保其結構存在
  if (!parsed.operations) {
    parsed.operations = [];
  }

  let updatedContent = currentContent;
  let appliedCount = 0;
  let expectedText = "";

  for (const op of parsed.operations) {
    if (!op.search || !op.replace) continue;
    const res = applyFlexibleReplace(updatedContent, op.search, op.replace);
    if (res.ok) {
      updatedContent = res.newContent;
      appliedCount++;
      if (!expectedText) {
        expectedText = op.replace;
      }
    }
  }

  // 強化「把 A 改成 B」精準替換保底機制
  if (appliedCount === 0) {
    const directMatch = cleanInstruction.match(/把[「『"']?([^」』"']+)[\」\』"']?\s*(?:改為|改成|換成|更改為|更改|修改為|修改)\s*[「『"']?([^」』"']+)[\」\』"']?/);
    if (directMatch) {
      const oldText = directMatch[1];
      const newText = directMatch[2];

      if (currentContent.includes(oldText)) {
        updatedContent = currentContent.replace(oldText, newText);
        appliedCount++;
        expectedText = newText;
        parsed.summary = `精準替換：「${oldText}」為「${newText}」`;
        parsed.modelName = parsed.modelName ? `${parsed.modelName} (Direct Replace)` : "Direct Replace";
      }
    }
  }

  if (appliedCount === 0) {
    let errorMsg = "在 page.tsx 中找不到對應的原始文字或樣式片段。";
    if (openRouterError) {
       errorMsg = `修改失敗，原因：${openRouterError}`;
    } else if (!parsed.operations || parsed.operations.length === 0) {
       errorMsg = "AI 未能明確定位要修改的代碼，請嘗試指定原文字（例如：把「專業嚴選裝備」改成「職人嚴選裝備」）。";
    }

    return { success: false, message: errorMsg };
  }

  if (updatedContent === currentContent) {
    return { success: false, message: "修改失敗：找不到符合的程式碼片段，請確認指定的區塊是否正確。" };
  }

  // 修改前，先將修改前的 currentContent 寫入 Redis
  if (REDIS_URL) {
    try {
      const redisClient = createClient({ url: REDIS_URL });
      await redisClient.connect();
      await redisClient.set("yt_site_page_prev_backup", currentContent);
      await redisClient.quit();
    } catch (e) {
      console.error("Backup to Redis failed before modifying code:", e);
    }
  }

  const putUrl = `https://api.github.com/repos/${REPO_FULL_NAME}/contents/src/app/page.tsx`;
  const putRes = await fetch(putUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "SportCafe-Bot",
    },
    body: JSON.stringify({
      message: `[ChatOps] ${parsed.summary || userInstruction.slice(0, 40)}`,
      content: Buffer.from(updatedContent, "utf-8").toString("base64"),
      sha: fileSha,
    }),
  });

  if (!putRes.ok) {
    const errData = await putRes.json();
    return { success: false, message: `GitHub 提交失敗: ${errData.message || putRes.statusText}` };
  }

  return { success: true, message: parsed.summary || "代碼已成功更新", modelName: parsed.modelName, expectedText };
}

export async function POST(req: NextRequest) {
  try {
    const startTime = Date.now();
    const body = await req.json();
    const events = body.events || [];

    for (const event of events) {
      if (event.type !== "message" || (event.message.type !== "text" && event.message.type !== "image" && event.message.type !== "video")) continue;

      const userId = event.source.userId;
      const replyToken = event.replyToken;
      const targetId = event.source.groupId || event.source.roomId || event.source.userId;
      const isGroupChat = event.source.type === "group" || event.source.type === "room";

      // 處理上傳圖片事件
      if (event.message.type === "image") {
        if (REDIS_URL && LINE_CHANNEL_ACCESS_TOKEN) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();
          const awaitingUpload = await client.get("yt_awaiting_bg_upload");

          if (awaitingUpload === "1") {
            try {
              const imageRes = await fetch(`https://api-data.line.me/v2/bot/message/${event.message.id}/content`, {
                headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
              });

              if (imageRes.ok) {
                const arrayBuffer = await imageRes.arrayBuffer();
                const b64 = Buffer.from(arrayBuffer).toString("base64");
                const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

                await client.set("yt_site_hero_image_b64", b64);
                await client.set("yt_site_hero_image_mime", mimeType);

                // Get the current base URL for the background
                const siteUrl = req.nextUrl.origin;
                const newBgUrl = `${siteUrl}/api/line?hero_img=1&t=${Date.now()}`;

                await client.set("yt_site_hero_image", newBgUrl);
                await client.del("yt_awaiting_bg_upload");
                await client.quit();

                try { revalidatePath("/"); } catch {}

                await new Promise((resolve) => setTimeout(resolve, 20000));
                const screenshot = await captureWebsiteScreenshot(undefined, undefined, newBgUrl);
                await replyLine(
                  replyToken,
                  `已將您傳送的照片設為官網背景！`,
                  screenshot
                , targetId, startTime);
                continue;
              }
            } catch (err) {
              console.error("Failed to process image upload:", err);
            }
          }

          const pendingProductImg = await client.get("yt_pending_product_img");
          if (pendingProductImg) {
            try {
              const { categoryIndex, productId } = JSON.parse(pendingProductImg);
              const imageRes = await fetch(`https://api-data.line.me/v2/bot/message/${event.message.id}/content`, {
                headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
              });

              if (imageRes.ok) {
                const arrayBuffer = await imageRes.arrayBuffer();
                const b64 = Buffer.from(arrayBuffer).toString("base64");

                // Upload to GitHub
                const githubToken = (process.env.GITHUB_TOKEN || '').trim();
                const filename = `product-${Date.now()}.jpg`;
                const putUrl = `https://api.github.com/repos/${REPO_FULL_NAME}/contents/public/${filename}`;

                if (githubToken) {
                  await fetch(putUrl, {
                    method: "PUT",
                    headers: {
                      Authorization: `Bearer ${githubToken}`,
                      Accept: "application/vnd.github.v3+json",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      message: `Add product image ${filename}`,
                      content: b64,
                      branch: "main",
                    }),
                  });
                }

                // Update product in Redis
                const listKey = `yt_cat_products_${categoryIndex}`;
                const existingData = await client.get(listKey);
                if (existingData) {
                  let products = JSON.parse(existingData);
                  products = products.map((p: any) => {
                    if (p.id === productId) {
                      return { ...p, imageUrl: `/${filename}` };
                    }
                    return p;
                  });
                  await client.set(listKey, JSON.stringify(products));
                }

                await client.del("yt_pending_product_img");
                await client.quit();

                try { revalidatePath("/"); } catch {}

                await new Promise((resolve) => setTimeout(resolve, 20000)); // wait for deployment/cache
                const screenshot = await captureWebsiteScreenshot();
                await replyLine(
                  replyToken,
                  `✅ 已成功為商品綁定照片！\n\n官網已即時生效：\n${SITE_URL}`,
                  screenshot,
                  targetId,
                  startTime
                );
                continue;
              }
            } catch (err) {
              console.error("Failed to process product image upload:", err);
            }
          }

          const awaitingCatUpload = await client.get("yt_awaiting_cat_upload");
          if (awaitingCatUpload) {
            try {
              const imageRes = await fetch(`https://api-data.line.me/v2/bot/message/${event.message.id}/content`, {
                headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
              });

              if (imageRes.ok) {
                const arrayBuffer = await imageRes.arrayBuffer();
                const b64 = Buffer.from(arrayBuffer).toString("base64");
                const mimeType = imageRes.headers.get("content-type") || "image/jpeg";

                await client.set(`yt_cat_img_${awaitingCatUpload}_b64`, b64);
                await client.set(`yt_cat_img_${awaitingCatUpload}_mime`, mimeType);

                const siteUrl = req.nextUrl.origin;
                const newCatUrl = `${siteUrl}/api/line?cat_img=${awaitingCatUpload}&t=${Date.now()}`;

                await client.set(`yt_cat_img_${awaitingCatUpload}`, newCatUrl);
                await client.del("yt_awaiting_cat_upload");
                await client.quit();

                try { revalidatePath("/"); } catch {}

                await new Promise((resolve) => setTimeout(resolve, 20000));
                const screenshot = await captureWebsiteScreenshot(undefined, undefined, undefined, undefined, undefined, 2400);
                await replyLine(
                  replyToken,
                  `✅ 已成功更新分類 ${awaitingCatUpload} 的專屬圖片！\n\n官網已即時生效：\n${SITE_URL}`,
                  screenshot
                , targetId, startTime);
                continue;
              }
            } catch (err) {
              console.error("Failed to process cat image upload:", err);
            }
          }
          await client.quit();
        }
        continue;
      }

      // 處理上傳影片事件
      if (event.message.type === "video") {
        if (REDIS_URL && LINE_CHANNEL_ACCESS_TOKEN) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();
          const awaitingVideoUpload = await client.get("yt_awaiting_video_upload");

          if (awaitingVideoUpload === "1") {
            // 立即刪除以防重複處理
            await client.del("yt_awaiting_video_upload");

            try {
              const videoRes = await fetch(`https://api-data.line.me/v2/bot/message/${event.message.id}/content`, {
                headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
              });

              if (videoRes.ok) {
                const arrayBuffer = await videoRes.arrayBuffer();
                const b64 = Buffer.from(arrayBuffer).toString("base64");

                const uploadSuccess = await uploadVideoToGitHub(b64);

                if (uploadSuccess) {
                  const siteUrl = req.nextUrl.origin;
                  const newVideoUrl = `${siteUrl}/promo.mp4?v=${Date.now()}`;

                  await client.set("yt_site_promo_video", newVideoUrl);

                  // Fetch and save video thumbnail
                  try {
                    const previewRes = await fetch(`https://api-data.line.me/v2/bot/message/${event.message.id}/content/preview`, {
                      headers: { Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}` }
                    });
                    if (previewRes.ok) {
                      const previewBuffer = await previewRes.arrayBuffer();
                      const bufferObj = Buffer.from(previewBuffer);
                      const orientation = getJpegOrientation(bufferObj);
                      const previewB64 = bufferObj.toString("base64");
                      await client.set("yt_site_promo_poster_b64", previewB64);
                      const posterUrl = `${siteUrl}/api/line?promo_poster=1&t=${Date.now()}`;
                      await client.set("yt_site_promo_poster", posterUrl);
                      await client.set("yt_site_promo_orientation", orientation);
                    }
                  } catch (e) {
                    console.error("Failed to fetch video preview:", e);
                  }

                  await client.quit();

                  try { revalidatePath("/"); } catch {}

                  await replyLine(
                    replyToken,
                    "✅ 已成功接收您的影片（自動適配橫式／直式比例）並推送至 GitHub！Vercel 正在背景部署中（約 20 秒後生效），稍後請輸入『截圖』驗收！"
                  , undefined, targetId, startTime);
                  continue;
                } else {
                  await client.quit();
                  await replyLine(replyToken, "影片檔案可能過大導致上傳失敗，建議您可以改貼 YouTube / Shorts 連結。", undefined, targetId, startTime);
                  continue;
                }
              }
            } catch (err) {
              console.error("Failed to process video upload:", err);
            }
          }
          await client.quit();
        }
        continue;
      }

      const rawText = event.message.text.trim();

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
      }

      // 1.5. 網址開頭自動處理 awaiting_video_upload
      if (rawText.startsWith("http://") || rawText.startsWith("https://")) {
        if (REDIS_URL) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();
          const awaitingVideoUpload = await client.get("yt_awaiting_video_upload");

          if (awaitingVideoUpload === "1") {
            const newVideoUrl = rawText;
            await client.set("yt_site_promo_video", newVideoUrl);
            await client.del("yt_awaiting_video_upload");
            await client.quit();

            try { revalidatePath("/"); } catch {}

            const screenshot = await captureWebsiteScreenshot(undefined, undefined, undefined, newVideoUrl);
            await replyLine(
              replyToken,
              `${BOT_TITLE}\n已成功接收並更新網站影片：\n${newVideoUrl}\n\n官網已即時生效：\n${SITE_URL}`,
              screenshot
            , targetId, startTime);
            continue;
          }
          await client.quit();
        }
      }

      // 2. 徹底清理輸入文字
      const cleanText = rawText
        .replace(/@Sport\s*Cafe\s*(管理)?助手/gi, "")
        .replace(/@Sport\s*Cafe/gi, "")
        .replace(/@ユキ&トモヤ/gi, "")
        .replace(/@日本代購管理助手/gi, "")
        .replace(/@\S+\s*/g, "")
        .replace(/^(Sport\s*Cafe\s*)?(管理)?助手\s*/i, "")
        .replace(/^[「『"“]|["”』」]$/g, "")
        .trim();

      // 3. 管理員身分白名單驗證
      const allowedAdmins = LINE_ADMIN_USER_ID.split(",").map((id) => id.trim()).filter(Boolean);
      if (allowedAdmins.length > 0 && !allowedAdmins.includes(userId)) {
        if (!isGroupChat) {
          await replyLine(replyToken, "【ユキ&トモヤ】抱歉，您尚未獲得管理員授權。", undefined, targetId, startTime);
        }
        continue;
      }

      // 3.5 新增／上架商品指令
      const addProductMatch = cleanText.match(/^(?:新增|上架)(文具|教材|小物|分類1|分類2|分類3)(?:商品)?[:：]\s*([^｜|]+)[｜|]([^｜|]+)[｜|](.+)$/);
      if (addProductMatch && REDIS_URL) {
        const catName = addProductMatch[1];
        let catIndex = "1";
        if (catName.includes("文具") || catName.includes("1")) catIndex = "1";
        else if (catName.includes("教材") || catName.includes("2")) catIndex = "2";
        else if (catName.includes("小物") || catName.includes("3")) catIndex = "3";

        const productName = addProductMatch[2].trim();
        const productPrice = addProductMatch[3].trim();
        const productDesc = addProductMatch[4].trim();
        const productId = Date.now().toString();

        const newProduct = {
          id: productId,
          name: productName,
          price: productPrice,
          desc: productDesc,
          imageUrl: "" // 將在收到圖片後更新
        };

        const client = createClient({ url: REDIS_URL });
        await client.connect();

        const listKey = `yt_cat_products_${catIndex}`;
        const existingData = await client.get(listKey);
        let products = [];
        if (existingData) {
          try {
            products = JSON.parse(existingData);
          } catch (e) {
            console.error("Parse products error:", e);
          }
        }
        products.push(newProduct);

        await client.set(listKey, JSON.stringify(products));
        // 設定 5 分鐘效期的等待狀態
        await client.set("yt_pending_product_img", JSON.stringify({ categoryIndex: catIndex, productId }), { EX: 300 });
        await client.quit();

        try { revalidatePath("/"); } catch {}

        await replyLine(
          replyToken,
          `已成功上架商品：${productName}\n\n請在 5 分鐘內直接傳送一張商品照片到群組，我會自動為此商品換上照片！`,
          undefined,
          targetId,
          startTime
        );
        continue;
      }

      // 3.6 刪除／下架商品指令
      const removeProductMatch = cleanText.match(/^(?:刪除|下架)(文具|教材|小物|分類1|分類2|分類3)(?:商品)?[:：]\s*(.+)$/);
      if (removeProductMatch && REDIS_URL) {
        const catName = removeProductMatch[1];
        let catIndex = "1";
        if (catName.includes("文具") || catName.includes("1")) catIndex = "1";
        else if (catName.includes("教材") || catName.includes("2")) catIndex = "2";
        else if (catName.includes("小物") || catName.includes("3")) catIndex = "3";

        const searchKeyword = removeProductMatch[2].trim();

        const client = createClient({ url: REDIS_URL });
        await client.connect();

        const listKey = `yt_cat_products_${catIndex}`;
        const existingData = await client.get(listKey);
        let products = [];
        if (existingData) {
          try {
            products = JSON.parse(existingData);
          } catch (e) {
            console.error("Parse products error:", e);
          }
        }

        const initialLength = products.length;
        products = products.filter((p: any) => !p.name.includes(searchKeyword));
        const removedCount = initialLength - products.length;

        if (removedCount > 0) {
          await client.set(listKey, JSON.stringify(products));
          await client.quit();
          try { revalidatePath("/"); } catch {}

          const screenshot = await captureWebsiteScreenshot();
          await replyLine(
            replyToken,
            `已成功下架包含「${searchKeyword}」的商品，共移除 ${removedCount} 筆！`,
            screenshot,
            targetId,
            startTime
          );
        } else {
          await client.quit();
          await replyLine(
            replyToken,
            `找不到名稱包含「${searchKeyword}」的商品。`,
            undefined,
            targetId,
            startTime
          );
        }
        continue;
      }

      // 4. 截圖指令
      const screenshotKeywords = ["截圖", "截取", "畫面", "看網站", "看首頁", "首頁圖", "預覽"];
      if (
        screenshotKeywords.some((kw) => cleanText.includes(kw)) &&
        !cleanText.includes("改") &&
        !cleanText.includes("換")
      ) {
        const screenshot = await captureWebsiteScreenshot();
        await replyLine(
          replyToken,
          `${BOT_TITLE}\n已為您即時抓取最新手機版官網畫面：\n${SITE_URL}`,
          screenshot
        , targetId, startTime);
        continue;
      }

      // 5. 稱讚與問候互動
      const praiseKeywords = ["很棒", "讚", "太棒", "辛苦", "謝謝", "感謝", "你好", "哈囉", "早安", "晚安", "厲害", "棒棒", "喜歡你"];
      if (
        praiseKeywords.some((kw) => cleanText.includes(kw)) &&
        cleanText.length < 15 &&
        !cleanText.includes("改") &&
        !cleanText.includes("換") &&
        !cleanText.includes("http")
      ) {
        await replyLine(
          replyToken,
          "謝謝誇獎！我隨時在線待命，有任何門市公告、標題文字、排版樣式或按鈕顏色要調整，隨時 @ 我交代即可 😊⚾☕"
        , undefined, targetId, startTime);
        continue;
      }

      // 6. 網址綁定公告（Redis 高速通道，0.1 秒生效）
      const urlMatch = rawText.match(/https?:\/\/[^\s]+/i);
      if (urlMatch && (cleanText.includes("連結") || cleanText.includes("公告") || cleanText.includes("網址") || cleanText.includes("直播"))) {
        const targetUrl = urlMatch[0];
        if (REDIS_URL) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();
          await client.set("yt_site_announcement_url", targetUrl);
          await client.quit();
          try { revalidatePath("/"); } catch {}

          const screenshot = await captureWebsiteScreenshot();
          await replyLine(
            replyToken,
            `${BOT_TITLE}\n已成功將公告連結綁定為：\n${targetUrl}\n\n官網已即時生效：\n${SITE_URL}`,
            screenshot
          , targetId, startTime);
          continue;
        }
      }

      // 7. 門市公告修改（Redis 高速通道，支援「公告改為...」、「把公告換成...」）
      const noticeMatch = cleanText.match(/(?:修改公告|改公告|公告(?:文字|內容)?(?:更改為?|修改為?|設定?為|改成|改為|換成))[：:\s]*(.+)/);
      if (noticeMatch && REDIS_URL) {
        const directNotice = noticeMatch[1].replace(/^[「『"“]|["”』」]$/g, "").trim();
        if (directNotice) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();
          await client.set("yt_site_announcement", directNotice);
          await client.quit();
          try { revalidatePath("/"); } catch {}

          const screenshot = await captureWebsiteScreenshot(undefined, directNotice);
          await replyLine(
            replyToken,
            `${BOT_TITLE}\n已成功更新門市公告：\n「${directNotice}」\n\n官網已即時生效：\n${SITE_URL}`,
            screenshot
          , targetId, startTime);
          continue;
        }
      }

      // 8. 網站主標題修改（Redis 高速通道，支援「標題改為...」、「把網頁主標題改成...」）
      const titleMatch = cleanText.match(/標題(?:文字|內容)?(?:更改為?|修改為?|設定?為|改成|改為|換成)[：:\s]*(.+)/);
      if (titleMatch && REDIS_URL) {
        const newTitle = titleMatch[1].replace(/^[「『"“]|["”』」]$/g, "").trim();
        if (newTitle) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();
          await client.set("yt_site_title", newTitle);
          await client.quit();
          try { revalidatePath("/"); } catch {}

          const screenshot = await captureWebsiteScreenshot(newTitle, undefined);
          await replyLine(
            replyToken,
            `${BOT_TITLE}\n已成功更新網站主標題：\n「${newTitle}」\n\n官網已即時生效：\n${SITE_URL}`,
            screenshot
          , targetId, startTime);
          continue;
        }
      }

      // 8.1 網站主視覺背景修改（Redis 高速通道，支援圖片/影片）
      const bgRestoreMatch = cleanText.match(/^(?:恢復|還原)(?:預設)?背景/);
      if (bgRestoreMatch && REDIS_URL) {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        await client.del("yt_site_hero_image");
        await client.quit();
        try { revalidatePath("/"); } catch {}

        await new Promise((resolve) => setTimeout(resolve, 20000));
        const screenshot = await captureWebsiteScreenshot();
        await replyLine(
          replyToken,
          `${BOT_TITLE}\n已為您恢復網站預設背景！\n\n官網已即時生效：\n${SITE_URL}`,
          screenshot
        , targetId, startTime);
        continue;
      }

      // 8.1.4 準備上傳分類圖片
      const catMatch = cleanText.match(/^(?:更換運動圖片|更換文具圖片|更換保健圖片|更換日常圖片|更換零食圖片|更換服飾圖片|更換精品圖片|更換文創圖片)/);
      if (catMatch && REDIS_URL) {
        const catMap: Record<string, string> = {
          "更換運動圖片": "1",
          "更換文具圖片": "2",
          "更換保健圖片": "3",
          "更換日常圖片": "4",
          "更換零食圖片": "5",
          "更換服飾圖片": "6",
          "更換精品圖片": "7",
          "更換文創圖片": "8"
        };
        const catId = catMap[catMatch[0]];
        if (catId) {
          const client = createClient({ url: REDIS_URL });
          await client.connect();
          await client.set("yt_awaiting_cat_upload", catId, { EX: 300 });
          await client.quit();

          await replyLine(
            replyToken,
            "請在 5 分鐘內直接傳送該分類的商品照片！"
          , undefined, targetId, startTime);
          continue;
        }
      }

      // 8.1.5 準備上傳背景
      const uploadBgMatch = rawText.match(/@Sport\s*Cafe\s*(管理)?助手\s*上傳背景/) || cleanText.match(/^(?:更換|換|修改|更新|設定)(?:主視覺|主題視覺|主題|背景|首頁|橫幅|Hero)(?:圖|圖片|照片|背景|視覺)?/i);
      if (uploadBgMatch && REDIS_URL) {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        await client.set("yt_awaiting_bg_upload", "1", { EX: 300 });
        await client.quit();

        await replyLine(
          replyToken,
          "請在 5 分鐘內直接傳送一張照片到群組，我會立刻幫您換成官網首頁背景！"
        , undefined, targetId, startTime);
        continue;
      }

      // 8.1.6 準備上傳影片
      const uploadVideoMatch = cleanText.match(/^(?:上傳影片|準備換影片)/);
      if (uploadVideoMatch && REDIS_URL) {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        await client.set("yt_awaiting_video_upload", "1", { EX: 300 });
        await client.quit();

        await replyLine(
          replyToken,
          "請在 5 分鐘內直接從手機傳送您的 1 分鐘影片到群組，或直接貼上 YouTube 影片網址！"
        , undefined, targetId, startTime);
        continue;
      }

      // 8.1.7 換影片網址
      const manualVideoMatch = cleanText.match(/^(?:把|將)?(?:網站|首頁|宣傳)?影片(?:網址|連結)?(?:改為|改成|換成|更改為|更改|設為|設定為|新增)[：:\s]*(https?:\/\/\S+)/i);
      if (manualVideoMatch && REDIS_URL) {
        const newVideoUrl = manualVideoMatch[1].trim();
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        await client.set("yt_site_promo_video", newVideoUrl);
        await client.quit();
        try { revalidatePath("/"); } catch {}

        const screenshot = await captureWebsiteScreenshot(undefined, undefined, undefined, newVideoUrl);
        await replyLine(
          replyToken,
          `${BOT_TITLE}\n已成功更新網站影片：\n${newVideoUrl}\n\n官網已即時生效：\n${SITE_URL}`,
          screenshot
        , targetId, startTime);
        continue;
      }

      // 8.1.8 改影片標題
      const titleVideoMatch = cleanText.match(/^(?:把|將)?影片標題(?:改為|改成|換成|更改為|更改|設為|設定為)[：:\s]*(.+)/i);
      if (titleVideoMatch && REDIS_URL) {
        const newVideoTitle = titleVideoMatch[1].trim();
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        await client.set("yt_site_promo_video_title", newVideoTitle);
        await client.quit();
        try { revalidatePath("/"); } catch {}

        const screenshot = await captureWebsiteScreenshot(undefined, undefined, undefined, undefined, newVideoTitle);
        await replyLine(
          replyToken,
          `${BOT_TITLE}\n已成功更新影片標題：\n「${newVideoTitle}」\n\n官網已即時生效：\n${SITE_URL}`,
          screenshot
        , targetId, startTime);
        continue;
      }

      // 8.1.9 隱藏/恢復影片
      const hideVideoMatch = cleanText.match(/^隱藏影片/);
      if (hideVideoMatch && REDIS_URL) {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        await client.set("yt_site_promo_video", "hidden");
        await client.quit();
        try { revalidatePath("/"); } catch {}

        const screenshot = await captureWebsiteScreenshot(undefined, undefined, undefined, "hidden");
        await replyLine(
          replyToken,
          `${BOT_TITLE}\n已隱藏宣傳影片區塊！\n\n官網已即時生效：\n${SITE_URL}`,
          screenshot
        , targetId, startTime);
        continue;
      }

      const showVideoMatch = cleanText.match(/^(?:顯示影片|恢復預設影片)/);
      if (showVideoMatch && REDIS_URL) {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        await client.del("yt_site_promo_video");
        await client.quit();
        try { revalidatePath("/"); } catch {}

        const screenshot = await captureWebsiteScreenshot();
        await replyLine(
          replyToken,
          `${BOT_TITLE}\n已恢復預設宣傳影片！\n\n官網已即時生效：\n${SITE_URL}`,
          screenshot
        , targetId, startTime);
        continue;
      }


      // 8.1.10 恢復上一版
      const restoreMatch = cleanText.match(/^(?:恢復上一版|恢復回上一版|還原上一版|恢復前一版)/);
      const githubToken = (process.env.GITHUB_TOKEN || '').trim();
      if (restoreMatch && githubToken) {
        try {
          // 先取得目前線上的最新內容與 sha
          const currFileRes = await fetch(`https://api.github.com/repos/${REPO_FULL_NAME}/contents/src/app/page.tsx`, {
            headers: {
              "Authorization": `Bearer ${githubToken}`,
              "Accept": "application/vnd.github.v3+json",
              "User-Agent": "Sport-Cafe-Bot"
            },
            cache: "no-store"
          });
          const currFileData = await currFileRes.json();
          const currContentBase64 = currFileData.content || "";
          const currContent = Buffer.from(currContentBase64, 'base64').toString('utf8');
          const currentSha = currFileData.sha;

          let previousContent = "";
          let redisClient;

          // 第一重保障：從 Redis 讀取備份
          if (REDIS_URL) {
            redisClient = createClient({ url: REDIS_URL });
            await redisClient.connect();
            previousContent = (await redisClient.get("yt_site_page_prev_backup")) || "";
          }

          // 如果 Redis 沒資料，嘗試第二重保障：從 GitHub Commits API 取得前一版
          if (!previousContent) {
            const commitsRes = await fetch(`https://api.github.com/repos/${REPO_FULL_NAME}/commits?path=src/app/page.tsx&per_page=2`, {
              headers: {
                "Authorization": `Bearer ${githubToken}`,
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Sport-Cafe-Bot"
              }
            });
            const commitsData = await commitsRes.json();

            if (commitsRes.ok && commitsData.length > 1) {
              const previousCommitSha = commitsData[1].sha;

              const fileRes = await fetch(`https://api.github.com/repos/${REPO_FULL_NAME}/contents/src/app/page.tsx?ref=${previousCommitSha}`, {
                headers: {
                  "Authorization": `Bearer ${githubToken}`,
                  "Accept": "application/vnd.github.v3+json",
                  "User-Agent": "Sport-Cafe-Bot"
                }
              });
              const fileData = await fileRes.json();

              if (fileRes.ok && fileData.content) {
                previousContent = Buffer.from(fileData.content, 'base64').toString('utf8');
              }
            }
          }

          if (previousContent) {
            const updateRes = await fetch(`https://api.github.com/repos/${REPO_FULL_NAME}/contents/src/app/page.tsx`, {
              method: 'PUT',
              headers: {
                "Authorization": `Bearer ${githubToken}`,
                "Accept": "application/vnd.github.v3+json",
                "User-Agent": "Sport-Cafe-Bot"
              },
              body: JSON.stringify({
                message: 'Revert: 恢復上一版 src/app/page.tsx',
                content: Buffer.from(previousContent).toString('base64'),
                sha: currentSha
              })
            });

            if (updateRes.ok) {
              // 恢復成功後，將被覆蓋的版本存入 Redis 備份（交換）
              if (redisClient) {
                await redisClient.set("yt_site_page_prev_backup", currContent);
                await redisClient.quit();
              }

              await waitForDeployment();
              const screenshot = await captureWebsiteScreenshot();
              await replyLine(
                replyToken,
                `${BOT_TITLE}\n已成功為您恢復為上一版的版面狀態！`,
                screenshot
              , targetId, startTime);
              continue;
            } else {
              if (redisClient) await redisClient.quit();
              await replyLine(replyToken, `${BOT_TITLE}恢復失敗：更新 GitHub 檔案時發生錯誤。`, undefined, targetId, startTime);
              continue;
            }
          } else {
             if (redisClient) await redisClient.quit();
             await replyLine(replyToken, `${BOT_TITLE}恢復失敗：找不到前一版的歷史紀錄。`, undefined, targetId, startTime);
             continue;
          }
        } catch {
           await replyLine(replyToken, `${BOT_TITLE}恢復失敗：發生系統例外錯誤。`, undefined, targetId, startTime);
           continue;
        }
      }
      const manualBgMatch = cleanText.match(/^(?:把|將)?(?:網站|首頁)?背景(?:圖|圖片|照片|影片|視覺)?(?:改為|改成|換成|更改為|更改|修改為|修改|設為|設定為)[：:\s]*(https?:\/\/\S+)/i);
      if (manualBgMatch && REDIS_URL) {
        const newBgUrl = manualBgMatch[1].trim();
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        await client.set("yt_site_hero_image", newBgUrl);
        await client.quit();
        try { revalidatePath("/"); } catch {}

        await new Promise((resolve) => setTimeout(resolve, 20000));
        const screenshot = await captureWebsiteScreenshot(undefined, undefined, newBgUrl);
        await replyLine(
          replyToken,
          `${BOT_TITLE}\n已成功更新網站背景：\n${newBgUrl}\n\n官網已即時生效：\n${SITE_URL}`,
          screenshot
        , targetId, startTime);
        continue;
      }

      // 8.2 AI 自動生圖換背景
      const autoBgMatch = cleanText.match(/^(?:背景生圖|AI生圖|生成背景|產生背景|生圖換背景)[：:\s]*(.+)/i);
      if (autoBgMatch && REDIS_URL && GEMINI_API_KEY) {
        const userPrompt = autoBgMatch[1].trim();
        const englishPrompt = await translateToEnglishPrompt(userPrompt);

        let finalBase64 = "";
        let finalMime = "";
        let isSuccess = false;

        // 嘗試第一順位: gemini-2.0-flash-preview-image-generation (or exp)
        try {
          const genRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Generate a high quality vertical photo: " + englishPrompt }] }],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
            })
          });

          if (genRes.ok) {
            const data = await genRes.json();
            const parts = data?.candidates?.[0]?.content?.parts || [];
            for (const p of parts) {
              if (p.inlineData?.data) {
                finalBase64 = p.inlineData.data;
                finalMime = p.inlineData.mimeType || "image/jpeg";
                isSuccess = true;
                break;
              }
            }
          }
        } catch (e) {
          console.error("Gemini image gen error 1:", e);
        }

        // 嘗試第二順位: imagen-3.0-generate-002
        if (!isSuccess) {
          try {
            const imgRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                instances: [{ prompt: englishPrompt }],
                parameters: { sampleCount: 1, aspectRatio: "3:4" }
              })
            });
            if (imgRes.ok) {
              const data = await imgRes.json();
              if (data?.predictions?.[0]?.bytesBase64Encoded) {
                finalBase64 = data.predictions[0].bytesBase64Encoded;
                finalMime = "image/jpeg";
                isSuccess = true;
              }
            }
          } catch (e) {
            console.error("Gemini image gen error 2:", e);
          }
        }

        const client = createClient({ url: REDIS_URL });
        await client.connect();

        let newBgUrl = "";

        if (isSuccess && finalBase64) {
          await client.set("yt_site_hero_image_b64", finalBase64);
          await client.set("yt_site_hero_image_mime", finalMime);
          newBgUrl = `${req.nextUrl.origin}/api/line?hero_img=1&t=${Date.now()}`;
          await client.set("yt_site_hero_image", newBgUrl);
        } else {
          // 【Pollinations Flux 真實生圖備援】
          try {
            const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(englishPrompt)}?width=1080&height=1350&nologo=true&model=flux&seed=${Date.now()}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

            const polliRes = await fetch(pollinationsUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (polliRes.ok) {
              const buffer = await polliRes.arrayBuffer();
              finalBase64 = Buffer.from(buffer).toString("base64");
              finalMime = polliRes.headers.get("content-type") || "image/jpeg";
              isSuccess = true;

              await client.set("yt_site_hero_image_b64", finalBase64);
              await client.set("yt_site_hero_image_mime", finalMime);
              newBgUrl = `${req.nextUrl.origin}/api/line?hero_img=1&t=${Date.now()}`;
              await client.set("yt_site_hero_image", newBgUrl);
            }
          } catch (e) {
            console.error("Pollinations image fetch error:", e);
          }

          if (!isSuccess) {
            newBgUrl = "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&q=80"; // Ultimate fallback
            await client.set("yt_site_hero_image", newBgUrl);
          }
        }

        await client.quit();
        try { revalidatePath("/"); } catch {}

        await new Promise((resolve) => setTimeout(resolve, 20000));
        const screenshot = await captureWebsiteScreenshot(undefined, undefined, newBgUrl);
        await replyLine(
          replyToken,
          `已為您 AI 生成並更新網站背景！\n\n生成提示詞：${englishPrompt}\n\n官網已即時生效：\n${SITE_URL}`,
          screenshot
        , targetId, startTime);
        continue;
      }

      // 9. 智慧代碼與文字修改核心（用於服務項目文字、顏色、版面調整）
      const codeKeywords = ["改", "換", "修改", "顏色", "排版", "按鈕", "版面", "設計", "字體", "背景", "風格", "調整", "增加", "刪除", "電腦版", "手機版"];
      const isCodeModification = codeKeywords.some((kw) => cleanText.includes(kw));

      if (isCodeModification && (process.env.GITHUB_TOKEN || '').trim()) {
        const result = await modifyFrontendCode(cleanText);

        if (result.success) {
          await waitForDeployment(result.expectedText);
          const newScreenshotUrl = await captureWebsiteScreenshot();
          await replyLine(
            replyToken,
            `【ユキ&トモヤ AI 工程師 (由 ${result.modelName || "AI"} 提供)】🛠️\n已成功為您調整網站代碼：${result.message}！\n\n⚡ 已自動推送到 GitHub 並完成部署，附上最新畫面！`,
            newScreenshotUrl
          , targetId, startTime);
          continue;
        } else {
          await replyLine(replyToken, `${BOT_TITLE}調整未完成：${result.message}`, undefined, targetId, startTime);
          continue;
        }
      }

      // 10. 一般引導回覆
      await replyLine(
        replyToken,
        "${BOT_TITLE}\n您可以這樣交代我：\n\n• 標題改為：因颱風影響全館休息。\n• 公告改為：民安少棒・巨人盃賽事直播中！\n• 把「專業嚴選裝備」改成「職人嚴選裝備」\n• 截圖（查看目前畫面）"
      , undefined, targetId, startTime);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    console.error("LINE webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
