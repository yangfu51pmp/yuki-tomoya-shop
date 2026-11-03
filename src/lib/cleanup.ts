import type { RedisClientType } from "redis";

export async function runSystemCleanup(client: RedisClientType): Promise<string> {
    const deletedKeys: string[] = [];

    // Clear Redis temporary preview keys
    try {
        await client.del('line_video_stitch_queue');
        await client.del('yt_video_script_preview');
        deletedKeys.push('line_video_stitch_queue', 'yt_video_script_preview');
    } catch (e) {
        console.error('Redis cleanup error', e);
    }

    let vercelSummary = '無 Vercel Token，跳過部署清理';

    if (process.env.VERCEL_TOKEN) {
        try {
            const res = await fetch('https://api.vercel.com/v6/deployments?limit=30', {
                headers: {
                    'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                const deployments = data.deployments || [];

                if (deployments.length > 3) {
                    const toDelete = deployments.slice(3);
                    for (const dep of toDelete) {
                        await fetch(`https://api.vercel.com/v13/deployments/${dep.uid}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`
                            }
                        });
                    }
                    vercelSummary = `已保留最新 3 筆部署，成功刪除 ${toDelete.length} 筆舊部署快照`;
                } else {
                    vercelSummary = `目前僅有 ${deployments.length} 筆部署，無需清理`;
                }
            } else {
                vercelSummary = `讀取 Vercel 部署失敗: ${res.status}`;
            }
        } catch (e) {
            vercelSummary = `清理 Vercel 部署發生錯誤`;
            console.error(e);
        }
    }

    return `🧹 系統空間清理完畢\n- 釋放暫存鍵值: ${deletedKeys.join(', ')}\n- Vercel 狀態: ${vercelSummary}`;
}
