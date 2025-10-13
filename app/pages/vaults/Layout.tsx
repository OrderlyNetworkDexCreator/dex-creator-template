import { Outlet } from "react-router-dom";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";

export default function VaultsLayout() {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();

  return (
    <Scaffold
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/vaults",
      }}
      // footerProps={config.scaffold.footerProps}
      routerAdapter={{
        onRouteChange,
      }}
      bottomNavProps={config.scaffold.bottomNavProps}
    >
      <Outlet />
    </Scaffold>
  );
}

