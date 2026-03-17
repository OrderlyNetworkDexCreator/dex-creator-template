# Orderly Broker UI Template

This template provides a quick way to set up a customized trading UI for Orderly Network brokers, deployed automatically to GitHub Pages.

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

This project deploys automatically to **GitHub Pages** via GitHub Actions whenever you push to the `main` branch. No manual build or upload step is needed.

### How it works

1. Push your changes to the `main` branch.
2. The [Deploy to GitHub Pages](.github/workflows/deploy.yml) workflow runs automatically.
3. It builds the app and publishes it to GitHub Pages.

### Custom Domain Setup

To serve the DEX from your own domain (e.g. `trade.yourdomain.com`):

1. **Add a `CNAME` file** to the root of this repository containing your custom domain:

   ```
   trade.yourdomain.com
   ```

   > The file `CNAME` in this repo is already set to `trade.virgos.ai`.

2. **Configure DNS** at your domain registrar — add a `CNAME` record:

   | Field | Value |
   |-------|-------|
   | **Name** | `trade` |
   | **Value** | `xsunn3.github.io` |
   | **TTL** | `3600` (or Automatic) |

   > ⚠️ **Use `xsunn3.github.io`, NOT `orderlynetworkdexcreator.github.io`.**
   > Orderly's own setup instructions reference the template owner's URL. For this repository (your fork), the correct value is `xsunn3.github.io`. Using the wrong value will prevent the site from loading.

   > ⏱️ DNS changes can take up to 24 hours to propagate globally. The site will not be reachable at your custom domain until this record is in place and has propagated.

3. **Enable GitHub Pages** in the repository settings:
   - Go to **Settings → Pages**
   - Under **Source**, select **Deploy from a branch**
   - Set **Branch** to `gh-pages` and the folder to `/ (root)`
   - Click **Save**

   > The deploy workflow pushes built files to the `gh-pages` branch automatically on every push to `main`. No manual upload is needed after initial setup.

4. **Set the Custom domain** in GitHub Pages settings:
   - In **Settings → Pages → Custom domain**, enter `trade.virgos.ai`
   - Click **Save**

   > The deploy workflow also sets this automatically via the GitHub API on every successful deploy. If the custom domain field appears blank after a failed deploy, you can set it manually here, or push any change to `main` to re-trigger the workflow.

> ⚠️ **Do not add this domain to Vercel.** The site is hosted on GitHub Pages. Adding the domain to a different Vercel project (such as your main marketing site) will cause the wrong site to be served at that URL — which is the most common misconfiguration.

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

