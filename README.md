# Orderly Broker UI Template

This template provides a quick way to set up a customized trading UI for Orderly Network brokers. It can be deployed to **Vercel** (recommended) or GitHub Pages.

## Quick Start

1. **Fork the Repository**
   
   Fork this repository to your GitHub account to create your broker's UI.

2. **Clone Your Fork**

```sh
git clone https://github.com/YOUR_USERNAME/broker-template.git
cd broker-template
```

3. **Install Dependencies**

```sh
yarn install
```

## Configuration Steps

### 1. Broker Configuration

Edit the `.env` file to set up your broker details:

```env
# Broker settings
VITE_ORDERLY_BROKER_ID=your_broker_id
VITE_ORDERLY_BROKER_NAME=Your Broker Name
VITE_ORDERLY_NETWORK_ID=mainnet  # or testnet for testing

# Meta tags
VITE_APP_NAME=Your App Name
VITE_APP_DESCRIPTION=Your app description for SEO

# Navigation menu configuration (optional)
VITE_ENABLED_MENUS=Trading,Portfolio,Markets,Leaderboard
VITE_CUSTOM_MENUS=Documentation,https://docs.yoursite.com;Blog,https://blog.yoursite.com;Support,https://support.yoursite.com
```

### 2. Theme Customization

1. Visit the [Orderly Storybook Trading Page](https://storybook.orderly.network/?path=/story/package-trading-tradingpage--page)
2. Customize your preferred theme using the controls
3. Export the generated CSS
4. Replace the contents of `app/styles/theme.css` with your exported CSS

### 3. UI Configuration

Edit `app/utils/config.tsx` to customize your UI:

- **Footer Links**: Update `footerProps` with your social media links
- **Logos**: Replace the main and secondary logos in the `appIcons` section
- **PnL Sharing**: Customize the PnL poster backgrounds and colors in `sharePnLConfig`

Required assets:
- Place your logos in the `public` directory:
  - Main logo: `public/orderly-logo.svg`
  - Secondary logo: `public/orderly-logo-secondary.svg`
  - Favicon: `public/favicon.webp`
- PnL sharing backgrounds: `public/pnl/poster_bg_[1-4].png`

## Development

Run the development server:

```sh
yarn dev
```

## Deployment

### ✅ Recommended: Deploy to Vercel (simplest)

Vercel is the best option for this DEX. The repo already contains a ready `vercel.json`. Compared to GitHub Pages, Vercel:
- Has **native SPA routing** — no workaround scripts needed
- Gives every project a unique URL (no risk of DNS pointing to the wrong fork)
- Automatically provisions and renews SSL for your custom domain
- Provides preview deployments on every pull request
- Has a fast, globally distributed CDN

#### Step 1 — Connect your repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New → Project** and import `xsunn3/virgos-0077`
3. Vercel will auto-detect the settings from `vercel.json` — no changes needed:
   - **Install command**: `yarn install --frozen-lockfile`
   - **Build command**: `yarn build`
   - **Output directory**: `build/client`
4. Click **Deploy** — your DEX will be live at `https://virgos-0077.vercel.app` (or similar) within ~2 minutes

#### Step 2 — Add your custom domain `trade.virgos.ai`

1. In the Vercel project dashboard, go to **Settings → Domains**
2. Type `trade.virgos.ai` and click **Add**
3. Vercel will show you the DNS record to set. At your domain registrar, add:

   | Field | Value |
   |-------|-------|
   | **Type** | CNAME |
   | **Name** | `trade` |
   | **Value** | `cname.vercel-dns.com` |
   | **TTL** | `3600` (or Automatic) |

4. Wait for DNS propagation (usually 5–30 minutes, up to 24 hours)
5. Vercel automatically provisions an SSL certificate — no extra steps

#### Step 3 — Configure your DEX settings

Edit `public/config.js`, commit, and push. Vercel will redeploy automatically (~60 seconds). All settings — broker ID, chain, logos, colors — are controlled through this single file.

> **Note:** You do **not** need to set any environment variables in the Vercel dashboard. Everything is read from `public/config.js` at runtime.

#### Step 4 — Whitelist your domain in Privy and WalletConnect ⚠️

This is the most common cause of a **black / blank page** after a successful Vercel deployment. The favicon loads (the file is served) but the React app stays dark because the wallet provider SDKs refuse to initialize on an unlisted domain.

**Privy**

1. Go to [dashboard.privy.io](https://dashboard.privy.io) and open your app (App ID: the value of `VITE_PRIVY_APP_ID` in `public/config.js`)
2. Navigate to **Settings → Allowed origins** (or **App settings → Domains**)
3. Add `https://trade.virgos.ai` (your custom domain)
4. Also add `https://<your-project>.vercel.app` for preview deployments
5. Save and wait ~1 minute, then reload your site

**WalletConnect**

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com) and open your project (Project ID: the value of `VITE_WALLETCONNECT_PROJECT_ID` in `public/config.js`)
2. Navigate to **Explorer** or **Settings → Allowed Domains**
3. Add `trade.virgos.ai` (no `https://` prefix needed here)
4. Also add your `*.vercel.app` preview URL
5. Save

After completing both steps, reload `trade.virgos.ai` — the DEX should load fully.

---

### Alternative: Deploy to GitHub Pages

GitHub Pages is free and already has an automated workflow in this repo. It requires more setup than Vercel and has some known limitations (see Troubleshooting section below), but works well once configured.

Push any change to the `main` branch — the [Deploy to GitHub Pages](.github/workflows/deploy.yml) workflow runs automatically and publishes to the `gh-pages` branch.

#### Custom domain for GitHub Pages

1. **Ensure the `CNAME` file** in the root of this repo contains your domain:
   ```
   trade.virgos.ai
   ```

2. **Configure DNS** at your registrar:

   | Field | Value |
   |-------|-------|
   | **Type** | CNAME |
   | **Name** | `trade` |
   | **Value** | `xsunn3.github.io` |
   | **TTL** | `3600` (or Automatic) |

   > ⚠️ Use `xsunn3.github.io` (your fork), **not** `orderlynetworkdexcreator.github.io` (the original Orderly repo). Using the wrong value will show a broken demo DEX instead of yours.

3. **Enable GitHub Pages** in repository settings:
   - Go to **Settings → Pages → Source → Deploy from a branch**
   - Set branch to `gh-pages`, folder to `/ (root)`, and click **Save**

## Troubleshooting: DEX Not Visible at `trade.virgos.ai`

### Why is the wrong DEX (or a broken page) showing?

When Orderly created this repository, it placed it under **`OrderlyNetworkDexCreator/virgos-0077`** first, with placeholder settings (`broker_id=demo`, a non-existent chain). You then forked it to **`xsunn3/virgos-0077`** and updated the config with the real settings (`broker_id=virgos`, Base chain 8453).

However, your **DNS still points to the original Orderly repo** (`orderlynetworkdexcreator.github.io`), which means visitors to `trade.virgos.ai` see the old placeholder deployment — not your real DEX.

```
Current (wrong):   trade.virgos.ai → orderlynetworkdexcreator.github.io  ← shows demo/broken DEX
Correct:           trade.virgos.ai → xsunn3.github.io                    ← shows YOUR perp DEX
```

### ✅ The Fix — One DNS change at your registrar

1. Log into your domain registrar (e.g. Namecheap, GoDaddy, Cloudflare)
2. Find the DNS record for `trade.virgos.ai`
3. Change the **CNAME** value:

| Field | Current value (wrong) | Change to |
|-------|-----------------------|-----------|
| Type  | CNAME | CNAME |
| Name  | `trade` | `trade` |
| Value | `orderlynetworkdexcreator.github.io` | **`xsunn3.github.io`** |
| TTL   | anything | `3600` (or Automatic) |

4. Save the record and wait for DNS propagation (up to 24 hours, usually 5–30 minutes)

Once DNS propagates, `trade.virgos.ai` will serve your perp DEX (broker: **virgos**, chain: **Base**) from this repository.

---

## Additional Resources

- [Orderly JS SDK Documentation](https://github.com/OrderlyNetwork/js-sdk)
- [Orderly Network Documentation](https://orderly.network/docs/sdks)
- [Storybook Theme Editor](https://storybook.orderly.network/?path=/story/package-trading-tradingpage--page)

