/**
 * MARKET ORACLE - STOCK DATA API
 * Yahoo Finance integration
 * November 24, 2025 - 5:26 AM ET
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ⚠️ _supabase MUST be declared before getSupabase() — TDZ guard
let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  // 2026-08-19: this function was CORRUPTED in 27 files, byte-identically.
  // `return _supabase;` had been spliced into the middle of the options object:
  //
  //   return sb.createClient(url, key, { auth: { persistSession: false   return _supabase;
  //   } })
  //
  // The repo did not compile - 102 type errors across 29 files - and every route
  // using it threw "supabase is not defined". javarimarket.com kept serving only
  // because Vercel holds the last successful build; the next push would have
  // failed and stayed failed.
  //
  // Now caches properly, which is what _supabase was always for, and pins
  // no-store: Next 14 caches PostgREST GETs by URL and serves stale rows.
  if (_supabase) return _supabase;
  const sb = require('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _supabase = sb.createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (u: RequestInfo | URL, o?: RequestInit) => fetch(u, { ...o, cache: 'no-store' }) },
  });
  return _supabase;
}


interface StockData {
  ticker: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  lastUpdated: string;
}

async function fetchYahooData(ticker: string): Promise<StockData | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    if (!response.ok) return null;

    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const currentPrice = meta.regularMarketPrice || 0;
    const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
    const priceChange = currentPrice - previousClose;
    const priceChangePercent = previousClose > 0 ? (priceChange / previousClose) * 100 : 0;

    return {
      ticker: ticker.toUpperCase(),
      companyName: meta.longName || meta.shortName || ticker,
      currentPrice,
      priceChange,
      priceChangePercent,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const tickers = searchParams.get('tickers');

    // Single ticker
    if (ticker) {
      const data = await fetchYahooData(ticker);
      if (!data) {
        return NextResponse.json(
          { success: false, error: `Failed to fetch data for ${ticker}` },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data });
    }

    // Multiple tickers
    if (tickers) {
      const tickerList = tickers.split(',').map(t => t.trim().toUpperCase());
      const results = await Promise.all(tickerList.map(fetchYahooData));
      const successful = results.filter((r): r is StockData => r !== null);

      return NextResponse.json({
        success: true,
        data: successful,
        total: successful.length,
        failed: tickerList.length - successful.length,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Stock Data API',
      usage: {
        single: 'GET ?ticker=AAPL',
        multiple: 'GET ?tickers=AAPL,TSLA,NVDA',
      },
    });

  } catch (error) {
    console.error('Stock data error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
