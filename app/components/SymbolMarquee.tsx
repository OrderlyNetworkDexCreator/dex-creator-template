import { FC, useEffect, useState } from "react";
import { useMarketsStream } from "@orderly.network/hooks";
import { getCustomSymbolList } from "@/utils/symbolConfig";

interface MarqueeSymbol {
  symbol: string;
  displaySymbol: string;
  price: string;
  change24h: number;
}

const SymbolMarquee: FC = () => {
  const { data } = useMarketsStream();
  const [marqueeSymbols, setMarqueeSymbols] = useState<MarqueeSymbol[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Get custom symbol list or use top symbols
    const customList = getCustomSymbolList();
    const symbolsToShow = customList && customList.length > 0 
      ? customList 
      : data.slice(0, 10).map((item: any) => item.symbol);

    const marqueeData = symbolsToShow
      .map((symbol: string) => {
        const item = data.find((d: any) => d.symbol === symbol);
        if (!item) return null;

        const displaySymbol = symbol.replace('PERP_', '').replace('_USDC', '');
        
        return {
          symbol: symbol,
          displaySymbol: displaySymbol,
          price: item.close ? Number(item.close).toFixed(Number(item.close) < 1 ? 4 : 2) : '0',
          change24h: item.change || 0,
        };
      })
      .filter(Boolean) as MarqueeSymbol[];

    setMarqueeSymbols(marqueeData);
  }, [data]);

  if (marqueeSymbols.length === 0) return null;

  return (
    <div className="oui-w-full oui-bg-base-8 oui-border-b oui-border-line-12 oui-overflow-hidden">
      <div className="oui-relative oui-h-10 oui-flex oui-items-center">
        <div className="marquee-container">
          <div className="marquee-content">
            {/* First set of symbols */}
            {marqueeSymbols.map((item, index) => (
              <a
                key={`first-${index}`}
                href={`/perp/${item.symbol}`}
                className="oui-inline-flex oui-items-center oui-px-4 oui-cursor-pointer hover:oui-bg-base-7 oui-transition-colors oui-no-underline"
              >
                <span className="oui-text-sm oui-font-semibold oui-text-base-contrast-80 oui-mr-2">
                  {item.displaySymbol}
                </span>
                <span className="oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-mr-2">
                  ${item.price}
                </span>
                <span
                  className={`oui-text-xs oui-font-medium ${
                    item.change24h >= 0
                      ? 'oui-text-trade-profit'
                      : 'oui-text-trade-loss'
                  }`}
                >
                  {item.change24h >= 0 ? '+' : ''}
                  {(item.change24h * 100).toFixed(2)}%
                </span>
              </a>
            ))}
            {/* Duplicate set for seamless loop */}
            {marqueeSymbols.map((item, index) => (
              <a
                key={`second-${index}`}
                href={`/perp/${item.symbol}`}
                className="oui-inline-flex oui-items-center oui-px-4 oui-cursor-pointer hover:oui-bg-base-7 oui-transition-colors oui-no-underline"
              >
                <span className="oui-text-sm oui-font-semibold oui-text-base-contrast-80 oui-mr-2">
                  {item.displaySymbol}
                </span>
                <span className="oui-text-sm oui-font-medium oui-text-base-contrast-54 oui-mr-2">
                  ${item.price}
                </span>
                <span
                  className={`oui-text-xs oui-font-medium ${
                    item.change24h >= 0
                      ? 'oui-text-trade-profit'
                      : 'oui-text-trade-loss'
                  }`}
                >
                  {item.change24h >= 0 ? '+' : ''}
                  {(item.change24h * 100).toFixed(2)}%
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }

        .marquee-content {
          display: inline-flex;
          animation: marquee 30s linear infinite;
          will-change: transform;
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marquee-content {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SymbolMarquee;
