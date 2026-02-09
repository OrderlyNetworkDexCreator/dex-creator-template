# Orderly Broker UI Template

This template provides a quick way to set up a customized trading UI for Orderly Network brokers, built with Remix and deployable on Vercel.

🔗 [Live Demo](https://broker-template-seven.vercel.app/)

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

1. Build the application:

```sh
yarn build
```

2. Deploy to Vercel:
   - Create an account on [Vercel](https://vercel.com) if you haven't already
   - Install Vercel CLI: `yarn global add vercel`
   - Run `vercel` in your project directory and follow the prompts
   - For subsequent deployments, use `vercel --prod` to deploy to production

For custom domain setup:
   - Go to your project settings in Vercel dashboard
   - Navigate to the "Domains" section
   - Add and configure your custom domain

## Additional Resources

- [Orderly JS SDK Documentation](https://github.com/OrderlyNetwork/js-sdk)
- [Orderly Network Documentation](https://orderly.network/docs/sdks)
- [Storybook Theme Editor](https://storybook.orderly.network/?path=/story/package-trading-tradingpage--page)

