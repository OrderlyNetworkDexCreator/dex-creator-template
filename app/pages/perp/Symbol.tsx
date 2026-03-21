import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import { SimpleChart } from "@/components/SimpleChart";
import { SimpleTradingPanel } from "@/components/SimpleTradingPanel";
import { SimpleAssetPicker } from "@/components/SimpleAssetPicker";

// ─── Layout styles ────────────────────────────────────────────────────────────
const PANEL_WIDTH = 320; // px — right panel width

export default function PerpSymbol() {
  const params = useParams();
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState(params.symbol!);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const handleSymbolSelect = (newSymbol: string) => {
    setSymbol(newSymbol);
    setAssetPickerOpen(false);
    navigate(`/perp/${newSymbol}`, { replace: true });
  };

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}

      {/* Asset picker modal */}
      <SimpleAssetPicker
        open={assetPickerOpen}
        currentSymbol={symbol}
        onSelect={handleSymbolSelect}
        onClose={() => setAssetPickerOpen(false)}
      />

      {/* Full-height two-column layout: chart | panel */}
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          overflow: "hidden",
          background: "rgb(0,0,0)",
        }}
      >
        {/* Chart — fills remaining space */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          <SimpleChart symbol={symbol} />
        </div>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            background: "rgba(60,60,60,0.55)",
            flexShrink: 0,
          }}
        />

        {/* Simple Up/Down trading panel */}
        <div
          style={{
            width: `${PANEL_WIDTH}px`,
            flexShrink: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SimpleTradingPanel
            symbol={symbol}
            onOpenAssetPicker={() => setAssetPickerOpen(true)}
          />
        </div>
      </div>
    </>
  );
}

