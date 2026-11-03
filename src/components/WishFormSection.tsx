import React, { useState } from 'react';
import { Send, Image as ImageIcon, MessageCircle } from 'lucide-react';

interface Props {
    lineOfficialUrl: string;
}

export default function WishFormSection({ lineOfficialUrl }: Props) {
    const [itemName, setItemName] = useState('');
    const [itemUrl, setItemUrl] = useState('');
    const [budgetNotes, setBudgetNotes] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wishId, setWishId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemName || !name || !phone) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/line', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_wish',
                    payload: {
                        itemName,
                        itemUrl,
                        budgetNotes,
                        name,
                        phone
                    }
                })
            });
            const data = await res.json();
            if (data.ok) {
                setWishId(data.wishId);
            } else {
                alert('許願單送出失敗，請稍後再試');
            }
        } catch (error) {
            alert('系統錯誤，請稍後再試');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (wishId) {
        return (
            <div className="bg-[#f8f9fa] rounded-2xl p-8 max-w-2xl mx-auto my-12 text-center border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-[#78C4EC]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">許願池已收到您的委託！</h2>
                <p className="text-gray-600 mb-6">我們的採購團隊會盡快在日本為您尋找此商品。</p>

                <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 max-w-sm mx-auto">
                    <p className="text-sm text-gray-500 mb-1">您的專屬許願單號</p>
                    <div className="font-mono font-bold text-xl text-[#78C4EC]">{wishId}</div>
                </div>

                <a
                    href={lineOfficialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#06C755] text-white px-6 py-3 rounded-full font-bold hover:bg-[#05b34c] transition-colors"
                >
                    <MessageCircle size={20} />
                    💬 點此開啟官方 LINE 傳送商品截圖與單號
                </a>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 md:p-8 max-w-3xl mx-auto my-12 border border-gray-100 shadow-lg">
            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                    <span className="text-[#78C4EC]">✨</span>
                    日本代購專屬許願池 / 專人尋物報價單
                </h2>
                <p className="text-gray-500 mt-2">找不到想要的商品？告訴我們，由日本在地職人團隊為您專屬尋找！</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                        <span className="bg-[#78C4EC] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                        商品資訊
                    </h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">想找的日本商品名稱 / 型號規格 <span className="text-red-500">*</span></label>
                        <input type="text" required value={itemName} onChange={e => setItemName(e.target.value)} placeholder="例如：久保田スラッガー KSG-L7S 軟式棒球手套" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#78C4EC] focus:border-transparent outline-none transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">日本參考網址或圖片連結 (選填)</label>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input type="url" value={itemUrl} onChange={e => setItemUrl(e.target.value)} placeholder="https://..." className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#78C4EC] focus:border-transparent outline-none transition" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">目標數量 / 預算備註 (選填)</label>
                        <textarea value={budgetNotes} onChange={e => setBudgetNotes(e.target.value)} placeholder="如有特定顏色、尺寸或預算上限請註明..." rows={3} className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#78C4EC] focus:border-transparent outline-none transition resize-none"></textarea>
                    </div>
                </div>

                <div className="space-y-4 pt-4">
                    <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                        <span className="bg-[#78C4EC] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                        聯絡資訊
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">聯絡人姓名 <span className="text-red-500">*</span></label>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="王大明" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#78C4EC] focus:border-transparent outline-none transition" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">手機號碼 <span className="text-red-500">*</span></label>
                            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xxxxxxxx" className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#78C4EC] focus:border-transparent outline-none transition" />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting || !itemName || !name || !phone}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <span className="animate-spin">↻</span> : <><Send size={20} /> 提交專屬許願單</>}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4">送出後，系統將提供單號，請截圖或直接複製傳送至官方 LINE 以加速專人為您服務。</p>
                </div>
            </form>
        </div>
    );
}
