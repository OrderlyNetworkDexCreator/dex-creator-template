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

  // Inject SimpleChart into the chart container area rendered by TradingPage.
  // Since we don't use the TradingView library, we wait briefly for the Orderly
  // scaffold to mount its chart container, then inject our Kraken-powered chart.
  useEffect(() => {
    // 800 ms gives the Orderly scaffold enough time to render the chart container
    // and measure its dimensions reliably, without making the user wait noticeably.
    const INJECT_TIMEOUT_MS = 800;
    const MIN_CHART_WIDTH = 200;
    const MIN_CHART_HEIGHT = 100;

    let overlayDiv: HTMLDivElement | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const injectIntoContainer = (container: Element) => {
      if (overlayDiv) return;
      overlayDiv = document.createElement("div");
      overlayDiv.style.cssText =
        "position:absolute;inset:0;z-index:10;overflow:hidden;";
      container.appendChild(overlayDiv);
      setPortalTarget(overlayDiv);
    };

    const tryInject = () => {
      if (overlayDiv) return;
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

    // Wait briefly for the Orderly scaffold chart container to mount, then inject.
    // Use a MutationObserver as primary and the timer as a safety net.
    let observer: MutationObserver | null = new MutationObserver(tryInject);
    observer.observe(document.body, { subtree: true, childList: true });
    tryInject(); // try immediately in case it's already mounted

    timer = setTimeout(() => {
      tryInject();
    }, INJECT_TIMEOUT_MS);

    return () => {
      if (timer) clearTimeout(timer);
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
        tradingViewConfig={{
          ...config.tradingPage.tradingViewConfig,
          scriptSRC: undefined,
        }}
        sharePnLConfig={config.tradingPage.sharePnLConfig}
      />
      {portalTarget && createPortal(<SimpleChart symbol={symbol} />, portalTarget)}
    </>
  );
}

