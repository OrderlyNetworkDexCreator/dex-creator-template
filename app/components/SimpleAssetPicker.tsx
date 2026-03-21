import { useState, useCallback, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useMarkets } from "@orderly.network/hooks";
import { MarketsType } from "@orderly.network/hooks";

// ─── Theme (same tokens as SimpleTradingPanel) ────────────────────────────────
const T = {
  bg: "rgb(0,0,0)",
  panel: "rgb(12,12,12)",
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

interface Props {
  open: boolean;
  currentSymbol: string;
  onSelect: (symbol: string) => void;
  onClose: () => void;
}

export function SimpleAssetPicker({ open, currentSymbol, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const [markets] = useMarkets(MarketsType.ALL);

  // Focus search input when modal opens
  useEffect(() => {
    if (open) {
      setQuery("");
      // Brief delay allows the modal DOM to settle before focusing
      const FOCUS_DELAY_MS = 50;
      setTimeout(() => searchRef.current?.focus(), FOCUS_DELAY_MS);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSelect = useCallback(
    (symbol: string) => {
      onSelect(symbol);
      onClose();
    },
    [onSelect, onClose]
  );

  if (!open) return null;

  // Filter + sort by 24h volume descending
  const q = query.trim().toLowerCase();
  const filtered = (markets ?? [])
    .filter((m) => {
      if (!q) return true;
      const base = m.symbol.split("_")[1] ?? m.symbol;
      return base.toLowerCase().includes(q) || m.symbol.toLowerCase().includes(q);
    })
    .sort((a, b) => (b["24h_amount"] ?? 0) - (a["24h_amount"] ?? 0));

  return (
    /* Backdrop */
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        style={{
          width: "min(420px, 92vw)",
          maxHeight: "70vh",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily: "Manrope, Inter, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 18px 12px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>
            Select Asset
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: T.muted,
              fontSize: "18px",
              lineHeight: 1,
              padding: "0 2px",
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "10px 18px", borderBottom: `1px solid ${T.border}` }}>
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search market…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${T.border}`,
              borderRadius: "8px",
              outline: "none",
              color: T.text,
              fontSize: "13px",
              fontWeight: 500,
              padding: "9px 12px",
              fontFamily: "Manrope, Inter, sans-serif",
            }}
          />
        </div>

        {/* Column labels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            padding: "6px 18px",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: T.muted,
            textTransform: "uppercase",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <span>Market</span>
          <span style={{ textAlign: "right" }}>Mark Price</span>
          <span style={{ textAlign: "right" }}>24h Change</span>
        </div>

        {/* Market list */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "32px 18px",
                textAlign: "center",
                fontSize: "13px",
                color: T.muted,
              }}
            >
              No markets found
            </div>
          ) : (
            filtered.map((m) => {
              const base = m.symbol.split("_")[1] ?? m.symbol;
              const change = m.change ?? 0;
              const isSelected = m.symbol === currentSymbol;
              const changeColor = change >= 0 ? T.up : T.down;

              return (
                <button
                  key={m.symbol}
                  onClick={() => handleSelect(m.symbol)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    alignItems: "center",
                    width: "100%",
                    padding: "11px 18px",
                    background: isSelected ? "rgba(255,255,255,0.06)" : "transparent",
                    border: "none",
                    borderBottom: `1px solid ${T.border}`,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = isSelected
                      ? "rgba(255,255,255,0.06)"
                      : "transparent")
                  }
                >
                  {/* Symbol name */}
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: isSelected ? 700 : 600,
                      color: isSelected ? "#fff" : T.text,
                      fontFamily: "Manrope, Inter, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {isSelected && (
                      <span style={{ color: "#fff", fontSize: "10px" }}>●</span>
                    )}
                    {base}-PERP
                  </span>

                  {/* Mark price */}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: T.text,
                      textAlign: "right",
                      fontFamily: "Manrope, Inter, sans-serif",
                    }}
                  >
                    ${fmt(m.mark_price)}
                  </span>

                  {/* 24h change */}
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: changeColor,
                      textAlign: "right",
                      fontFamily: "Manrope, Inter, sans-serif",
                    }}
                  >
                    {change >= 0 ? "+" : ""}
                    {(change * 100).toFixed(2)}%
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
