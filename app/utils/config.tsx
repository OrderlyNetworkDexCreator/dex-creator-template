import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { TradingPageProps } from "@orderly.network/trading";
import {
  BottomNavProps,
  FooterProps,
  MainNavWidgetProps,
  MainNavItem as MainNavItemType,
} from "@orderly.network/ui-scaffold";
import { AppLogos } from "@orderly.network/react-app";
import { OrderlyActiveIcon, OrderlyIcon } from "../components/icons/orderly";
import { withBasePath } from "./base-path";
import {
  PortfolioActiveIcon,
  PortfolioInactiveIcon,
  TradingActiveIcon,
  TradingInactiveIcon,
  LeaderboardActiveIcon,
  LeaderboardInactiveIcon,
  MarketsActiveIcon,
  MarketsInactiveIcon,
  useScreen,
  Flex,
  cn,
} from "@orderly.network/ui";
import {
  getRuntimeConfig,
  getRuntimeConfigBoolean,
  getRuntimeConfigNumber,
} from "./runtime-config";
import { Link } from "react-router-dom";
import CustomLeftNav from "@/components/CustomLeftNav";
import { CampaignsNavTitle } from "@/components/CampaignsNavTitle";

interface MainNavItem {
  name: string;
  href: string;
  target?: string;
}

type MenuConfigItem = {
  id: string;
  href: string;
  name: string;
  target?: string;
  isDefault?: boolean;
} & Pick<MainNavItemType, "customRender">;

interface ColorConfigInterface {
  upColor?: string;
  downColor?: string;
  pnlUpColor?: string;
  pnlDownColor?: string;
  chartBG?: string;
}

export type OrderlyConfig = {
  orderlyAppProvider: {
    appIcons: AppLogos;
  };
  scaffold: {
    mainNavProps: MainNavWidgetProps;
    footerProps: FooterProps;
    bottomNavProps: BottomNavProps;
  };
  tradingPage: {
    tradingViewConfig: TradingPageProps["tradingViewConfig"];
    sharePnLConfig: TradingPageProps["sharePnLConfig"];
  };
};

const getCustomMenuItems = (): MainNavItem[] => {
  const customMenusEnv = getRuntimeConfig("VITE_CUSTOM_MENUS");

  if (
    !customMenusEnv ||
    typeof customMenusEnv !== "string" ||
    customMenusEnv.trim() === ""
  ) {
    return [];
  }

  try {
    // Parse delimiter-separated menu items
    // Expected format: "Documentation,https://docs.example.com;Blog,https://blog.example.com;Support,https://support.example.com"
    const menuPairs = customMenusEnv
      .split(";")
      .map((pair) => pair.trim())
      .filter((pair) => pair.length > 0);

    const validCustomMenus: MainNavItem[] = [];

    for (const pair of menuPairs) {
      const [name, href] = pair.split(",").map((item) => item.trim());

      if (!name || !href) {
        console.warn(
          "Invalid custom menu item format. Expected 'name,url':",
          pair
        );
        continue;
      }

      validCustomMenus.push({
        name,
        href,
        target: "_blank",
      });
    }

    return validCustomMenus;
  } catch (e) {
    console.warn("Error parsing VITE_CUSTOM_MENUS:", e);
    return [];
  }
};

const getEnabledMenus = (
  allMenuItems: MenuConfigItem[],
  defaultEnabledMenus: MenuConfigItem[]
) => {
  const enabledMenusEnv = getRuntimeConfig("VITE_ENABLED_MENUS");

  if (
    !enabledMenusEnv ||
    typeof enabledMenusEnv !== "string" ||
    enabledMenusEnv.trim() === ""
  ) {
    return defaultEnabledMenus;
  }

  try {
    const enabledMenuNames = enabledMenusEnv
      .split(",")
      .map((name) => name.trim());

    const enabledMenus = [];
    for (const menuName of enabledMenuNames) {
      const menuItem = allMenuItems.find((item) => item.id === menuName);
      if (menuItem) {
        enabledMenus.push(menuItem);
      }
    }

    return enabledMenus.length > 0 ? enabledMenus : defaultEnabledMenus;
  } catch (e) {
    console.warn("Error parsing VITE_ENABLED_MENUS:", e);
    return defaultEnabledMenus;
  }
};

