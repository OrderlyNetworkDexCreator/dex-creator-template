import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OrderlyProvider from "@/components/orderlyProvider";
import { withBasePath } from "./utils/base-path";
import { getSEOConfig, getUserLanguage } from "./utils/seo";
import SymbolMarquee from "./components/SymbolMarquee";
import { useScreen } from "@orderly.network/ui";

export default function App() {
  const seoConfig = getSEOConfig();
  const defaultLanguage = getUserLanguage();
  const { isMobile } = useScreen();
  
  return (
    <>
      <Helmet>
        <html lang={seoConfig.language || defaultLanguage} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/webp" href={withBasePath("/favicon.webp")} />
      </Helmet>
      <OrderlyProvider>
        {!isMobile && <SymbolMarquee />}
        <Outlet />
      </OrderlyProvider>
    </>
  );
}

