import { Scaffold } from "@orderly.network/ui-scaffold";
import { Outlet } from "react-router-dom";

import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";

export default function RewardsLayout() {
  const { onRouteChange } = useNav();
  const config = useOrderlyConfig();

  return (
    <Scaffold
      classNames={{
        content: "lg:oui-mb-0",
        topNavbar: "oui-bg-base-9",
      }}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/rewards",
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

