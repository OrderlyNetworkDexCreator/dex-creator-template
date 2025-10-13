import { getRuntimeConfig } from "./runtime-config";

// Define your custom symbol list
export const CUSTOM_SYMBOL_LIST = [
  "PERP_SUI_USDC",
  "PERP_LINK_USDC",
  "PERP_BNB_USDC",
  "PERP_BTC_USDC",
  "PERP_ETH_USDC",
  "PERP_SOL_USDC",
  "PERP_ARB_USDC",
  "PERP_DOGE_USDC",
  "PERP_AVAX_USDC",
  "PERP_MATIC_USDC",
  "PERP_OP_USDC",
];

/**
 * Get the custom symbol list from runtime config or use default
 * Format: comma-separated list like "PERP_BNB_USDC,PERP_BTC_USDC,PERP_ETH_USDC"
 */
export function getCustomSymbolList(): string[] | undefined {
  const customSymbols = getRuntimeConfig("VITE_CUSTOM_SYMBOL_LIST");

  if (customSymbols) {
    return customSymbols
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // Return undefined to show all symbols, or return CUSTOM_SYMBOL_LIST to filter
  const enableFilter = getRuntimeConfig("VITE_ENABLE_SYMBOL_FILTER");
  if (enableFilter === "true") {
    return CUSTOM_SYMBOL_LIST;
  }

  return undefined; // Show all symbols
}

/**
 * Filter function for TradingPage symbolFilter prop
 */
export function symbolFilter(symbol: any): boolean {
  const customList = getCustomSymbolList();

  // If no custom list, show all symbols
  if (!customList || customList.length === 0) {
    return true;
  }

  // Check if symbol is in the custom list
  return customList.includes(symbol.symbol);
}

/**
 * Sort function to show custom symbols at the top in the specified order
 */
export function symbolSortFn(a: any, b: any): number {
  const customList = getCustomSymbolList();
  
  // If no custom list, use default sorting
  if (!customList || customList.length === 0) {
    return 0;
  }
  
  const aIndex = customList.indexOf(a.symbol);
  const bIndex = customList.indexOf(b.symbol);
  
  // Both symbols are in custom list - sort by their position in the list
  if (aIndex !== -1 && bIndex !== -1) {
    return aIndex - bIndex;
  }
  
  // Only 'a' is in custom list - 'a' comes first
  if (aIndex !== -1) {
    return -1;
  }
  
  // Only 'b' is in custom list - 'b' comes first
  if (bIndex !== -1) {
    return 1;
  }
  
  // Neither is in custom list - maintain original order
  return 0;
}
