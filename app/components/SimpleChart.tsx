import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  UTCTimestamp,
} from "lightweight-charts";

// ─── Constants ───────────────────────────────────────────────────────────────

const INTERVALS = [
  { label: "1m", value: "1m", krakenMinutes: 1 },
  { label: "5m", value: "5m", krakenMinutes: 5 },
  { label: "15m", value: "15m", krakenMinutes: 15 },
  { label: "1H", value: "1h", krakenMinutes: 60 },
  { label: "4H", value: "4h", krakenMinutes: 240 },
  { label: "1D", value: "1d", krakenMinutes: 1440 },
] as const;

type Interval = (typeof INTERVALS)[number]["value"];

// ─── Theme colours (matches Virgos indigo theme) ─────────────────────────────
const THEME = {
  bg: "rgb(8,8,20)",
  bgPanel: "rgb(12,12,26)",
  grid: "rgba(64,68,108,0.25)",
  text: "rgba(255,255,255,0.54)",
  textMuted: "rgba(255,255,255,0.3)",
  primary: "rgb(109,92,246)",
  primaryFaint: "rgba(109,92,246,0.45)",
  up: "rgb(22,197,94)",
  down: "rgb(239,68,68)",
  border: "rgba(64,68,108,0.35)",
};

// ─── Symbol helpers ───────────────────────────────────────────────────────────

/** Orderly symbol → Kraken pair, e.g. PERP_BTC_USDC → XBTUSD */
const KRAKEN_PAIR_MAP: Record<string, string> = {
  BTC: "XBTUSD",
  ETH: "ETHUSD",
  SOL: "SOLUSD",
  ARB: "ARBUSD",
  OP: "OPUSD",
  AVAX: "AVAXUSD",
  LINK: "LINKUSD",
  MATIC: "MATICUSD",
  DOGE: "XDGEUSD",
  LTC: "XLTCUSD",
  XRP: "XXRPUSD",
  ADA: "ADAUSD",
  DOT: "DOTUSD",
  ATOM: "ATOMUSD",
  NEAR: "NEARUSD",
  FTM: "FTMUSD",
  SAND: "SANDUSD",
  APE: "APEUSD",
  SUI: "SUIUSD",
  TRX: "TRXUSD",
  WIF: "WIFUSD",
  PEPE: "PEPEUSD",
  SHIB: "SHIBUSD",
  UNI: "UNIUSD",
  AAVE: "AAVEUSD",
  INJ: "INJUSD",
  SEI: "SEIUSD",
  TIA: "TIAUSD",
  JUP: "JUPUSD",
  W: "WUSD",
  ENA: "ENAUSD",
  PENDLE: "PENDLEUSD",
  ORDI: "ORDIUSD",
  STX: "STXUSD",
  PYTH: "PYTHUSD",
  FET: "FETUSD",
  RENDER: "RENDERUSD",
  WLD: "WLDUSD",
  BRETT: "BRETTUSD",
  POPCAT: "POPCATUSD",
};

/** Kraken WebSocket pair format (e.g. XBT/USD) — used for subscribing to ohlc stream */
const KRAKEN_WS_PAIR_MAP: Record<string, string> = {
  BTC: "XBT/USD",
  ETH: "ETH/USD",
  SOL: "SOL/USD",
  ARB: "ARB/USD",
  OP: "OP/USD",
  AVAX: "AVAX/USD",
  LINK: "LINK/USD",
  MATIC: "MATIC/USD",
  DOGE: "XDG/USD",
  XRP: "XRP/USD",
  ADA: "ADA/USD",
  DOT: "DOT/USD",
  LTC: "LTC/USD",
  ATOM: "ATOM/USD",
  NEAR: "NEAR/USD",
};

function orderly2Kraken(symbol: string): string | null {
  // "PERP_BTC_USDC" → "BTC"
  const parts = symbol.split("_");
  const base = parts[1] ?? "";
  return KRAKEN_PAIR_MAP[base] ?? null;
}

// ─── Kraken fetch ─────────────────────────────────────────────────────────────

function getKrakenWsBase(): string {
  // Kraken is always mainnet; on testnet we still use real prices for chart
  return "wss://ws.kraken.com";
}

async function fetchKrakenCandles(
  krakenPair: string,
  minutes: number
): Promise<CandlestickData[]> {
  const url = `https://api.kraken.com/0/public/OHLC?pair=${krakenPair}&interval=${minutes}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Kraken responded ${res.status}`);
  const json = await res.json();
  if (json.error?.length) throw new Error(json.error[0]);

  // Result has one key (the pair name, e.g. "XXBTZUSD") + "last"
  const dataKey = Object.keys(json.result || {}).find((k) => k !== "last");
  if (!dataKey) throw new Error("No OHLC data in Kraken response");

  // Each row: [time_s, open, high, low, close, vwap, volume, count]
  const rows: (string | number)[][] = json.result[dataKey];
  return rows.map((r) => ({
    time: Number(r[0]) as UTCTimestamp,
    open: parseFloat(r[1] as string),
    high: parseFloat(r[2] as string),
    low: parseFloat(r[3] as string),
    close: parseFloat(r[4] as string),
  }));
}

// ─── Component ───────────────────────────────────────────────────────────────

interface SimpleChartProps {
  symbol: string;
}