const getPnLBackgroundImages = (): string[] => {
  const useCustomPnL = getRuntimeConfigBoolean("VITE_USE_CUSTOM_PNL_POSTERS");

  if (useCustomPnL) {
    const customPnLCount = getRuntimeConfigNumber(
      "VITE_CUSTOM_PNL_POSTER_COUNT"
    );

    if (isNaN(customPnLCount) || customPnLCount < 1) {
      return [
        withBasePath("/pnl/poster_bg_1.png"),
        withBasePath("/pnl/poster_bg_2.png"),
        withBasePath("/pnl/poster_bg_3.png"),
        withBasePath("/pnl/poster_bg_4.png"),
      ];
    }

    const customPosters: string[] = [];
    for (let i = 1; i <= customPnLCount; i++) {
      customPosters.push(withBasePath(`/pnl/poster_bg_${i}.webp`));
    }

    return customPosters;
  }

  return [
    withBasePath("/pnl/poster_bg_1.png"),
    withBasePath("/pnl/poster_bg_2.png"),
    withBasePath("/pnl/poster_bg_3.png"),
    withBasePath("/pnl/poster_bg_4.png"),
  ];
};

const getBottomNavIcon = (menuId: string) => {
  switch (menuId) {
    case "Trading":
      return {
        activeIcon: <TradingActiveIcon />,
        inactiveIcon: <TradingInactiveIcon />,
      };
    case "Portfolio":
      return {
        activeIcon: <PortfolioActiveIcon />,
        inactiveIcon: <PortfolioInactiveIcon />,
      };
    case "Leaderboard":
      return {
        activeIcon: <LeaderboardActiveIcon />,
        inactiveIcon: <LeaderboardInactiveIcon />,
      };
    case "Markets":
      return {
        activeIcon: <MarketsActiveIcon />,
        inactiveIcon: <MarketsInactiveIcon />,
      };
    default:
      throw new Error(`Unsupported menu id: ${menuId}`);
  }
};

const getColorConfig = (): ColorConfigInterface | undefined => {
  const customColorConfigEnv = getRuntimeConfig(
    "VITE_TRADING_VIEW_COLOR_CONFIG"
  );

  if (
    !customColorConfigEnv ||
    typeof customColorConfigEnv !== "string" ||
    customColorConfigEnv.trim() === ""
  ) {
    return undefined;
  }

  try {
    const customColorConfig = JSON.parse(customColorConfigEnv);
    return customColorConfig;
  } catch (e) {
    console.warn("Error parsing VITE_TRADING_VIEW_COLOR_CONFIG:", e);
    return undefined;
  }
};

