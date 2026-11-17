'use client';

import React, { useEffect, useState } from 'react';
import {
  TomoyaCommerceState,
  DEFAULT_TOMOYA_COMMERCE_STATE,
  DualTrackType,
  SocialSourceType,
  CreatorViewType,
  RedirectTargetType,
  DualTrackMetricItem,
  calculateB2bSendaiExportSummary,
} from '../../lib/tomoya-commerce/types-and-catalog';

type HubTab = 'm3_utm' | 'm7_pool' | 'b2b_export';

export default function YukiTomoyaM3M7HubPage() {
  const [state, setState] = useState<TomoyaCommerceState>(
    DEFAULT_TOMOYA_COMMERCE_STATE
  );
  const [tab, setTab] = useState<HubTab>('m3_utm');
  const [toast, setToast] = useState<string>('');
  const [trackFilter, setTrackFilter] = useState<'all' | DualTrackType>('all');

  const [epCode, setEpCode] = useState<string>('EP02');
  const [source, setSource] = useState<SocialSourceType>('youtube');
  const [view, setView] = useState<CreatorViewType>('father');
  const [track, setTrack] = useState<DualTrackType>('baseball_gear');
  const [target, setTarget] = useState<RedirectTargetType>('sports');

  const [newName, setNewName] = useState<string>('');
  const [newTrack, setNewTrack] = useState<DualTrackType>('baseball_gear');
  const [newTwPrice, setNewTwPrice] = useState<number>(980);
  const [newJpCost, setNewJpCost] = useState<number>(3300);
  const [newUnits, setNewUnits] = useState<number>(10);

  useEffect(() => {
    fetch('/api/tomoya-m3m7', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d.state) setState(d.state);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const handleCreateUtm = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tomoya-m3m7', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_utm',
        campaign: {
          episodeCode: epCode.trim() || 'EP02',
          source,
          view,
          track,
          target,
        },
      }),
    });
    const d = await res.json();
    if (d?.ok && d.state) {
      setState(d.state);
      showToast('✅ 已建立社群導購 UTM 短網址！可直接複製貼入影片資訊欄');
    }
  };

  const handleCopyFullUrl = async (shortPath: string) => {
    const full = `${window.location.origin}${shortPath}`;
    await navigator.clipboard.writeText(full);
    showToast(`📋 已複製完整追蹤網址：${full}`);
  };

  const updateItemField = <K extends keyof DualTrackMetricItem>(
    productId: string,
    key: K,
    val: DualTrackMetricItem[K]
  ) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.productId === productId ? { ...it, [key]: val } : it
      ),
    }));
  };

  const handleSavePool = async () => {
    const res = await fetch('/api/tomoya-m3m7', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_items',
        items: state.items,
        exchangeRateJpyToTwd: state.exchangeRateJpyToTwd,
      }),
    });
    const d = await res.json();
    if (d?.ok && d.state) {
      setState(d.state);
      showToast('💾 已儲存雙軌選品測溫數據與預估採購量');
    }
  };

  const handleAddTestItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch('/api/tomoya-m3m7', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_test_item',
        newItem: {
          name: newName.trim(),
          categoryId: newTrack === 'baseball_gear' ? 'sports' : 'stationery',
          track: newTrack,
          twPriceTwd: newTwPrice,
          jpTaxInclCostJpy: newJpCost,
          sendaiB2bMarkupPct: 12,
          inquiryCount: 1,
          repurchaseCycleDays: 60,
          estMonthlyUnitsTw: newUnits,
          isCoreB2bExport: true,
        },
      }),
    });
    const d = await res.json();
    if (d?.ok && d.state) {
      setState(d.state);
      setNewName('');
      showToast('➕ 已加入雙軌試水溫選品池');
    }
  };

  const handleExportB2bCsv = () => {
    const header = [
      '商品代碼',
      '雙軌分類',
      '商品名稱',
      '日本含稅進價(JPY)',
      '仙台法人未稅進貨成本(JPY)',
      '對台B2B出口單價(JPY)',
      '台灣端月預估採購量(電商+新莊店)',
      '貢獻仙台法人月外銷流水(JPY)',
      '仙台法人預估消費稅出口退稅(JPY)',
    ].join(',');

    const rows = state.items
      .filter((i) => i.isCoreB2bExport && i.estMonthlyUnitsTw > 0)
      .map((i) => {
        const netCost = Math.round(i.jpTaxInclCostJpy / 1.1);
        const b2bUnit = Math.round(netCost * (1 + i.sendaiB2bMarkupPct / 100));
        const monthlyRev = b2bUnit * i.estMonthlyUnitsTw;
        const taxRefund = Math.round(
          (i.jpTaxInclCostJpy - i.jpTaxInclCostJpy / 1.1) * i.estMonthlyUnitsTw
        );
        const safeName = `"${i.name.replace(/"/g, '""')}"`;
        const trackLabel = i.track === 'baseball_gear' ? '少棒專業裝備' : '媽媽日系選物';
        return [
          i.productId,
          trackLabel,
          safeName,
          i.jpTaxInclCostJpy,
          netCost,
          b2bUnit,
          i.estMonthlyUnitsTw,
          monthlyRev,
          taxRefund,
        ].join(',');
      });

    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sendai_B2B_PurchaseForecast_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const summary = calculateB2bSendaiExportSummary(state);
  const filteredItems = state.items.filter((i) =>
    trackFilter === 'all' ? true : i.track === trackFilter
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl border border-sky-400/40 bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sky-900/80 border border-sky-400/40 px-2.5 py-0.5 text-xs font-bold text-sky-200">
                M3 + M7 電商雙軌中樞｜100% 獨立隔離
              </span>
              <span className="text-xs text-slate-400">
                ユキ&トモヤ ➔ 2028 新莊實體展售訓練店 ➔ 2029 仙台法人 B2B 營收輸血
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-white">
              🛍️⚾️ ユキ&トモヤ 社群導購追蹤 ＆ 對日 B2B 採購數據工作台
            </h1>
          </div>
          <button
            type="button"
            onClick={handleExportB2bCsv}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-extrabold text-white shadow cursor-pointer"
          >
            ⬇ 匯出對仙台法人 B2B 採購與退稅試算單 (.csv)
          </button>
        </div>

        {toast && (
          <div className="rounded-xl border border-sky-400 bg-sky-950/80 px-4 py-2.5 text-xs font-bold text-sky-200">
            {toast}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs text-slate-400">預估貢獻仙台法人月 B2B 外銷流水</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
              ¥{summary.totalMonthlySendaiExportJpy.toLocaleString()} / 月
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              年流水貢獻：¥{summary.totalAnnualSendaiExportJpy.toLocaleString()}（約 NT$
              {summary.totalAnnualSendaiExportTwd.toLocaleString()}）
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs text-slate-400">雙軌結構比重（裝備線 vs 媽媽選物線）</div>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              ⚾ {summary.baseballSharePct}% ／ 🍱 {summary.momSelectSharePct}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              裝備 ¥{summary.baseballMonthlyJpy.toLocaleString()} ｜ 媽媽選物 ¥
              {summary.momSelectMonthlyJpy.toLocaleString()}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs text-slate-400">仙台法人日本 10% 消費稅出口退稅預估</div>
            <div className="text-xl font-extrabold text-amber-300 font-mono mt-1">
              +¥{summary.monthlyJpConsumptionTaxRefundJpy.toLocaleString()} / 月
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              合法外銷零稅率退稅，直接增厚仙台事業體現金流
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab('m3_utm')}
            className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold cursor-pointer ${
              tab === 'm3_utm'
                ? 'bg-sky-400 text-slate-950'
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            🔗 M3 社群內容導購 ＆ UTM 短網址追蹤 ({state.campaigns.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('m7_pool')}
            className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold cursor-pointer ${
              tab === 'm7_pool'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            📦 M7 雙軌選品測溫池 ({state.items.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('b2b_export')}
            className={`rounded-xl px-4 py-2.5 text-xs md:text-sm font-extrabold cursor-pointer ${
              tab === 'b2b_export'
                ? 'bg-emerald-400 text-slate-950'
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            🧾 2029 對仙台法人 B2B 採購預測總表
          </button>
        </div>

        {tab === 'm3_utm' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleCreateUtm}
              className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-3 text-xs"
            >
              <h2 className="text-base font-bold text-sky-300">
                ➕ 建立影片／貼文專屬導購連結
              </h2>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1">對應集數／企劃代號</label>
                  <input
                    type="text"
                    value={epCode}
                    onChange={(e) => setEpCode(e.target.value)}
                    placeholder="例：EP02 或 Sendai01"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">發佈社群平台</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as SocialSourceType)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value="youtube">YouTube 資訊欄</option>
                    <option value="instagram">Instagram 貼文/主頁</option>
                    <option value="facebook">Facebook 粉專貼文</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">內容視角</label>
                  <select
                    value={view}
                    onChange={(e) => setView(e.target.value as CreatorViewType)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value="father">📷 爸爸總編導視角</option>
                    <option value="mother">🍱 媽媽後勤策展視角</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">選品軌道標籤</label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value as DualTrackType)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                  >
                    <option value="baseball_gear">⚾ 少棒專業裝備線</option>
                    <option value="mom_select">🍱 媽媽日系選物線</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">點擊後落地目標</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as RedirectTargetType)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                >
                  <option value="sports">站內：一、棒壘運動裝備</option>
                  <option value="stationery">站內：二、日本機能文具</option>
                  <option value="educational">站內：三、KUMON與益智教具</option>
                  <option value="health">站內：四、家庭保健保養</option>
                  <option value="creative">站內：五、仙台文創與後勤好物</option>
                  <option value="line_official">直連：ユキ&トモヤ 官方 LINE 好友</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-sky-400 hover:bg-sky-300 py-2.5 font-extrabold text-slate-950 cursor-pointer"
              >
                🔗 產出追蹤連結
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {state.campaigns.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-800 px-2 py-0.5 font-mono font-bold text-amber-300">
                        {c.episodeCode}
                      </span>
                      <span className="font-bold text-white uppercase">{c.source}</span>
                      <span className="text-slate-400">
                        ｜{c.view === 'father' ? '爸爸視角' : '媽媽視角'} ➔ {c.target}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-sky-300">{c.shortPath}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-emerald-400 font-mono">
                        {c.clicks} 次點擊
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyFullUrl(c.shortPath)}
                      className="rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 font-bold text-white cursor-pointer"
                    >
                      複製網址
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'm7_pool' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddTestItem}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end text-xs"
            >
              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1">新增試水溫選品名稱</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例：SSK 少年軟式打擊手套 / 仙台限定文具"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">雙軌歸屬</label>
                <select
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value as DualTrackType)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
                >
                  <option value="baseball_gear">⚾ 少棒專業裝備</option>
                  <option value="mom_select">🍱 媽媽日系選物</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">台灣售價 (TWD)</label>
                <input
                  type="number"
                  value={newTwPrice}
                  onChange={(e) => setNewTwPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">日本含稅進價 (JPY)</label>
                <input
                  type="number"
                  value={newJpCost}
                  onChange={(e) => setNewJpCost(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white font-mono"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-amber-400 hover:bg-amber-300 py-2 font-extrabold text-slate-950 cursor-pointer"
              >
                ➕ 新增測溫品
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTrackFilter('all')}
                  className={`rounded-lg px-3 py-1.5 font-bold cursor-pointer ${
                    trackFilter === 'all' ? 'bg-white text-slate-950' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  全部選品 ({state.items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTrackFilter('baseball_gear')}
                  className={`rounded-lg px-3 py-1.5 font-bold cursor-pointer ${
                    trackFilter === 'baseball_gear'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  ⚾ 少棒專業裝備線
                </button>
                <button
                  type="button"
                  onClick={() => setTrackFilter('mom_select')}
                  className={`rounded-lg px-3 py-1.5 font-bold cursor-pointer ${
                    trackFilter === 'mom_select'
                      ? 'bg-pink-400 text-slate-950'
                      : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  🍱 媽媽日系選物線
                </button>
              </div>
              <button
                type="button"
                onClick={handleSavePool}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-extrabold text-white cursor-pointer"
              >
                💾 儲存全部詢問度與預估採購量
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950 text-slate-400">
                  <tr>
                    <th className="p-3">軌道</th>
                    <th className="p-3">商品名稱</th>
                    <th className="p-3">日本含稅進價(JPY)</th>
                    <th className="p-3">家長詢問數</th>
                    <th className="p-3">台灣端月採購預估</th>
                    <th className="p-3">納入仙台B2B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {filteredItems.map((it) => (
                    <tr key={it.productId}>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`rounded px-2 py-0.5 font-bold ${
                            it.track === 'baseball_gear'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-pink-950 text-pink-300'
                          }`}
                        >
                          {it.track === 'baseball_gear' ? '⚾ 裝備' : '🍱 選物'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-white">{it.name}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={it.jpTaxInclCostJpy}
                          onChange={(e) =>
                            updateItemField(
                              it.productId,
                              'jpTaxInclCostJpy',
                              Number(e.target.value)
                            )
                          }
                          className="w-24 rounded border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-white"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={it.inquiryCount}
                          onChange={(e) =>
                            updateItemField(
                              it.productId,
                              'inquiryCount',
                              Number(e.target.value)
                            )
                          }
                          className="w-16 rounded border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-amber-300"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={it.estMonthlyUnitsTw}
                          onChange={(e) =>
                            updateItemField(
                              it.productId,
                              'estMonthlyUnitsTw',
                              Number(e.target.value)
                            )
                          }
                          className="w-16 rounded border border-slate-700 bg-slate-800 px-2 py-1 font-mono text-emerald-300"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={it.isCoreB2bExport}
                          onChange={(e) =>
                            updateItemField(
                              it.productId,
                              'isCoreB2bExport',
                              e.target.checked
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'b2b_export' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-emerald-300">
                  台灣端（ユキ&トモヤ 電商 ＋ 新莊棒球展售訓練店）對仙台法人常態採購預測
                </h2>
                <p className="text-slate-400 mt-0.5">
                  由日本仙台法人於日本國內含稅採購後，以 B2B 外銷批發出口予台灣事業體，合法創造日本法人經常性營收流水並申請 10% 消費稅退稅。
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportB2bCsv}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 font-bold text-white cursor-pointer"
              >
                ⬇ 下載 CSV 採購對帳單
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-2 pr-3">商品名稱</th>
                    <th className="py-2 pr-3">仙台未稅成本</th>
                    <th className="py-2 pr-3">B2B出口單價</th>
                    <th className="py-2 pr-3">月採購量</th>
                    <th className="py-2 pr-3">貢獻仙台月流水</th>
                    <th className="py-2">月出口退稅額</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {state.items
                    .filter((i) => i.isCoreB2bExport && i.estMonthlyUnitsTw > 0)
                    .map((i) => {
                      const netCost = Math.round(i.jpTaxInclCostJpy / 1.1);
                      const b2bUnit = Math.round(
                        netCost * (1 + i.sendaiB2bMarkupPct / 100)
                      );
                      const monthlyRev = b2bUnit * i.estMonthlyUnitsTw;
                      const refund = Math.round(
                        (i.jpTaxInclCostJpy - i.jpTaxInclCostJpy / 1.1) *
                          i.estMonthlyUnitsTw
                      );
                      return (
                        <tr key={i.productId}>
                          <td className="py-2.5 pr-3 font-semibold text-white">
                            {i.name}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-slate-300">
                            ¥{netCost.toLocaleString()}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-sky-300">
                            ¥{b2bUnit.toLocaleString()}
                          </td>
                          <td className="py-2.5 pr-3 font-mono text-white">
                            {i.estMonthlyUnitsTw}
                          </td>
                          <td className="py-2.5 pr-3 font-mono font-bold text-emerald-400">
                            ¥{monthlyRev.toLocaleString()}
                          </td>
                          <td className="py-2.5 font-mono text-amber-300">
                            +¥{refund.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