export function SimpleChart({ symbol }: SimpleChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [interval, setIntervalState] = useState<Interval>("1h");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const krakenPair = orderly2Kraken(symbol);
  const currentIntervalCfg = INTERVALS.find((i) => i.value === interval)!;

  // ── Chart initialization ──────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      width: el.clientWidth,
      height: el.clientHeight || 400,
      layout: {
        background: { type: ColorType.Solid, color: THEME.bg },
        textColor: THEME.text,
        fontFamily: "Manrope, Inter, sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: THEME.grid },
        horzLines: { color: THEME.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: THEME.primaryFaint,
          labelBackgroundColor: THEME.primary,
          width: 1,
        },
        horzLine: {
          color: THEME.primaryFaint,
          labelBackgroundColor: THEME.primary,
        },
      },
      rightPriceScale: {
        borderColor: THEME.border,
        textColor: THEME.text,
      },
      timeScale: {
        borderColor: THEME.border,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    const series = chart.addCandlestickSeries({
      upColor: THEME.up,
      downColor: THEME.down,
      borderUpColor: THEME.up,
      borderDownColor: THEME.down,
      wickUpColor: THEME.up,
      wickDownColor: THEME.down,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      if (el) {
        chart.applyOptions({
          width: el.clientWidth,
          height: el.clientHeight || 400,
        });
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // ── Fetch candles on symbol / interval change ─────────────────────────────
  const loadCandles = useCallback(async () => {
    if (!krakenPair) {
      setError("Chart not available for this symbol");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const candles = await fetchKrakenCandles(
        krakenPair,
        currentIntervalCfg.krakenMinutes
      );
      if (seriesRef.current && candles.length > 0) {
        seriesRef.current.setData(candles);
        chartRef.current?.timeScale().fitContent();
      }
    } catch {
      setError("Unable to load chart data");
    } finally {
      setLoading(false);
    }
  }, [krakenPair, currentIntervalCfg.krakenMinutes]);

  useEffect(() => {
    loadCandles();
  }, [loadCandles]);

  // ── Real-time Kraken WebSocket ────────────────────────────────────────────
  useEffect(() => {
    if (!krakenPair) return;

    const base = symbol.split("_")[1] ?? "";
    const wsPair = KRAKEN_WS_PAIR_MAP[base];

    let ws: WebSocket;
    let alive = true;

    function connect() {
      ws = new WebSocket(getKrakenWsBase());
      wsRef.current = ws;

      ws.onopen = () => {
        if (!alive || !wsPair) { ws.close(); return; }
        ws.send(
          JSON.stringify({
            event: "subscribe",
            pair: [wsPair],
            subscription: {
              name: "ohlc",
              interval: currentIntervalCfg.krakenMinutes,
            },
          })
        );
      };

      ws.onmessage = (evt) => {
        try {
          const msg = JSON.parse(evt.data as string);
          // Kraken OHLC message: [channelID, [time, etime, open, high, low, close, vwap, vol, count], "ohlc-60", "XBT/USD"]
          if (!Array.isArray(msg) || msg[2]?.indexOf?.("ohlc") !== 0) return;
          const ohlc = msg[1];
          seriesRef.current?.update({
            time: Math.floor(parseFloat(ohlc[0])) as UTCTimestamp,
            open: parseFloat(ohlc[2]),
            high: parseFloat(ohlc[3]),
            low: parseFloat(ohlc[4]),
            close: parseFloat(ohlc[5]),
          });
        } catch {
          // ignore
        }
      };

      ws.onerror = () => ws.close();
      ws.onclose = () => {
        if (alive) {
          // Poll every 30 s as fallback for live price
          pollRef.current = setInterval(() => {
            loadCandles();
          }, 30_000);
        }
      };
    }

    connect();

    return () => {
      alive = false;
      ws?.close();
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [symbol, krakenPair, currentIntervalCfg.krakenMinutes, loadCandles]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        minHeight: "280px",
        background: THEME.bg,
        overflow: "hidden",
      }}
    >
      {/* Interval bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          padding: "6px 12px",
          borderBottom: `1px solid ${THEME.border}`,
          background: THEME.bgPanel,
          flexShrink: 0,
        }}
      >
        {INTERVALS.map(({ label, value }) => {
          const active = interval === value;
          return (
            <button
              key={value}
              onClick={() => setIntervalState(value)}
              style={{
                padding: "3px 10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "Manrope, Inter, sans-serif",
                background: active ? THEME.primary : "transparent",
                color: active ? "#fff" : THEME.text,
                transition: "background 0.15s, color 0.15s",
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </button>
          );
        })}
        {/* Data source badge */}
        <span
          style={{
            marginLeft: "auto",
            fontSize: "10px",
            color: THEME.textMuted,
            fontFamily: "Manrope, Inter, sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          Powered by Kraken
        </span>
      </div>

      {/* Chart area */}
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

        {/* Loading overlay */}
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: THEME.bg,
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                border: `3px solid rgba(109,92,246,0.2)`,
                borderTopColor: THEME.primary,
                animation: "sc-spin 0.7s linear infinite",
              }}
            />
            <style>{`@keyframes sc-spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              background: THEME.bg,
            }}
          >
            <span
              style={{
                color: THEME.textMuted,
                fontSize: "13px",
                fontFamily: "Manrope, Inter, sans-serif",
              }}
            >
              {error}
            </span>
            <button
              onClick={loadCandles}
              style={{
                padding: "6px 16px",
                borderRadius: "8px",
                border: `1px solid ${THEME.primary}`,
                background: "transparent",
                color: THEME.primary,
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "Manrope, Inter, sans-serif",
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
