import { useState, useEffect, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import {
	TransactionState,
	sendPayment,
	setupApiConnection,
} from '@/payment/polkadot';

export function usePolkadotPayment(appName: string = 'SuperPage') {
	const [api, setApi] = useState<ApiPromise | null>(null);
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [selectedAccount, setSelectedAccount] =
		useState<InjectedAccountWithMeta | null>(null);
	const [isClient, setIsClient] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const [txnState, setTxnState] = useState<TransactionState>({
		status: 'idle',
		message: '',
	});

	// Set client-side flag
	useEffect(() => {
		setIsClient(true);
	}, []);

	// Initialize API
	useEffect(() => {
		if (!isClient) return;

		const initApi = async () => {
			try {
				const provider = new WsProvider('wss://pas-rpc.stakeworld.io');
				const api = await ApiPromise.create({ provider });
				setApi(api);

				const connectionInfo = await setupApiConnection(api);
				console.log(`Connected to ${connectionInfo.chain}`);
			} catch (error) {
				console.error('Failed to connect to Polkadot network:', error);
				setConnectionError('Failed to connect to Polkadot network');
			}
		};

		initApi();
	}, [isClient]);

	// Connect wallet and get accounts
	const connectWallet = useCallback(async () => {
		if (!isClient) return;

		try {
			setIsLoading(true);
			setConnectionError(null);

			const extensions = await web3Enable(appName);

			if (extensions.length === 0) {
				setConnectionError('No Polkadot extension found');
				return;
			}

			const allAccounts = await web3Accounts();
			setAccounts(allAccounts);

			if (allAccounts.length > 0) {
				setSelectedAccount(allAccounts[0]);
			}
		} catch (error) {
			console.error('Failed to connect wallet:', error);
			setConnectionError('Failed to connect to wallet');
		} finally {
			setIsLoading(false);
		}
	}, [isClient, appName]);

	// Make payment
	const makePayment = useCallback(
		async (recipient: string, amount: string) => {
			if (!api || !selectedAccount) {
				setTxnState({
					status: 'error',
					message: !selectedAccount
						? 'No account selected'
						: 'API not connected',
				});
				return;
			}

			try {
				await sendPayment(api, selectedAccount, recipient, amount, setTxnState);
			} catch (error: any) {
				console.error('Payment failed:', error);
			}
		},
		[api, selectedAccount]
	);

	// Reset transaction
	const resetTransaction = useCallback(() => {
		setTxnState({
			status: 'idle',
			message: '',
		});
	}, []);

	return {
		api,
		accounts,
		selectedAccount,
		setSelectedAccount,
		isClient,
		isLoading,
		connectionError,
		txnState,
		connectWallet,
		makePayment,
		resetTransaction,
	};
}
