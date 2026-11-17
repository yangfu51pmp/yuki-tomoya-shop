import { DEFAULT_PRODUCTS_CATALOG, ProductItem } from '../../types/ecommerce';

export const YUKI_TOMOYA_M3M7_CONFIG = {
  redisKeyPrefix: 'pinfu:yukitomoya:m3m7:v1',
  localFallbackFile: '/tmp/pinfu-yukitomoya-m3m7-state.json',
  defaultLineFriendUrl: 'https://lin.ee/5NNm9DC',
} as const;

export type DualTrackType = 'baseball_gear' | 'mom_select';
export type SocialSourceType = 'youtube' | 'instagram' | 'facebook';
export type CreatorViewType = 'father' | 'mother';
export type RedirectTargetType =
  | 'sports'
  | 'stationery'
  | 'educational'
  | 'health'
  | 'creative'
  | 'line_official';

export interface DualTrackMetricItem {
  productId: string;
  name: string;
  categoryId: string;
  track: DualTrackType;
  twPriceTwd: number;
  jpTaxInclCostJpy: number;
  sendaiB2bMarkupPct: number;
  inquiryCount: number;
  repurchaseCycleDays: number;
  estMonthlyUnitsTw: number;
  isCoreB2bExport: boolean;
}

export interface UtmCampaignRecord {
  id: string;
  createdAt: string;
  episodeCode: string;
  source: SocialSourceType;
  view: CreatorViewType;
  track: DualTrackType;
  target: RedirectTargetType;
  shortPath: string;
  clicks: number;
}

export interface TomoyaCommerceState {
  updatedAt: string;
  exchangeRateJpyToTwd: number;
  items: DualTrackMetricItem[];
  campaigns: UtmCampaignRecord[];
}

function inferDefaultJpCostJpy(item: ProductItem): number {
  return Math.round((item.price / 0.215) * 0.68);
}

export function buildInitialDualTrackItems(): DualTrackMetricItem[] {
  const mapped: DualTrackMetricItem[] = DEFAULT_PRODUCTS_CATALOG.map((p) => {
    const isBaseball = p.categoryId === 'sports';
    return {
      productId: p.id,
      name: p.name,
      categoryId: p.categoryId,
      track: isBaseball ? 'baseball_gear' : 'mom_select',
      twPriceTwd: p.price,
      jpTaxInclCostJpy: inferDefaultJpCostJpy(p),
      sendaiB2bMarkupPct: 12,
      inquiryCount: isBaseball ? 5 : 4,
      repurchaseCycleDays: p.categoryId === 'stationery' || p.categoryId === 'health' ? 45 : 180,
      estMonthlyUnitsTw: isBaseball ? 4 : 8,
      isCoreB2bExport: true,
    };
  });

  const extraYouthTestItems: DualTrackMetricItem[] = [
    {
      productId: 'sp-youth-1',
      name: '日本学童野球 J號軟式比賽練習球（一打12入）',
      categoryId: 'sports',
      track: 'baseball_gear',
      twPriceTwd: 1980,
      jpTaxInclCostJpy: 6600,
      sendaiB2bMarkupPct: 12,
      inquiryCount: 12,
      repurchaseCycleDays: 60,
      estMonthlyUnitsTw: 15,
      isCoreB2bExport: true,
    },
    {
      productId: 'mom-clean-1',
      name: '少棒媽媽救星｜日本激落球衣紅土草泥去漬皂組',
      categoryId: 'creative',
      track: 'mom_select',
      twPriceTwd: 350,
      jpTaxInclCostJpy: 990,
      sendaiB2bMarkupPct: 15,
      inquiryCount: 18,
      repurchaseCycleDays: 30,
      estMonthlyUnitsTw: 25,
      isCoreB2bExport: true,
    },
  ];

  return [...extraYouthTestItems, ...mapped];
}

export const DEFAULT_TOMOYA_COMMERCE_STATE: TomoyaCommerceState = {
  updatedAt: new Date().toISOString(),
  exchangeRateJpyToTwd: 0.215,
  items: buildInitialDualTrackItems(),
  campaigns: [
    {
      id: 'utm-ep01-yt',
      createdAt: '2026-11-18',
      episodeCode: 'EP01',
      source: 'youtube',
      view: 'father',
      track: 'baseball_gear',
      target: 'sports',
      shortPath: '/api/tomoya-utm?id=utm-ep01-yt',
      clicks: 7,
    },
    {
      id: 'utm-ep01-ig-mom',
      createdAt: '2026-11-18',
      episodeCode: 'EP01',
      source: 'instagram',
      view: 'mother',
      track: 'mom_select',
      target: 'stationery',
      shortPath: '/api/tomoya-utm?id=utm-ep01-ig-mom',
      clicks: 11,
    },
  ],
};

export interface B2bExportSummary {
  baseballMonthlyJpy: number;
  momSelectMonthlyJpy: number;
  totalMonthlySendaiExportJpy: number;
  totalAnnualSendaiExportJpy: number;
  totalAnnualSendaiExportTwd: number;
  monthlyJpConsumptionTaxRefundJpy: number;
  baseballSharePct: number;
  momSelectSharePct: number;
}

export function calculateB2bSendaiExportSummary(
  state: TomoyaCommerceState
): B2bExportSummary {
  let baseballMonthlyJpy = 0;
  let momSelectMonthlyJpy = 0;
  let monthlyJpConsumptionTaxRefundJpy = 0;

  for (const item of state.items) {
    if (!item.isCoreB2bExport || item.estMonthlyUnitsTw <= 0) continue;
    const jpNetExclTax = item.jpTaxInclCostJpy / 1.1;
    const taxPaidPerUnit = item.jpTaxInclCostJpy - jpNetExclTax;
    const b2bUnitExportJpy = Math.round(
      jpNetExclTax * (1 + item.sendaiB2bMarkupPct / 100)
    );
    const lineMonthlyJpy = b2bUnitExportJpy * item.estMonthlyUnitsTw;

    if (item.track === 'baseball_gear') {
      baseballMonthlyJpy += lineMonthlyJpy;
    } else {
      momSelectMonthlyJpy += lineMonthlyJpy;
    }
    monthlyJpConsumptionTaxRefundJpy += Math.round(
      taxPaidPerUnit * item.estMonthlyUnitsTw
    );
  }

  const totalMonthlySendaiExportJpy = baseballMonthlyJpy + momSelectMonthlyJpy;
  const totalAnnualSendaiExportJpy = totalMonthlySendaiExportJpy * 12;
  const totalAnnualSendaiExportTwd = Math.round(
    totalAnnualSendaiExportJpy * state.exchangeRateJpyToTwd
  );

  const baseballSharePct =
    totalMonthlySendaiExportJpy > 0
      ? Math.round((baseballMonthlyJpy / totalMonthlySendaiExportJpy) * 100)
      : 0;
  const momSelectSharePct =
    totalMonthlySendaiExportJpy > 0 ? 100 - baseballSharePct : 0;

  return {
    baseballMonthlyJpy,
    momSelectMonthlyJpy,
    totalMonthlySendaiExportJpy,
    totalAnnualSendaiExportJpy,
    totalAnnualSendaiExportTwd,
    monthlyJpConsumptionTaxRefundJpy,
    baseballSharePct,
    momSelectSharePct,
  };
}
