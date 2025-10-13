import { Outlet } from "react-router-dom";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "@/utils/config";
import { useNav } from "@/hooks/useNav";
import CustomFooter from "@/components/CustomFooter";

export default function LeaderboardLayout() {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();

  return (
    <Scaffold
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: "/leaderboard",
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

