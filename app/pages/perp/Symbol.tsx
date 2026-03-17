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
  // Primary: wait for TradingView iframe to appear, then inject over it.
  // Fallback: if TradingView never loads (e.g. domain not licensed), find the
  // chart container directly by its Orderly CSS class after a short timeout.
  useEffect(() => {
    const TRADINGVIEW_TIMEOUT_MS = 4000;
    const MIN_CHART_WIDTH = 200;
    const MIN_CHART_HEIGHT = 100;

    let overlayDiv: HTMLDivElement | null = null;
    let observer: MutationObserver | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const injectIntoContainer = (container: Element) => {
      if (overlayDiv) return; // already injected
      overlayDiv = document.createElement("div");
      overlayDiv.style.cssText =
        "position:absolute;inset:0;z-index:10;overflow:hidden;";
      container.appendChild(overlayDiv);
      setPortalTarget(overlayDiv);
      observer?.disconnect();
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    const tryInject = () => {
      if (overlayDiv) return; // already injected
      // TradingView mounts as an <iframe id="tradingview_XXXXX">
      const iframe = document.querySelector('iframe[id^="tradingview_"]');
      if (!iframe) return;

      // Walk up 3 levels: iframe → div.oui-size-full → div.oui-absolute → div.oui-relative
      const chartRoot =
        iframe.parentElement?.parentElement?.parentElement ?? null;
      if (!chartRoot) return;

      injectIntoContainer(chartRoot);
    };

    // Fallback: TradingView may not initialize if domain is unlicensed.
    // Find the chart container directly via its Orderly CSS class instead.
    const tryInjectFallback = () => {
      if (overlayDiv) return; // primary injection already succeeded
      const candidates = document.querySelectorAll<HTMLElement>(
        ".oui-relative.oui-size-full.oui-z-1"
      );
      let best: HTMLElement | null = null;
      let maxArea = 0;
      for (const el of candidates) {
        const rect = el.getBoundingClientRect();
        const area = rect.width * rect.height;
        if (area > maxArea && rect.width > MIN_CHART_WIDTH && rect.height > MIN_CHART_HEIGHT) {
          maxArea = area;
          best = el;
        }
      }
      if (best) {
        injectIntoContainer(best);
      }
    };

    observer = new MutationObserver(tryInject);
    observer.observe(document.body, { subtree: true, childList: true });
    tryInject(); // also try immediately (TradingView might already be ready)

    // After TRADINGVIEW_TIMEOUT_MS, fall back to class-based injection if TradingView never loaded
    fallbackTimer = setTimeout(tryInjectFallback, TRADINGVIEW_TIMEOUT_MS);

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
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

