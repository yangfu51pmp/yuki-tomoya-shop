import { NextRequest, NextResponse } from 'next/server';
import {
  DualTrackMetricItem,
  UtmCampaignRecord,
} from '../../../lib/tomoya-commerce/types-and-catalog';
import {
  loadTomoyaCommerceState,
  saveTomoyaCommerceState,
} from '../../../lib/tomoya-commerce/storage';

export async function GET() {
  const state = await loadTomoyaCommerceState();
  return NextResponse.json({ ok: true, state });
}

interface PostBody {
  action: 'create_utm' | 'delete_utm' | 'update_items' | 'add_test_item';
  campaign?: Omit<UtmCampaignRecord, 'id' | 'createdAt' | 'shortPath' | 'clicks'>;
  id?: string;
  items?: DualTrackMetricItem[];
  exchangeRateJpyToTwd?: number;
  newItem?: Omit<DualTrackMetricItem, 'productId'>;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PostBody;
    const state = await loadTomoyaCommerceState();

    if (body.action === 'create_utm' && body.campaign) {
      const id = `utm-${body.campaign.episodeCode.toLowerCase()}-${body.campaign.source.slice(0, 2)}-${Date.now().toString().slice(-4)}`;
      const rec: UtmCampaignRecord = {
        ...body.campaign,
        id,
        createdAt: new Date().toISOString().slice(0, 10),
        shortPath: `/api/tomoya-utm?id=${encodeURIComponent(id)}`,
        clicks: 0,
      };
      state.campaigns = [rec, ...state.campaigns];
    } else if (body.action === 'delete_utm' && body.id) {
      state.campaigns = state.campaigns.filter((c) => c.id !== body.id);
    } else if (body.action === 'update_items' && Array.isArray(body.items)) {
      state.items = body.items;
      if (typeof body.exchangeRateJpyToTwd === 'number') {
        state.exchangeRateJpyToTwd = body.exchangeRateJpyToTwd;
      }
    } else if (body.action === 'add_test_item' && body.newItem) {
      const created: DualTrackMetricItem = {
        ...body.newItem,
        productId: `custom-${Date.now().toString().slice(-5)}`,
      };
      state.items = [created, ...state.items];
    }

    await saveTomoyaCommerceState(state);
    return NextResponse.json({ ok: true, state });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Operation failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
