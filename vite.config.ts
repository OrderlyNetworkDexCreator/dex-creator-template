import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { cjsInterop } from "vite-plugin-cjs-interop";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import fs from "fs";
import path from "path";

function loadConfigTitle(): string {
  try {
    const configPath = path.join(__dirname, "public/config.js");
    if (!fs.existsSync(configPath)) {
      return "Orderly Network";
    }

    const configText = fs.readFileSync(configPath, "utf-8");
    const jsonText = configText
      .replace(/window\.__RUNTIME_CONFIG__\s*=\s*/, "")
      .replace(/;$/, "")
      .trim();

    const config = JSON.parse(jsonText);
    return config.VITE_ORDERLY_BROKER_NAME || "Orderly Network";
  } catch (error) {
    console.warn("Failed to load title from config.js:", error);
    return "Orderly Network";
  }
}

function htmlTitlePlugin(): Plugin {
  const title = loadConfigTitle();
  console.log(`Using title from config.js: ${title}`);

  return {
    name: "html-title-transform",
    transformIndexHtml(html) {
      return html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    },
  };
}

export default defineConfig(() => {
  const basePath = process.env.PUBLIC_PATH || "/";

  return {
    base: basePath,
    plugins: [
      react(),
      tsconfigPaths(),
      htmlTitlePlugin(),
      cjsInterop({
        dependencies: ["bs58", "@coral-xyz/anchor", "lodash"],
      }),
      nodePolyfills({
        include: ["buffer", "crypto", "stream"],
      }),
    ],
    build: {
      outDir: "build/client",
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom", "react-helmet-async"],
            "wallet-vendor": [
              "wagmi",
              "@web3-onboard/walletconnect",
              "@solana/wallet-adapter-base",
              "@solana/wallet-adapter-wallets",
              "@solana-mobile/wallet-adapter-mobile",
              "@privy-io/cross-app-connect",
            ],
            "orderly": [
              "@orderly.network/ui",
              "@orderly.network/ui-scaffold",
              "@orderly.network/wallet-connector",
              "@orderly.network/wallet-connector-privy",
              "@orderly.network/trading",
              "@orderly.network/markets",
              "@orderly.network/portfolio",
              "@orderly.network/react-app",
              "@orderly.network/affiliate",
              "@orderly.network/trading-leaderboard",
              "@orderly.network/trading-points",
              "@orderly.network/vaults",
              "@orderly.network/i18n",
              "@orderly.network/types",
            ],
            "charting": ["lightweight-charts"],
          },
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
    },
  };
});
