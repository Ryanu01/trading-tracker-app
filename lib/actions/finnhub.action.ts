'use server';
import { getDateRange, validateArticle, formatArticle } from "../utils";
import { POPULAR_STOCK_SYMBOLS } from "../constants";
import { cache } from "react";


const FINNHUB_BASE_URI= 'https://finnhub.io/api/v1';
const NEXT_FINNHUB_PUBLIC_API_KEY = process.env.NEXT_FINNHUB_PUBLIC_API_KEY;

async function fetchJSON<T>(url: string, revaliadateSeconds?: number): Promise<T> {
    const options: RequestInit & {next? : { revalidate? : number}} = revaliadateSeconds
    ? {cache: 'force-cache', next: {revalidate : revaliadateSeconds}}
    : {cache: 'no-store'}

    const res = await fetch(url, options);

    if(!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`fetch failed ${res.status}: ${text}`);
    }
    return (await res.json()) as T;
}

export {fetchJSON};

export async function getNews(symbols?:string[]): Promise<MarketNewsArticle[]> {
    try {
        const range = getDateRange(5);
        const token = process.env.FINNHUB_PUBLIC_API_KEY ?? NEXT_FINNHUB_PUBLIC_API_KEY;
        if(!token) {
            throw new Error('FINNHUB api key is not configured');
        }
        const cleanSymbols=  (symbols || [])
        .map((s) => s?.trim().toUpperCase())
        .filter((s): s is string => Boolean(s));

        const maxArticle = 6;
        if(cleanSymbols.length > 0) {
            const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

            await Promise.all(
                cleanSymbols.map(async (sym) => {
                    try {
                        const url = `${FINNHUB_BASE_URI}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
                        const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
                        perSymbolArticles[sym] = (articles || []).filter(validateArticle);
                    } catch (error) {
                        console.error(`Error fetching company news for ${sym} ${error}`);
                        perSymbolArticles[sym] = [];
                    }
                })
            );

            const collectd: MarketNewsArticle[] = [];

            //roound robim upto six picks
            for(let round = 0; round < maxArticle; round++) {
                for(let i = 0; i < cleanSymbols.length; i++) {
                    const sym = cleanSymbols[i];
                    const list = perSymbolArticles[sym] || [];
                    if(list.length === 0) continue;
                    const article = list.shift();
                    if(!article || !validateArticle(article)) continue;
                    collectd.push(formatArticle(article, true, sym, round));
                    if(collectd.length >= maxArticle) break;
                }
                if(collectd.length >= maxArticle) break;
            }

            if(collectd.length > 0) {
                collectd.sort((a,b) => (b.datetime || 0) - (a.datetime || 0));
                return collectd.slice(0, maxArticle);
            }
        }

        const generlaUrl = `${FINNHUB_BASE_URI}/news?category=general&token=${token}`;
        const general = await fetchJSON<RawNewsArticle[]>(generlaUrl, 300);

        const seen = new Set<string>();
        const unique: RawNewsArticle[] = [];
        for(const art of general || []) {
            if(!validateArticle(art)) continue;
            const key = `${art.id}-${art.url}-${art.headline}`;
            if(seen.has(key)) continue;
            seen.add(key);
            unique.push(art);
            if(unique.length >= 20) break;
        }

        const formatted = unique.slice(0, maxArticle).map((a, idx) => formatArticle(a, false, undefined, idx));
        return formatted;
            
    } catch (error) {
      console.error('getNews error', error);
      throw new Error('Failed to fetch news');  
    }
}

export const searchStocks = cache(async(query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_FINNHUB_PUBLIC_API_KEY;
        if(!token) {
            console.error('Error in stock search: ', new Error('FINNHUB API key is not configured'));
            return [];
        }

        const trimmed = typeof query === 'string' ? query.trim() : '';
        let results: FinnhubSearchResult[] = [];


        if(!trimmed) {
            const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
            const profiles = await Promise.all(
                top.map(async (sym) => {
                    try{
                        const url = `${FINNHUB_BASE_URI}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
                        const profile = await fetchJSON<any>(url, 3600);
                        return {sym, profile} as {sym: string, profile: any};
                    }catch(error) {
                        console.error('Error fetching profile2 for', sym, error);
                        return {sym, profile: null} as {sym: string, profile: any};
                    }
                })
            );

            results = profiles
            .map(({sym, profile}) => {
                const symbol = sym.toUpperCase();
                const name: string | undefined = profile?.name || profile?.ticker  || undefined;
                const exchange: string | undefined = profile?.exchange || undefined;

                if(!name) return undefined;
                const r: FinnhubSearchResult = {
                    symbol,
                    description: name,
                    displaySymbol: symbol,
                    type: 'Common Stock'
                };
                (r as any).__exchange = exchange;
                return r;
            })
            .filter((x): x is FinnhubSearchResult => Boolean(x)); 
        }else {
            const url = `${FINNHUB_BASE_URI}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
            const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
            results = Array.isArray(data?.result) ? data.result : [];
        }

        const mapped: StockWithWatchlistStatus[] = results
        .map((r) => {
            const upper = (r.symbol || '').toUpperCase();
            const name = r.description || upper;
            const exchangeFromDispaly = (r.displaySymbol as string | undefined) || undefined;
            const exchangeFromProfile = (r as any).__exchange as string | undefined;
            const exchange = exchangeFromDispaly || exchangeFromProfile || 'US';
            const type = r.type || 'Stock';
            const item: StockWithWatchlistStatus=  {
                symbol: upper,
                name,
                exchange,
                type,
                isInWatchlist: false,
            };
            return item;
        })
        .slice(0, 15);


        return mapped;
    } catch (error) {
        console.error(`Error in stock search: ${error}`);
        return []
    }
});