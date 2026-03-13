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
   | **Value** | `orderlynetworkdexcreator.github.io` |
   | **TTL** | `3600` (or Automatic) |

3. **Enable GitHub Pages** in the repository settings (Settings → Pages) and set the source to the `gh-pages` branch or the GitHub Actions deployment option.

> ⚠️ **Do not add this domain to Vercel.** The site is hosted on GitHub Pages. Adding the domain to a different Vercel project (such as your main marketing site) will cause the wrong site to be served at that URL — which is the most common misconfiguration.

## Additional Resources

- [Orderly JS SDK Documentation](https://github.com/OrderlyNetwork/js-sdk)
- [Orderly Network Documentation](https://orderly.network/docs/sdks)
- [Storybook Theme Editor](https://storybook.orderly.network/?path=/story/package-trading-tradingpage--page)

