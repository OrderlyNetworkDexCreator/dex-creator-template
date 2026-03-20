import { useState, useCallback, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
import {
  useOrderEntry,
  useMarkPrice,
  useAccount,
} from "@orderly.network/hooks";
import { OrderSide, OrderType, AccountStatusEnum } from "@orderly.network/types";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg: "rgb(0,0,0)",
  panel: "rgb(12,12,12)",
  border: "rgba(60,60,60,0.55)",
  text: "rgba(255,255,255,0.87)",
  muted: "rgba(255,255,255,0.38)",
  up: "#22c55e",
  upDim: "#15803d",
  down: "#ef4444",
  downDim: "#b91c1c",
  neutral: "rgba(255,255,255,0.08)",
  accent: "#ffffff",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function dirBtnStyle(active: boolean, color: string, dimColor: string): CSSProperties {
  return {
    flex: 1,
    padding: "14px 0",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    background: active ? color : T.neutral,
    color: active ? "#fff" : T.muted,
    transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
    boxShadow: active ? `0 0 0 2px ${dimColor}` : "none",
  };
}

function placeBtnStyle(
  active: boolean,
  side: "up" | "down" | null,
  isMutating: boolean
): CSSProperties {
  return {
    width: "100%",
    padding: "16px 0",
    borderRadius: "12px",
    border: "none",
    cursor: active ? "pointer" : "default",
    fontSize: "14px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    background: !active
      ? T.neutral
      : side === "up"
      ? T.up
      : side === "down"
      ? T.down
      : T.accent,
    color: active ? "#000" : T.muted,
    transition: "background 0.15s, color 0.15s",
    opacity: isMutating ? 0.7 : 1,
  };
}

function feedbackStyle(kind: "ok" | "err"): CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    background: kind === "ok" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
    color: kind === "ok" ? T.up : T.down,
    border: `1px solid ${kind === "ok" ? T.upDim : T.downDim}`,
  };
}

// ─── Shared static styles ─────────────────────────────────────────────────────
const css: Record<string, CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    background: T.bg,
    color: T.text,
    fontFamily: "Manrope, Inter, sans-serif",
    overflow: "hidden",
  },
  inner: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    padding: "20px 18px",
    flex: 1,
    overflowY: "auto",
  },
  section: { display: "flex", flexDirection: "column", gap: "8px" },
  label: {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: T.muted,
    textTransform: "uppercase",
  },
  row: { display: "flex", gap: "8px" },
  amountWrap: {
    display: "flex",
    alignItems: "center",
    background: T.panel,
    border: `1px solid ${T.border}`,
    borderRadius: "10px",
    overflow: "hidden",
  },
  currency: {
    padding: "0 12px",
    fontSize: "13px",
    color: T.muted,
    borderRight: `1px solid ${T.border}`,
    userSelect: "none",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: T.text,
    fontSize: "16px",
    fontWeight: 600,
    padding: "12px 14px",
    fontFamily: "Manrope, Inter, sans-serif",
    width: "100%",
  },
  quickRow: { display: "flex", gap: "6px", flexWrap: "wrap" },
  quickBtn: {
    padding: "5px 12px",
    borderRadius: "6px",
    border: `1px solid ${T.border}`,
    background: "transparent",
    color: T.muted,
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: T.muted,
  },
  infoVal: { color: T.text, fontWeight: 600 },
  divider: { height: "1px", background: T.border, margin: "0 -18px" },
  connectPrompt: {
    padding: "12px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 600,
    background: T.neutral,
    color: T.muted,
    textAlign: "center",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  symbol: string;
  onConnectWallet?: () => void;
}

