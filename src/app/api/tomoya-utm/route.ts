import { NextRequest, NextResponse } from 'next/server';
import { YUKI_TOMOYA_M3M7_CONFIG } from '../../../lib/tomoya-commerce/types-and-catalog';
import {
  loadTomoyaCommerceState,
  saveTomoyaCommerceState,
} from '../../../lib/tomoya-commerce/storage';

export async function GET(req: NextRequest) {
  const campaignId = req.nextUrl.searchParams.get('id') || '';
  const state = await loadTomoyaCommerceState();
  const hit = state.campaigns.find((c) => c.id === campaignId);

  if (hit) {
    hit.clicks = (hit.clicks || 0) + 1;
    await saveTomoyaCommerceState(state);

    if (hit.target === 'line_official') {
      return NextResponse.redirect(YUKI_TOMOYA_M3M7_CONFIG.defaultLineFriendUrl);
    }

    const dest = new URL('/', req.nextUrl.origin);
    dest.searchParams.set('category', hit.target);
    dest.searchParams.set('utm_source', hit.source);
    dest.searchParams.set('utm_medium', `${hit.view}_view`);
    dest.searchParams.set('utm_campaign', `tomoya_${hit.episodeCode.toLowerCase()}`);
    dest.searchParams.set('utm_content', hit.track);
    return NextResponse.redirect(dest.toString());
  }

  return NextResponse.redirect(new URL('/', req.nextUrl.origin).toString());
}
