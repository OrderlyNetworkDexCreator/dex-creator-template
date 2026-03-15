import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { useOrderlyConfig } from "@/utils/config";
import { getPageMeta } from "@/utils/seo";
import { renderSEOTags } from "@/utils/seo-tags";
import { SimpleChart } from "@/components/SimpleChart";

export default function PerpSymbol() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

  // Overlay SimpleChart on top of TradingView's chart pane.
  // The TradingView widget root is a `div.oui-relative.oui-size-full.oui-z-1` 
  // (position:relative), so we can append a position:absolute child with higher
  // z-index to cover it cleanly.
  useEffect(() => {
    let overlayDiv: HTMLDivElement | null = null;
    let observer: MutationObserver | null = null;

    const tryInject = () => {
      if (overlayDiv) return; // already injected
      // TradingView mounts as an <iframe id="tradingview_XXXXX">
      const iframe = document.querySelector('iframe[id^="tradingview_"]');
      if (!iframe) return;

      // Walk up 3 levels: iframe → div.oui-size-full → div.oui-absolute → div.oui-relative
      const chartRoot =
        iframe.parentElement?.parentElement?.parentElement ?? null;
      if (!chartRoot) return;

      overlayDiv = document.createElement("div");
      overlayDiv.style.cssText =
        "position:absolute;inset:0;z-index:10;overflow:hidden;";
      chartRoot.appendChild(overlayDiv);
      setPortalTarget(overlayDiv);
      observer?.disconnect();
    };

    observer = new MutationObserver(tryInject);
    observer.observe(document.body, { subtree: true, childList: true });
    tryInject(); // also try immediately (TradingView might already be ready)

    return () => {
      observer?.disconnect();
      if (overlayDiv) {
        overlayDiv.remove();
        setPortalTarget(null);
      }
    };
  }, []); // run once on mount

  const onSymbolChange = useCallback(
    (data: API.Symbol) => {
      const symbol = data.symbol;
      setSymbol(symbol);
      
      const searchParamsString = searchParams.toString();
      const queryString = searchParamsString ? `?${searchParamsString}` : '';
      
      navigate(`/perp/${symbol}${queryString}`);
    },
    [navigate, searchParams]
  );

  const pageMeta = getPageMeta();
  const pageTitle = generatePageTitle(formatSymbol(params.symbol!));

  return (
    <>
      {renderSEOTags(pageMeta, pageTitle)}
      <TradingPage
        symbol={symbol}
        onSymbolChange={onSymbolChange}
        tradingViewConfig={config.tradingPage.tradingViewConfig}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
      {portalTarget && createPortal(<SimpleChart symbol={symbol} />, portalTarget)}
    </>
  );
}

