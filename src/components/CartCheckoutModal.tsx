import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus, Trash2, CheckCircle, Store, Send, Truck, CreditCard, MessageCircle, AlertCircle } from 'lucide-react';
import type { CartItem, ShippingMethod, PaymentMethod } from '@/lib/shop-db';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  lineOfficialUrl: string;
  onCheckoutSuccess?: (orderId: string) => void;
  clearCart: () => void;
}

export default function CartCheckoutModal({ isOpen, onClose, cartItems, updateQuantity, removeItem, lineOfficialUrl, onCheckoutSuccess, clearCart }: Props) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('711_store');
  const [shippingDetails, setShippingDetails] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate shipping cost
  let shippingCost = 0;
  if (totalAmount < 3000) {
      if (shippingMethod === '711_store' || shippingMethod === 'family_store') shippingCost = 60;
      else if (shippingMethod === 'tw_courier') shippingCost = 100;
  }
  if (shippingMethod === 'jp_ems_direct') shippingCost = 450; // Base estimate

  const finalTotal = totalAmount + shippingCost;

  const handleCheckout = async () => {
    if (!customerName || !customerPhone || !shippingDetails || !agreedTerms) return;
    if (paymentMethod === 'bank_transfer' && !paymentDetails) return;

    setIsSubmitting(true);
    try {
        const res = await fetch('/api/line', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'create_order',
                payload: {
                    phone: customerPhone,
                    name: customerName,
                    items: cartItems,
                    shippingMethod,
                    shippingDetails,
                    paymentMethod,
                    paymentDetails,
                    totalAmount: finalTotal
                }
            })
        });
        const data = await res.json();
        if (data.ok) {
            setOrderId(data.orderId);
            setStep('success');
            clearCart();
            if (onCheckoutSuccess) onCheckoutSuccess(data.orderId);
        } else {
            alert('訂單建立失敗，請稍後再試');
        }
    } catch (e) {
        alert('訂單建立發生錯誤');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="h-full w-full max-w-md bg-white shadow-2xl flex flex-col slide-in-from-right">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {step === 'cart' && <><ShoppingCart size={20} /> 購物車 ({cartItems.length})</>}
            {step === 'checkout' && <><CreditCard size={20} /> 結帳</>}
            {step === 'success' && <><CheckCircle size={20} className="text-green-600" /> 訂單成立</>}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {step === 'cart' && (
            <div className="space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center text-gray-500 py-10">購物車是空的</div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm flex gap-3">
                    {item.imageUrl ? (
                        /* eslint-disable @next/next/no-img-element */
                        <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                    ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center"><Store className="text-gray-400" /></div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.spec}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-bold text-[#78C4EC]">NT$ {item.price.toLocaleString()}</div>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-md p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded"><Minus size={14} /></button>
                          <span className="text-sm w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 self-start p-1"><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>
          )}

          {step === 'checkout' && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <h3 className="font-semibold text-gray-800 border-b pb-2">收件人資訊</h3>
                <input type="text" placeholder="真實姓名 (與 EZ WAY 認證一致)" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                <input type="tel" placeholder="手機號碼 (09xxxxxxxx)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
              </div>

              {/* Shipping Method */}
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <h3 className="font-semibold text-gray-800 border-b pb-2">物流方式</h3>
                <select value={shippingMethod} onChange={e => setShippingMethod(e.target.value as ShippingMethod)} className="w-full p-2 border rounded-md text-sm bg-gray-50">
                  <option value="711_store">7-11 店到店 (運費 NT$60)</option>
                  <option value="family_store">全家 店到店 (運費 NT$60)</option>
                  <option value="tw_courier">台灣郵寄/宅配 (運費 NT$100)</option>
                  <option value="jp_ems_direct">✈️ 日本郵便 EMS 國際直寄 (運費預估 NT$450)</option>
                  <option value="sendai_pickup">🏪 日本仙台店面取貨 (免運費 NT$0)</option>
                </select>

                {shippingMethod === 'jp_ems_direct' && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs p-3 rounded-md flex gap-2">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p>📦 採日本郵局 EMS 直寄，託運單設定由收件方（買家）負擔海關稅費，請填寫與 EZ WAY 易利委實名認證一致之真實姓名與手機號碼</p>
                    </div>
                )}

                <input
                    type="text"
                    placeholder={
                        shippingMethod === '711_store' ? "請填寫 7-11 門市名稱或店號" :
                        shippingMethod === 'family_store' ? "請填寫 全家 門市名稱或店號" :
                        shippingMethod === 'sendai_pickup' ? "預計前往仙台店面取貨日期/備註" : "請填寫台灣收件完整地址"
                    }
                    value={shippingDetails} onChange={e => setShippingDetails(e.target.value)}
                    className="w-full p-2 border rounded-md text-sm"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                <h3 className="font-semibold text-gray-800 border-b pb-2">付款方式</h3>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full p-2 border rounded-md text-sm bg-gray-50">
                  <option value="bank_transfer">銀行轉帳/匯款</option>
                  <option value="line_pay_confirm">LINE 聯繫確認付款</option>
                </select>
                {paymentMethod === 'bank_transfer' && (
                    <>
                        <input type="text" placeholder="匯款帳號末五碼 (尚未匯款可填待確認)" value={paymentDetails} onChange={e => setPaymentDetails(e.target.value)} className="w-full p-2 border rounded-md text-sm" />
                        <p className="text-xs text-gray-500">送出訂單後可至官方 LINE 確認庫存與索取匯款帳號</p>
                    </>
                )}
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} className="mt-1" />
                <span>我已閱讀並同意代購須知（了解代購屬客製化委任採買；台灣國內運費、EMS 直寄運費及海關抽驗產生之關稅由買家負擔）</span>
              </label>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center text-center py-10 space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">訂單已成功送出！</h3>
                <p className="text-gray-500 mt-2">感謝您的購買，我們已收到您的訂單。</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm w-full border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">專屬訂單編號</p>
                <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-bold text-lg text-[#78C4EC]">{orderId}</span>
                    <button
                        onClick={() => { navigator.clipboard.writeText(orderId); alert('已複製'); }}
                        className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
                    >複製</button>
                </div>
              </div>
              <a
                href={lineOfficialUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#06C755] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#05b34c] transition"
              >
                <MessageCircle size={20} />
                💬 點此開啟官方 LINE 傳送訂單編號・加速對帳與出貨通知
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="border-t p-4 bg-white space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>商品小計 ({cartItems.length} 件)</span>
                <span>NT$ {totalAmount.toLocaleString()}</span>
              </div>
              {step === 'checkout' && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>運費</span>
                  <span>NT$ {shippingCost.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                <span>總計</span>
                <span className="text-[#78C4EC]">NT$ {(step === 'checkout' ? finalTotal : totalAmount).toLocaleString()}</span>
              </div>
            </div>

            {step === 'cart' && (
              <button
                onClick={() => setStep('checkout')}
                disabled={cartItems.length === 0}
                className="w-full bg-[#78C4EC] text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5bb2df] transition"
              >
                前往結帳
              </button>
            )}

            {step === 'checkout' && (
              <div className="flex gap-3">
                <button onClick={() => setStep('cart')} className="px-4 py-3 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium">返回</button>
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting || !customerName || !customerPhone || !shippingDetails || !agreedTerms || (paymentMethod === 'bank_transfer' && !paymentDetails)}
                  className="flex-1 bg-[#78C4EC] text-white py-3 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5bb2df] transition flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <span className="animate-spin text-xl">↻</span> : '確認送出訂單'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
