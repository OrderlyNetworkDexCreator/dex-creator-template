import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";
import { API } from "@orderly.network/types";
import { TradingPage } from "@orderly.network/trading";
import { updateSymbol } from "@/utils/storage";
import { formatSymbol, generatePageTitle } from "@/utils/utils";
import { useOrderlyConfig } from "@/utils/config";
import { getPageMeta } from "@/utils/seo";

export const meta: MetaFunction = ({ params }) => {
  const rootSeoTags = getPageMeta();
  const pageSpecificTags = [{ title: generatePageTitle(formatSymbol(params.symbol!)) }];
  return [...rootSeoTags, ...pageSpecificTags];
};

export default function PerpPage() {
  const params = useParams();
  const [symbol, setSymbol] = useState(params.symbol!);
  const config = useOrderlyConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    updateSymbol(symbol);
  }, [symbol]);

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
// Temporary enhancement: enable horizontal line drawings on TradingView chart
useEffect(() => {
  const interval = setInterval(() => {
    const tvWidget = window.tvWidget || window.tradingViewWidget;
    if (tvWidget && tvWidget.activeChart) {
      tvWidget.activeChart().createHorizontalLine(50000, { color: "#22ab94" });
      clearInterval(interval);
    }
  }, 3000);
  return () => clearInterval(interval);
}, []);

  return (
    <TradingPage
      symbol={symbol}
      onSymbolChange={onSymbolChange}
      tradingViewConfig={config.tradingPage.tradingViewConfig}
      sharePnLConfig={config.tradingPage.sharePnLConfig}
    />
  );
}
