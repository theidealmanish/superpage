'use client';

import {
	createNetworkConfig,
	SuiClientProvider,
	WalletProvider,
} from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Geist, Geist_Mono } from 'next/font/google';
import '@mysten/dapp-kit/dist/index.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

// Config options for the networks you want to connect to
const { networkConfig } = createNetworkConfig({
	localnet: { url: getFullnodeUrl('testnet') },
	mainnet: { url: getFullnodeUrl('mainnet') },
});
const queryClient = new QueryClient();

export default function App({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<SuiClientProvider networks={networkConfig} defaultNetwork='localnet'>
				<WalletProvider
					walletFilter={(wallet) => wallet.name == 'Sui Wallet'}
					autoConnect
				>
					<html lang='en'>
						<body
							className={`${geistSans.variable} ${geistMono.variable} antialiased`}
						>
							{children}
						</body>
					</html>
				</WalletProvider>
			</SuiClientProvider>
		</QueryClientProvider>
	);
}
