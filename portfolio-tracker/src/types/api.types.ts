export type PriceData = {
  isin: string;
  price: number;
  timestamp: number; // Unix timestamp
  currency: string; // e.g., "EUR", "USD"
  source: 'api' | 'cache';
}

export type PriceCache = {
  [ticker: string]: {
    price: number;
    timestamp: number;
    expiresAt: number;
  };
}

export type ApiResponse = {
  intradayPoint: IntradayPoint[]
  status: number,
  entityID: string,
  view: string,
  sessionQuality: string,
  currency: string,
  accuracy: number,
  tickSizeRule: string,
  label: string,
  instrType: string
}

export type IntradayPoint = {
  time: string, //"20251208-09:10:00"
  nbTrade: number,
  beginPx: number,
  beginTime: string, //"09:10:43"
  endPx: number,
  endTime: string, //"09:10:43"
  highPx: number,
  lowPx: number,
  beginAskPx: number,
  endAskPx: number,
  highAskPx: number,
  lowAskPx: number,
  beginBidPx: number,
  endBidPx: number,
  highBidPx: number,
  lowBidPx: number,
  vol: number,
  amt: number,
  previousClosingPx: number,
  previousClosingDt: string, //"20251205"
  previousSettlementPx: number,
  previousSettlementDt: string, //"20251205
}
