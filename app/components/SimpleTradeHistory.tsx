import type { CSSProperties } from "react";
import { useOrderStream } from "@orderly.network/hooks";
import { useAccount } from "@orderly.network/hooks";
import { OrderStatus, AccountStatusEnum } from "@orderly.network/types";

// ─── Theme (same tokens) ──────────────────────────────────────────────────────
const T = {
  bg: "rgb(0,0,0)",
  border: "rgba(60,60,60,0.55)",
  text: "rgba(255,255,255,0.87)",
  muted: "rgba(255,255,255,0.38)",
  up: "#22c55e",
  down: "#ef4444",
};

function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtTime(ts: number | null | undefined): string {
  if (!ts) return "—";
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const css: Record<string, CSSProperties> = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    fontFamily: "Manrope, Inter, sans-serif",
    color: T.text,
    overflow: "hidden",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: "8px",
    color: T.muted,
    fontSize: "12px",
    textAlign: "center",
    padding: "24px",
  },
  header: {
    display: "grid",
    gridTemplateColumns: "90px 1fr 80px 70px",
    padding: "8px 18px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: T.muted,
    textTransform: "uppercase",
    borderBottom: `1px solid ${T.border}`,
    flexShrink: 0,
  },
  list: {
    overflowY: "auto",
    flex: 1,
  },
  row: {
    display: "grid",
    gridTemplateColumns: "90px 1fr 80px 70px",
    padding: "9px 18px",
    borderBottom: `1px solid ${T.border}`,
    alignItems: "center",
  },
  cell: {
    fontSize: "11px",
    fontWeight: 600,
    color: T.text,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  muted: {
    fontSize: "11px",
    fontWeight: 500,
    color: T.muted,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

interface Props {
  /** If provided, only show orders for this symbol */
  symbol?: string;
}

export function SimpleTradeHistory({ symbol }: Props) {
  const { state: accountState } = useAccount();
  const isConnected =
    accountState?.status !== undefined &&
    accountState.status >= AccountStatusEnum.Connected;

  const [orders, { isLoading }] = useOrderStream({
    status: OrderStatus.FILLED,
    size: 30,
  });

  if (!isConnected) {
    return (
      <div style={css.root}>
        <div style={css.empty}>
          <span style={{ fontSize: "22px" }}>🔒</span>
          <span>Connect your wallet to see trade history</span>
        </div>
      </div>
    );
  }

  if (isLoading || orders == null) {
    return (
      <div style={css.root}>
        <div style={css.empty}>
          <span style={{ color: T.muted, fontSize: "12px" }}>Loading…</span>
        </div>
      </div>
    );
  }

  // Filter to current symbol if provided (shows all symbols if none given)
  const filtered = symbol
    ? orders.filter((o) => o.symbol === symbol)
    : orders;

  if (filtered.length === 0) {
    return (
      <div style={css.root}>
        <div style={css.empty}>
          <span style={{ fontSize: "22px" }}>📋</span>
          <span>No filled trades yet</span>
        </div>
      </div>
    );
  }

  return (
    <div style={css.root}>
      {/* Column headers */}
      <div style={css.header}>
        <span>Time</span>
        <span>Symbol</span>
        <span style={{ textAlign: "right" }}>Price</span>
        <span style={{ textAlign: "right" }}>Qty</span>
      </div>

      {/* Order rows */}
      <div style={css.list}>
        {filtered.map((order) => {
          const base = (order.symbol as string)?.split("_")[1] ?? order.symbol;
          const isBuy = (order.side as string)?.toUpperCase() === "BUY";
          const execPrice = order.average_executed_price ?? order.price;
          const execQty = order.total_executed_quantity ?? order.executed;

          return (
            <div key={order.order_id} style={css.row}>
              <span style={css.muted}>{fmtTime(order.created_time)}</span>

              <span style={{ ...css.cell, display: "flex", alignItems: "center", gap: "5px" }}>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 800,
                    padding: "2px 5px",
                    borderRadius: "4px",
                    background: isBuy ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    color: isBuy ? T.up : T.down,
                    flexShrink: 0,
                  }}
                >
                  {isBuy ? "↑" : "↓"}
                </span>
                <span style={{ color: T.text, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {base}
                </span>
              </span>

              <span style={{ ...css.cell, textAlign: "right" }}>
                ${fmt(execPrice)}
              </span>

              <span style={{ ...css.cell, textAlign: "right", color: T.muted }}>
                {fmt(execQty, 4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
