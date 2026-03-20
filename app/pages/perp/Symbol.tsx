import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import { SimpleChart } from "@/components/SimpleChart";
import { SimpleTradingPanel } from "@/components/SimpleTradingPanel";

// ─── Layout styles ────────────────────────────────────────────────────────────
const PANEL_WIDTH = 320; // px — right panel width

export default function PerpSymbol() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
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
          }}
        >
          <SimpleTradingPanel symbol={symbol} />
        </div>
      </div>
    </>
  );
}

