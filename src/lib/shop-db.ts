import type { RedisClientType } from "redis";

export interface CartItem {
    id: string;
    name: string;
    spec: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

export type ShippingMethod = '711_store' | 'family_store' | 'tw_courier' | 'jp_ems_direct' | 'sendai_pickup';
export type PaymentMethod = 'bank_transfer' | 'line_pay_confirm';
export type OrderStatus = '訂單成立' | '款項確認' | '日本採購完成' | '仙台店面取貨' | '國際集運回台中' | '台灣已寄出' | '已完成';

export interface Order {
    orderId: string;
    phone: string;
    name: string;
    items: CartItem[];
    shippingMethod: ShippingMethod;
    shippingDetails: string;
    paymentMethod: PaymentMethod;
    paymentDetails?: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
}

export interface WishItem {
    wishId: string;
    phone: string;
    name: string;
    itemName: string;
    itemUrl?: string;
    budgetNotes?: string;
    createdAt: string;
}

function generateId(prefix: string): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${yyyy}${mm}${dd}-${random}`;
}

export async function createOrder(client: RedisClientType, payload: any): Promise<{ ok: boolean, orderId?: string, order?: Order }> {
    try {
        const orderId = generateId('YT');
        const order: Order = {
            orderId,
            phone: payload.phone,
            name: payload.name,
            items: payload.items,
            shippingMethod: payload.shippingMethod,
            shippingDetails: payload.shippingDetails,
            paymentMethod: payload.paymentMethod,
            paymentDetails: payload.paymentDetails,
            totalAmount: payload.totalAmount,
            status: '訂單成立',
            createdAt: new Date().toISOString()
        };

        await client.hSet('yt_orders', orderId, JSON.stringify(order));

        // Update customer profile
        const customerKey = `yt_customer_${payload.phone}`;
        const rawCustomer = await client.get(customerKey);
        const existingCustomer = rawCustomer ? JSON.parse(rawCustomer) : null;
        const newCustomer = {
            phone: payload.phone,
            name: payload.name,
            totalSpent: (existingCustomer?.totalSpent || 0) + payload.totalAmount,
            orders: [...(existingCustomer?.orders || []), orderId]
        };
        await client.set(customerKey, JSON.stringify(newCustomer));

        return { ok: true, orderId, order };
    } catch (e) {
        console.error('Failed to create order', e);
        return { ok: false };
    }
}

export async function createWish(client: RedisClientType, payload: any): Promise<{ ok: boolean, wishId?: string, wish?: WishItem }> {
    try {
        const wishId = generateId('WISH');
        const wish: WishItem = {
            wishId,
            phone: payload.phone,
            name: payload.name,
            itemName: payload.itemName,
            itemUrl: payload.itemUrl,
            budgetNotes: payload.budgetNotes,
            createdAt: new Date().toISOString()
        };

        await client.hSet('yt_wishes', wishId, JSON.stringify(wish));
        return { ok: true, wishId, wish };
    } catch (e) {
        console.error('Failed to create wish', e);
        return { ok: false };
    }
}

export async function queryOrders(client: RedisClientType, params: { phone?: string, orderId?: string }): Promise<Order[]> {
    try {
        if (params.orderId) {
            const rawOrder = await client.hGet('yt_orders', params.orderId);
            const order = rawOrder ? JSON.parse(rawOrder) : null as Order | null;
            return order ? [order] : [];
        }

        if (params.phone) {
            const customerKey = `yt_customer_${params.phone}`;
            const rawCustomer = await client.get(customerKey);
            const customer = rawCustomer ? JSON.parse(rawCustomer) : null;
            if (customer && customer.orders) {
                const ordersRaw = await Promise.all(customer.orders.map((id: string) => client.hGet('yt_orders', id)));
                const orders = ordersRaw.map((r: any) => r ? JSON.parse(r) : null);
                return orders.filter(Boolean) as Order[];
            }
        }

        return [];
    } catch (e) {
        console.error('Failed to query orders', e);
        return [];
    }
}
