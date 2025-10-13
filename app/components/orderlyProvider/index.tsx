import { ReactNode, useCallback, lazy, Suspense } from "react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { useOrderlyConfig } from "@/utils/config";
import type { NetworkId } from "@orderly.network/types";
import { LocaleProvider, LocaleCode, LocaleEnum, defaultLanguages } from "@orderly.network/i18n";
import { withBasePath } from "@/utils/base-path";
import { getSEOConfig, getUserLanguage } from "@/utils/seo";
import { getRuntimeConfigBoolean, getRuntimeConfigArray, getRuntimeConfig } from "@/utils/runtime-config";
import { DemoGraduationChecker } from "@/components/DemoGraduationChecker";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const NETWORK_ID_KEY = "orderly_network_id";

const getNetworkId = (): NetworkId => {
	if (typeof window === "undefined") return "mainnet";
	
	const disableMainnet = getRuntimeConfigBoolean('VITE_DISABLE_MAINNET');
	const disableTestnet = getRuntimeConfigBoolean('VITE_DISABLE_TESTNET');
	
	if (disableMainnet && !disableTestnet) {
		return "testnet";
	}
	
	if (disableTestnet && !disableMainnet) {
		return "mainnet";
	}
	
	return (localStorage.getItem(NETWORK_ID_KEY) as NetworkId) || "mainnet";
};

const setNetworkId = (networkId: NetworkId) => {
	if (typeof window !== "undefined") {
		localStorage.setItem(NETWORK_ID_KEY, networkId);
	}
};

const getAvailableLanguages = (): string[] => {
	const languages = getRuntimeConfigArray('VITE_AVAILABLE_LANGUAGES');
	
	return languages.length > 0 ? languages : ['en'];
};

const getDefaultLanguage = (): LocaleCode => {
	const seoConfig = getSEOConfig();
	const userLanguage = getUserLanguage();
	const availableLanguages = getAvailableLanguages();
	
	if (typeof window !== 'undefined') {
		const urlParams = new URLSearchParams(window.location.search);
		const langParam = urlParams.get('lang');
		if (langParam && availableLanguages.includes(langParam)) {
			return langParam as LocaleCode;
		}
	}
	
	if (seoConfig.language && availableLanguages.includes(seoConfig.language)) {
		return seoConfig.language as LocaleCode;
	}
	
	if (availableLanguages.includes(userLanguage)) {
		return userLanguage as LocaleCode;
	}
	
	return (availableLanguages[0] || 'en') as LocaleCode;
};

const PrivyConnector = lazy(() => import("@/components/orderlyProvider/privyConnector"));
const WalletConnector = lazy(() => import("@/components/orderlyProvider/walletConnector"));

const OrderlyProvider = (props: { children: ReactNode }) => {
	const config = useOrderlyConfig();
	const networkId = getNetworkId();
	
	const privyAppId = getRuntimeConfig('VITE_PRIVY_APP_ID');
	const usePrivy = !!privyAppId;

	const parseChainIds = (envVar: string | undefined): Array<{id: number}> | undefined => {
		if (!envVar) return undefined;
		return envVar.split(',')
			.map(id => id.trim())
			.filter(id => id)
			.map(id => ({ id: parseInt(id, 10) }))
			.filter(chain => !isNaN(chain.id));
	};

	const parseDefaultChain = (envVar: string | undefined): { mainnet: { id: number } } | undefined => {
		if (!envVar) return undefined;
		
		const chainId = parseInt(envVar.trim(), 10);
		return !isNaN(chainId) ? { mainnet: { id: chainId } } : undefined;
	};

	const disableMainnet = getRuntimeConfigBoolean('VITE_DISABLE_MAINNET');
	const mainnetChains = disableMainnet ? [] : parseChainIds(getRuntimeConfig('VITE_ORDERLY_MAINNET_CHAINS'));
	const disableTestnet = getRuntimeConfigBoolean('VITE_DISABLE_TESTNET');
	const testnetChains = disableTestnet ? [] : parseChainIds(getRuntimeConfig('VITE_ORDERLY_TESTNET_CHAINS'));

	const chainFilter = (mainnetChains || testnetChains) ? {
		...(mainnetChains && { mainnet: mainnetChains }),
		...(testnetChains && { testnet: testnetChains })
	} : undefined;

	const defaultChain = parseDefaultChain(getRuntimeConfig('VITE_DEFAULT_CHAIN'));

	const onChainChanged = useCallback(
		(_chainId: number, {isTestnet}: {isTestnet: boolean}) => {
			const currentNetworkId = getNetworkId();
			if ((isTestnet && currentNetworkId === 'mainnet') || (!isTestnet && currentNetworkId === 'testnet')) {
				const newNetworkId: NetworkId = isTestnet ? 'testnet' : 'mainnet';
				setNetworkId(newNetworkId);
				
				setTimeout(() => {
					window.location.reload();
				}, 100);
			}
		},
		[]
	);

	const onLanguageChanged = async (lang: LocaleCode) => {
		if (typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			if (lang === LocaleEnum.en) {
				url.searchParams.delete('lang');
			} else {
				url.searchParams.set('lang', lang);
			}
			window.history.replaceState({}, '', url.toString());
		}
	};

	const loadPath = (lang: LocaleCode) => {
		const availableLanguages = getAvailableLanguages();
		
		if (!availableLanguages.includes(lang)) {
			return [];
		}
		
		if (lang === LocaleEnum.en) {
			return withBasePath(`/locales/extend/${lang}.json`);
		}
		return [
			withBasePath(`/locales/${lang}.json`),
			withBasePath(`/locales/extend/${lang}.json`)
		];
	};

	const defaultLanguage = getDefaultLanguage();
	
	const availableLanguages = getAvailableLanguages();
	const filteredLanguages = defaultLanguages.filter(lang => 
		availableLanguages.includes(lang.localCode)
	);

	const appProvider = (
		<OrderlyAppProvider
			brokerId={getRuntimeConfig('VITE_ORDERLY_BROKER_ID')}
			brokerName={getRuntimeConfig('VITE_ORDERLY_BROKER_NAME')}
			networkId={networkId}
			onChainChanged={onChainChanged}
			
			appIcons={config.orderlyAppProvider.appIcons}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			{...(chainFilter && { chainFilter } as any)}
			defaultChain={defaultChain}
		>
			<DemoGraduationChecker />
			{props.children}
		</OrderlyAppProvider>
	);

	const walletConnector = usePrivy
		? <PrivyConnector networkId={networkId}>{appProvider}</PrivyConnector>
		: <WalletConnector networkId={networkId}>{appProvider}</WalletConnector>;

	return (
		<LocaleProvider
			onLanguageChanged={onLanguageChanged}
			backend={{ loadPath }}
			locale={defaultLanguage}
			languages={filteredLanguages}
		>
			<Suspense fallback={<LoadingSpinner />}>
				{walletConnector}
			</Suspense>
		</LocaleProvider>
	);
};

export default OrderlyProvider;