export const useOrderlyConfig = () => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  return useMemo<OrderlyConfig>(() => {
    const allMenuItems: MenuConfigItem[] = [
      { id: "Trading", href: "/", name: t("common.trading"), isDefault: true },
      {
        id: "Portfolio",
        href: "/portfolio",
        name: t("common.portfolio"),
        isDefault: true,
      },
      {
        id: "Markets",
        href: "/markets",
        name: t("common.markets"),
        isDefault: true,
      },
      { id: "Swap", href: "/swap", name: t("extend.swap"), isDefault: true },
      {
        id: "Leaderboard",
        href: "/leaderboard",
        name: t("extend.tradingLeaderboard.leaderboard"),
        isDefault: true,
      },
      {
        id: "Campaigns",
        href: "",
        name: t("extend.tradingLeaderboard.campaigns"),
        isDefault: true,
        target: "_blank",
        customRender: () => {
          return (
            <CampaignsNavTitle
              title={t("extend.tradingLeaderboard.campaigns")}
            />
          );
        },
      },

      { id: "Rewards", href: "/rewards", name: t("tradingRewards.rewards") },
      { id: "Vaults", href: "/vaults", name: t("common.vaults") },
      {
        id: "Points",
        href: "/points",
        name: t("extend.tradingPoints.points"),
      },
    ];

    const defaultEnabledMenus = allMenuItems.filter((menu) => menu.isDefault);

    const enabledMenus = getEnabledMenus(allMenuItems, defaultEnabledMenus);
    const customMenus = getCustomMenuItems();

    const translatedEnabledMenus = enabledMenus.map((menu) => ({
      name: menu.name,
      href: menu.href,
      target: menu.target,
      customRender: menu.customRender,
    }));

    const allMainMenus = [...translatedEnabledMenus, ...customMenus];

    const supportedBottomNavMenus = [
      "Trading",
      "Portfolio",
      "Markets",
      "Leaderboard",
    ];
    const bottomNavMenus = enabledMenus
      .filter((menu) => supportedBottomNavMenus.includes(menu.id))
      .map((menu) => {
        const icons = getBottomNavIcon(menu.id);
        return {
          name: menu.name,
          href: menu.href,
          target: menu.target,
          ...icons,
        };
      })
      .filter((menu) => menu.activeIcon && menu.inactiveIcon);

    const mainNavProps: MainNavWidgetProps = {
      initialMenu: "/",
      mainMenus: allMainMenus,
    };

    if (getRuntimeConfigBoolean("VITE_ENABLE_CAMPAIGNS")) {
      mainNavProps.campaigns = {
        name: "$ORDER",
        href: "/rewards",
        children: [
          {
            name: t("extend.staking"),
            href: "https://app.orderly.network/staking",
            description: t("extend.staking.description"),
            icon: <OrderlyIcon size={14} />,
            activeIcon: <OrderlyActiveIcon size={14} />,
            target: "_blank",
          },
        ],
      };
    }

    mainNavProps.customRender = (components) => {
      return (
        <Flex justify="between" className="oui-w-full">
          <Flex
            itemAlign={"center"}
            className={cn("oui-gap-3", "oui-overflow-hidden")}
          >
            {isMobile && (
              <CustomLeftNav
                menus={translatedEnabledMenus}
                externalLinks={customMenus}
              />
            )}
            <Link to="/">
              {isMobile &&
              getRuntimeConfigBoolean("VITE_HAS_SECONDARY_LOGO") ? (
                <img
                  src={withBasePath("/logo-secondary.webp")}
                  alt="logo"
                  style={{ height: "32px" }}
                />
              ) : (
                components.title
              )}
            </Link>
            {components.mainNav}
          </Flex>

          <Flex itemAlign={"center"} className="oui-gap-2">
            {components.accountSummary}
            {components.linkDevice}
            {components.scanQRCode}
            {components.languageSwitcher}
            {components.subAccount}
            {components.chainMenu}
            {components.walletConnect}
          </Flex>
        </Flex>
      );
    };

    return {
      scaffold: {
        mainNavProps,
        bottomNavProps: {
          mainMenus: bottomNavMenus,
        },
        footerProps: {
          telegramUrl: getRuntimeConfig("VITE_TELEGRAM_URL") || undefined,
          discordUrl: getRuntimeConfig("VITE_DISCORD_URL") || undefined,
          twitterUrl: getRuntimeConfig("VITE_TWITTER_URL") || undefined,
          trailing: (
            <span className="oui-text-2xs oui-text-base-contrast-54">
              Charts powered by{" "}
              <a
                href="https://tradingview.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                TradingView
              </a>
            </span>
          ),
        },
      },
      orderlyAppProvider: {
        appIcons: {
          main: getRuntimeConfigBoolean("VITE_HAS_PRIMARY_LOGO")
            ? {
                component: (
                  <img
                    src={withBasePath("/logo.webp")}
                    alt="logo"
                    style={{ height: "42px" }}
                  />
                ),
              }
            : { img: withBasePath("/orderly-logo.svg") },
          secondary: {
            img: getRuntimeConfigBoolean("VITE_HAS_SECONDARY_LOGO")
              ? withBasePath("/logo-secondary.webp")
              : withBasePath("/orderly-logo-secondary.svg"),
          },
        },
      },
      tradingPage: {
        tradingViewConfig: {
          scriptSRC: withBasePath(
            "/tradingview/charting_library/charting_library.js"
          ),
          library_path: withBasePath("/tradingview/charting_library/"),
          customCssUrl: withBasePath("/tradingview/chart.css"),
          colorConfig: getColorConfig(),
        },
        sharePnLConfig: {
          backgroundImages: getPnLBackgroundImages(),
          color: "rgba(255, 255, 255, 0.98)",
          profitColor: "rgba(41, 223, 169, 1)",
          lossColor: "rgba(245, 97, 139, 1)",
          brandColor: "rgba(255, 255, 255, 0.98)",
          // ref
          refLink:
            typeof window !== "undefined" ? window.location.origin : undefined,
          refSlogan:
            getRuntimeConfig("VITE_ORDERLY_BROKER_NAME") || "Orderly Network",
        },
      },
    };
  }, [t, isMobile]);
};
