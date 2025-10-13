import { Outlet } from "react-router-dom";
import { useOrderlyConfig } from "@/utils/config";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { useNav } from "@/hooks/useNav";
import CustomFooter from "@/components/CustomFooter";

export default function MarketsLayout() {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();

  return (
    <Scaffold
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/markets",
      }}
      footerProps={config.scaffold.footerProps}
      footer={<CustomFooter />}
      routerAdapter={{
        onRouteChange,
      }}
      bottomNavProps={config.scaffold.bottomNavProps}
    >
      <Outlet />
    </Scaffold>
  );
}

