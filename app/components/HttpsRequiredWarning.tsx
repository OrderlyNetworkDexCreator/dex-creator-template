import { useEffect } from 'react';
import { canUseEmbeddedWallet, isHttpsOrLocalhost } from '@/utils/https-detection';
import { getRuntimeConfig } from '@/utils/runtime-config';

export const HttpsRequiredWarning = () => {
  const privyAppId = getRuntimeConfig('VITE_PRIVY_APP_ID');
  const needsHttps = !!privyAppId && !canUseEmbeddedWallet();

  useEffect(() => {
    if (needsHttps && !isHttpsOrLocalhost()) {
      const httpsUrl = window.location.href.replace(/^http:/, 'https:');
      window.location.replace(httpsUrl);
    }
  }, [needsHttps]);

  return null;
};
