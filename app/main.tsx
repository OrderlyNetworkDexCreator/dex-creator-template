import React, { lazy, Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { withBasePath } from './utils/base-path';
import { getRuntimeConfig } from './utils/runtime-config';
import './styles/index.css';

// Top-level React error boundary to catch any uncaught render errors
class RootErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[RootErrorBoundary] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message ?? 'Unknown error';
      const isInitError =
        msg.toLowerCase().includes('vite_privy_app_id') ||
        msg.toLowerCase().includes('privy') ||
        msg.toLowerCase().includes('walletconnect');

      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#0a0a14',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              background: '#13131f',
              border: '1px solid #2a2a3a',
              borderRadius: '12px',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ff6b6b' }}>
              App failed to load
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', lineHeight: 1.6 }}>
              {msg}
            </p>
            {isInitError && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                This may be caused by a wallet provider configuration issue.
                Ensure your Privy App ID and WalletConnect Project ID have the
                current domain added to their allowed origins in their respective dashboards.
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 28px',
                background: 'rgb(109, 92, 246)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const IndexPage = lazy(() => import('./pages/Index'));
const PerpLayout = lazy(() => import('./pages/perp/Layout'));
const PerpIndex = lazy(() => import('./pages/perp/Index'));
const PerpSymbol = lazy(() => import('./pages/perp/Symbol'));
const PortfolioLayout = lazy(() => import('./pages/portfolio/Layout'));
const PortfolioIndex = lazy(() => import('./pages/portfolio/Index'));
const PortfolioPositions = lazy(() => import('./pages/portfolio/Positions'));
const PortfolioOrders = lazy(() => import('./pages/portfolio/Orders'));
const PortfolioAssets = lazy(() => import('./pages/portfolio/Assets'));
const PortfolioApiKey = lazy(() => import('./pages/portfolio/ApiKey'));
const PortfolioFee = lazy(() => import('./pages/portfolio/Fee'));
const PortfolioHistory = lazy(() => import('./pages/portfolio/History'));
const PortfolioSetting = lazy(() => import('./pages/portfolio/Setting'));
const MarketsLayout = lazy(() => import('./pages/markets/Layout'));
const MarketsIndex = lazy(() => import('./pages/markets/Index'));
const LeaderboardLayout = lazy(() => import('./pages/leaderboard/Layout'));
const LeaderboardIndex = lazy(() => import('./pages/leaderboard/Index'));
const RewardsLayout = lazy(() => import('./pages/rewards/Layout'));
const RewardsIndex = lazy(() => import('./pages/rewards/Index'));
const RewardsAffiliate = lazy(() => import('./pages/rewards/Affiliate'));
const VaultsLayout = lazy(() => import('./pages/vaults/Layout'));
const VaultsIndex = lazy(() => import('./pages/vaults/Index'));
const SwapLayout = lazy(() => import('./pages/swap/Layout'));
const SwapIndex = lazy(() => import('./pages/swap/Index'));
const PointsLayout = lazy(() => import('./pages/points/Layout'));
const PointsIndex = lazy(() => import('./pages/points/Index'));


async function loadRuntimeConfig() {
  return new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.src = withBasePath('/config.js');
    script.onload = () => {
      console.log('Runtime config loaded successfully');
      resolve();
    };
    script.onerror = () => {
      console.log('Runtime config not found, using build-time env vars');
      resolve();
    };
    document.head.appendChild(script);
  });
}

function loadAnalytics() {
  const analyticsScript = getRuntimeConfig('VITE_ANALYTICS_SCRIPT');

  if (analyticsScript) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(analyticsScript, 'text/html');
    const scripts = doc.querySelectorAll('script');
    
    scripts.forEach((originalScript) => {
      const newScript = document.createElement('script');
      
      Array.from(originalScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      if (originalScript.textContent) {
        newScript.textContent = originalScript.textContent;
      }
      
      document.head.appendChild(newScript);
    });
  }
}

const basePath = import.meta.env.BASE_URL || '/';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <IndexPage /> },
      {
        path: 'perp',
        element: <PerpLayout />,
        children: [
          { index: true, element: <PerpIndex /> },
          { path: ':symbol', element: <PerpSymbol /> },
        ],
      },
      {
        path: 'portfolio',
        element: <PortfolioLayout />,
        children: [
          { index: true, element: <PortfolioIndex /> },
          { path: 'positions', element: <PortfolioPositions /> },
          { path: 'orders', element: <PortfolioOrders /> },
          { path: 'assets', element: <PortfolioAssets /> },
          { path: 'api-key', element: <PortfolioApiKey /> },
          { path: 'fee', element: <PortfolioFee /> },
          { path: 'history', element: <PortfolioHistory /> },
          { path: 'setting', element: <PortfolioSetting /> },
        ],
      },
      {
        path: 'markets',
        element: <MarketsLayout />,
        children: [
          { index: true, element: <MarketsIndex /> },
        ],
      },
      {
        path: 'leaderboard',
        element: <LeaderboardLayout />,
        children: [
          { index: true, element: <LeaderboardIndex /> },
        ],
      },
      {
        path: 'rewards',
        element: <RewardsLayout />,
        children: [
          { index: true, element: <RewardsIndex /> },
          { path: 'affiliate', element: <RewardsAffiliate /> },
        ],
      },
      {
        path: 'vaults',
        element: <VaultsLayout />,
        children: [
          { index: true, element: <VaultsIndex /> },
        ],
      },
      {
        path: 'swap',
        element: <SwapLayout />,
        children: [
          { index: true, element: <SwapIndex /> },
        ],
      },
      {
        path: 'points',
        element: <PointsLayout />,
        children: [
          { index: true, element: <PointsIndex /> },
        ],
      },
    ],
  },
], { basename: basePath });

loadRuntimeConfig().then(() => {
  loadAnalytics();
  
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RootErrorBoundary>
        <HelmetProvider>
          <RouterProvider router={router} />
        </HelmetProvider>
      </RootErrorBoundary>
    </React.StrictMode>
  );
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(withBasePath('/sw.js'))
      .then((registration) => {
        console.log('SW registered:', registration);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}