export function SimpleTradingPanel({ symbol, onConnectWallet }: Props) {
  const [side, setSide] = useState<"up" | "down" | null>(null);
  const [rawAmount, setRawAmount] = useState("10");
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    msg: string;
  } | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending feedback timer on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const { data: markPrice } = useMarkPrice(symbol);
  const { state: accountState } = useAccount();

  const {
    setValues,
    submit,
    helper,
    isMutating,
    freeCollateral,
    currentPosition,
    maxQty,
    symbolInfo,
  } = useOrderEntry(symbol, {
    initialOrder: {
      order_type: OrderType.MARKET,
      side: OrderSide.BUY,
    },
  });

  const isEnabled =
    accountState?.status === AccountStatusEnum.EnableTrading ||
    accountState?.status === AccountStatusEnum.EnableTradingWithoutConnected;
  const isConnected =
    accountState?.status !== undefined &&
    accountState.status >= AccountStatusEnum.Connected;

  const amount = parseFloat(rawAmount);
  const symbolBase = symbol.split("_")[1] ?? symbol;
  const estimatedQty =
    markPrice && Math.abs(markPrice) > 0 && amount > 0
      ? amount / Math.abs(markPrice)
      : null;

  // Min notional guard (Orderly requires minimum notional per symbol)
  const minNotional = symbolInfo?.min_notional ?? 1;

  const showFeedback = useCallback((kind: "ok" | "err", msg: string) => {
    // Clear any existing timer before setting a new one
    if (feedbackTimerRef.current !== null) {
      clearTimeout(feedbackTimerRef.current);
    }
    setFeedback({ kind, msg });
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimerRef.current = null;
    }, 5000);
  }, []);

  /** Extract a human-readable message from any thrown value */
  const extractError = useCallback((e: unknown): string => {
    if (e instanceof Error) {
      // Orderly API errors often have a numeric code suffix like "(-1116) ..."
      const m = e.message ?? "Order failed";
      // Remove bracket-encoded codes, trim to 100 chars
      return m.replace(/\(-?\d+\)\s*/g, "").trim().slice(0, 100);
    }
    if (typeof e === "string") return e.slice(0, 100);
    return "Order failed — please try again";
  }, []);

  const handlePlace = useCallback(async () => {
    if (!side) {
      showFeedback("err", "Choose UP or DOWN first");
      return;
    }
    if (!isEnabled) {
      showFeedback("err", "Connect & enable trading first");
      return;
    }
    if (!amount || amount <= 0) {
      showFeedback("err", "Enter a valid amount");
      return;
    }
    if (amount < Math.max(minNotional, 1)) {
      const effectiveMinNotional = Math.max(minNotional, 1);
      showFeedback("err", `Minimum order is $${effectiveMinNotional.toFixed(2)}`);
      return;
    }
    if (freeCollateral <= 0) {
      showFeedback("err", "No free collateral — deposit USDC first");
      return;
    }
    if (amount > freeCollateral) {
      showFeedback("err", `Amount exceeds free collateral ($${fmt(freeCollateral)})`);
      return;
    }

    const orderSide = side === "up" ? OrderSide.BUY : OrderSide.SELL;

    // setValues updates the Zustand store synchronously, so validate() and
    // submit() will immediately see the new side/type/amount values.
    setValues({
      side: orderSide,
      order_type: OrderType.MARKET,
      order_amount: amount,
    });

    // Pre-validate so we surface SDK errors with good messages
    try {
      const errors = await helper.validate();
      if (errors) {
        // Find the first error message across all fields
        const firstError = Object.values(errors).find((v) => v?.message);
        if (firstError?.message) {
          showFeedback("err", firstError.message.slice(0, 100));
          return;
        }
      }
    } catch {
      // Validation threw — continue to let submit() handle it
    }

    try {
      const res = await submit({ resetOnSuccess: true });
      if (res?.success) {
        showFeedback(
          "ok",
          `${side === "up" ? "Long ↑" : "Short ↓"} order placed successfully ✓`
        );
        setSide(null);
        setRawAmount("10");
      } else {
        showFeedback("err", "Order rejected by exchange — check your collateral");
      }
    } catch (e: unknown) {
      showFeedback("err", extractError(e));
    }
  }, [
    side,
    isEnabled,
    amount,
    minNotional,
    freeCollateral,
    setValues,
    helper,
    submit,
    showFeedback,
    extractError,
  ]);

  const isActive = !!(side && isEnabled && !isMutating);
  const hasPosition = currentPosition !== 0 && currentPosition != null;
  const isLong = (currentPosition ?? 0) > 0;
  const positionSide = isLong ? "Long ↑" : "Short ↓";
  const positionAbs = currentPosition != null ? Math.abs(currentPosition) : 0;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={css.root}>
      <div style={css.inner}>

        {/* Price header */}
        <div style={{ ...css.section, gap: "4px" }}>
          <div style={{ fontSize: "11px", color: T.muted, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {symbolBase} · Mark Price
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "0.01em" }}>
            {markPrice ? `$${fmt(markPrice)}` : "—"}
          </div>
        </div>

        {/* Open position indicator */}
        {hasPosition && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              background: isLong ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
              color: isLong ? T.up : T.down,
              border: `1px solid ${isLong ? T.upDim : T.downDim}`,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Open position</span>
            <span>{positionSide} {fmt(positionAbs, 4)} {symbolBase}</span>
          </div>
        )}

        <div style={css.divider} />

        {/* Direction */}
        <div style={css.section}>
          <div style={css.label}>Will the price go up or down?</div>
          <div style={css.row}>
            <button
              style={dirBtnStyle(side === "up", T.up, T.upDim)}
              onClick={() => setSide(side === "up" ? null : "up")}
            >
              ↑ Up
            </button>
            <button
              style={dirBtnStyle(side === "down", T.down, T.downDim)}
              onClick={() => setSide(side === "down" ? null : "down")}
            >
              ↓ Down
            </button>
          </div>
        </div>

        {/* Amount */}
        <div style={css.section}>
          <div style={css.label}>Amount (USDC)</div>
          <div style={css.amountWrap}>
            <span style={css.currency}>$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={rawAmount}
              onChange={(e) => setRawAmount(e.target.value)}
              style={css.input}
              placeholder="0.00"
            />
          </div>
          <div style={css.quickRow}>
            {["10", "25", "50", "100"].map((v) => (
              <button key={v} style={css.quickBtn} onClick={() => setRawAmount(v)}>
                ${v}
              </button>
            ))}
            {freeCollateral > 0 && (
              <button
                style={css.quickBtn}
                onClick={() => setRawAmount(freeCollateral.toFixed(2))}
              >
                Max
              </button>
            )}
          </div>
        </div>

        {/* Info rows */}
        <div style={css.section}>
          <div style={css.infoRow}>
            <span>Est. quantity</span>
            <span style={css.infoVal}>
              {estimatedQty != null ? `~${fmt(estimatedQty, 4)} ${symbolBase}` : "—"}
            </span>
          </div>
          <div style={css.infoRow}>
            <span>Free collateral</span>
            <span style={css.infoVal}>
              {freeCollateral > 0 ? `$${fmt(freeCollateral)}` : "—"}
            </span>
          </div>
          {maxQty > 0 && (
            <div style={css.infoRow}>
              <span>Max qty</span>
              <span style={css.infoVal}>{fmt(maxQty, 4)} {symbolBase}</span>
            </div>
          )}
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={feedbackStyle(feedback.kind)}>{feedback.msg}</div>
        )}

        {/* Not connected prompt */}
        {!isConnected && (
          <div style={css.connectPrompt}>Connect your wallet to trade</div>
        )}

        {/* Place button */}
        <button
          style={placeBtnStyle(isActive, side, isMutating)}
          onClick={isEnabled ? handlePlace : onConnectWallet}
          disabled={isMutating}
        >
          {isMutating
            ? "Placing…"
            : !isConnected
            ? "Connect Wallet"
            : !isEnabled
            ? "Enable Trading"
            : side === "up"
            ? "▲  Place Long"
            : side === "down"
            ? "▼  Place Short"
            : "Select Direction"}
        </button>
      </div>
    </div>
  );
}
