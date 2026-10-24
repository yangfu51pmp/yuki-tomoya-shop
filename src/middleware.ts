import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (
    req.nextUrl.searchParams.get("screenshot") === "true" ||
    req.url.includes("screenshot=true") ||
    (req.headers.get("user-agent") && (req.headers.get("user-agent")!.includes("Microlink") || req.headers.get("user-agent")!.includes("HeadlessChrome")))
  ) {
    return NextResponse.next();
  }

  // 1. 排除 LINE Webhook 與 Next.js 內部靜態資源
  if (
    pathname.startsWith("/api/line") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth") // Optional: exclude next-auth endpoints if they exist
  ) {
    return NextResponse.next();
  }

  // 2. 雲端截圖專屬快速通道（確保截圖機器人能拍到完整頁面）
  const isScreenshot = req.nextUrl.searchParams.get("screenshot");
  if (isScreenshot === "true") {
    return NextResponse.next();
  }

  // 3. 處理表單密碼提交 (支援 LINE In-App Browser)
  if (req.method === 'POST') {
    try {
      const formData = await req.formData();
      const password = formData.get('password');
      const SITE_PASSWORD = process.env.SITE_PASSWORD || 'cafe888'; // fallback as requested

      if (password === SITE_PASSWORD) {
        // 重導回當前頁面或首頁，並寫入 Cookie 記住 30 天
        const url = req.nextUrl.clone();
        const response = NextResponse.redirect(url);
        response.cookies.set('yt_site_auth', 'authenticated', {
          path: '/',
          maxAge: 2592000,
          httpOnly: true
        });
        return response;
      }
    } catch (e) {
      console.error("Failed to parse form data in middleware", e);
    }
  }

  // 4. 驗證是否已登入
  const authCookie = req.cookies.get("yt_site_auth");
  const basicAuth = req.headers.get("authorization");

  let isAuthenticated = false;

  if (authCookie && authCookie.value === "authenticated") {
    isAuthenticated = true;
  }

  if (!isAuthenticated && basicAuth) {
    try {
      const authValue = basicAuth.split(" ")[1];
      const [user, pwd] = atob(authValue).split(":");
      const SITE_PASSWORD = process.env.SITE_PASSWORD || 'cafe888';

      // Admin username defaults to admin, matching password with SITE_PASSWORD
      if (user === "admin" && pwd === SITE_PASSWORD) {
        isAuthenticated = true;
      }
    } catch {
      // 驗證失敗繼續往下
    }
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  // 5. 未通過驗證回傳自訂 HTML 密碼輸入框
  const html = `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ユキ&トモヤ 日本選物代購｜專屬預覽</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background-color: #E5F3FC; /* SKY BLUE bg matching */
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .login-box {
          background: white;
          padding: 2.5rem 2rem;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(120, 196, 236, 0.2);
          text-align: center;
          border: 2px solid #78C4EC;
          max-width: 340px;
          width: 90%;
        }
        h1 {
          color: #78C4EC;
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          font-weight: bold;
          line-height: 1.4;
        }
        p {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }
        input[type="password"] {
          padding: 0.85rem;
          border: 1.5px solid #78C4EC;
          border-radius: 8px;
          width: 100%;
          box-sizing: border-box;
          margin-bottom: 1.2rem;
          outline: none;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        input[type="password"]:focus {
          border-color: #56A8D6;
          box-shadow: 0 0 0 3px rgba(120, 196, 236, 0.2);
        }
        button {
          background-color: #78C4EC;
          color: white;
          border: none;
          padding: 0.85rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          width: 100%;
          font-size: 1rem;
          transition: background 0.2s, transform 0.1s;
        }
        button:hover {
          background-color: #56A8D6;
        }
        button:active {
          transform: scale(0.98);
        }
        .brand {
          font-size: 0.8rem;
          color: #78C4EC;
          font-weight: bold;
          letter-spacing: 2px;
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="login-box">
        <div class="brand">YUKI & TOMOYA</div>
        <h1>日本選物代購<br>專屬預覽</h1>
        <p>請輸入管理密碼以訪問網站</p>
        <form method="POST">
          <input type="password" name="password" placeholder="請輸入密碼" required autofocus>
          <button type="submit">確認進入</button>
        </form>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 401,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'WWW-Authenticate': 'Basic realm="ユキ&トモヤ 日本選物代購 Private Staging"'
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
