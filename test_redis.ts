import { createClient } from "redis";
async function main() {
    const REDIS_URL = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || "";
    if (REDIS_URL) {
        const client = createClient({ url: REDIS_URL });
        await client.connect();
        await client.set("yt_preview_video", "https://assets.mixkit.co/videos/preview/mixkit-pouring-coffee-into-a-cup-41545-large.mp4");
        await client.set("yt_preview_ai_script", "{}");
        await client.quit();
        console.log("Redis keys set.");
    } else {
        console.log("No REDIS_URL available");
    }
}
main();
