'use client';

import { WsProvider, ApiPromise } from '@polkadot/api';
import { useEffect, useState } from 'react';
import {
	web3Accounts,
	web3Enable,
	web3FromAddress,
} from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function PaymentPage() {
	const [api, setApi] = useState<ApiPromise | null>(null);
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [selectedAccount, setSelectedAccount] =
		useState<InjectedAccountWithMeta | null>(null);
	const [isClient, setIsClient] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);

	// This effect runs once on component mount
	useEffect(() => {
		setIsClient(true); // Indicate that we're now on the client side
	}, []);

	const handleConnection = async () => {
		try {
			setIsLoading(true);
			setConnectionError(null);

			const extensions = await web3Enable('SuperPage');

			if (extensions.length === 0) {
				setConnectionError(
					'No Polkadot extension found. Please install the extension and try again.'
				);
				return;
			}

			const allAccounts = await web3Accounts();
			setAccounts(allAccounts);

			if (allAccounts.length > 0) {
				setSelectedAccount(allAccounts[0]);
			}
		} catch (error) {
			console.error('Failed to connect:', error);
			setConnectionError(
				'Failed to connect to the Polkadot extension. Please try again.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	const setup = async () => {
		try {
			const provider = new WsProvider('wss://pas-rpc.stakeworld.io');
			const api = await ApiPromise.create({ provider });
			setApi(api);

			// Retrieve the chain & node information via rpc calls
			const [chain, nodeName, nodeVersion] = await Promise.all([
				api.rpc.system.chain(),
				api.rpc.system.name(),
				api.rpc.system.version(),
			]);

			console.log(
				`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
			);
		} catch (error) {
			console.error('Failed to connect to Polkadot network:', error);
		}
	};

	// Only run setup after we confirm we're on the client
	useEffect(() => {
		if (isClient) {
			setup();
		}
	}, [isClient]);

	useEffect(() => {
		if (!api || !isClient) return;

		(async () => {
			try {
				const time = await api.query.timestamp.now();
				console.log('Current blockchain time:', time.toPrimitive());
			} catch (error) {
				console.error('Error fetching timestamp:', error);
			}
		})();
	}, [api, isClient]);

	// Display a minimal UI while rendering on server
	if (!isClient) {
		return (
			<div className='container mx-auto mt-20 p-6 flex items-center justify-center min-h-screen'>
				<Card className='w-full max-w-md'>
					<CardHeader>
						<CardTitle>Payment</CardTitle>
						<CardDescription>Loading payment interface...</CardDescription>
					</CardHeader>
					<CardContent className='flex justify-center py-6'>
						<Loader2 className='h-8 w-8 animate-spin text-primary' />
					</CardContent>
				</Card>
			</div>
		);
	}

	// create a function to send the fund to another account
	const handlePayment = async () => {
		if (!selectedAccount) return;
		if (!api) return;

		const injector = await web3FromAddress(selectedAccount.address);

		const unsub = await api.tx.balances
			.transferAllowDeath(
				'1ZcadMuo1X7NWdNCk8vXZccqzKtoBKjQ4CFVNvpVbu1QPs2',
				100000000000
			)
			.signAndSend(
				selectedAccount.address,
				{ signer: injector.signer },
				(result) => {
					console.log(`Current status is ${result.status}`);

					if (result.status.isInBlock) {
						console.log(
							`Transaction included at blockHash ${result.status.asInBlock}`
						);
					} else if (result.status.isFinalized) {
						console.log(
							`Transaction finalized at blockHash ${result.status.asFinalized}`
						);
						unsub();
					}
				}
			);
	};

	return (
		<div className='container mx-auto mt-20 p-6'>
			<Card className='w-full max-w-md mx-auto'>
				<CardHeader>
					<CardTitle>Polkadot Payment</CardTitle>
					<CardDescription>
						Connect to your Polkadot wallet to make a payment
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					{!accounts.length ? (
						<Button
							onClick={handleConnection}
							disabled={isLoading}
							className='w-full'
						>
							{isLoading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Connecting...
								</>
							) : (
								'Connect Wallet'
							)}
						</Button>
					) : (
						<>
							<div className='bg-gray-50 p-3 rounded-md'>
								<h3 className='font-medium text-sm text-gray-600 mb-2'>
									Selected Account
								</h3>
								<div className='bg-white border rounded-md p-3'>
									<p className='font-medium'>{selectedAccount?.meta.name}</p>
									<p className='text-xs text-gray-500 break-all mt-1'>
										{selectedAccount?.address}
									</p>
								</div>
							</div>

							<div>
								<h3 className='font-medium text-sm text-gray-600 mb-2'>
									Available Accounts
								</h3>
								<div className='bg-gray-50 rounded-md p-2 max-h-40 overflow-y-auto'>
									<ul className='space-y-1'>
										{accounts.map((account) => (
											<li key={account.address}>
												<Button
													variant={
														selectedAccount?.address === account.address
															? 'default'
															: 'ghost'
													}
													onClick={() => setSelectedAccount(account)}
													className='w-full justify-start text-left'
												>
													{account.meta.name}
												</Button>
											</li>
										))}
									</ul>
								</div>
							</div>

							<Button onClick={handlePayment} className='w-full mt-4'>
								Proceed to Payment
							</Button>
						</>
					)}

					{connectionError && (
						<div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
							{connectionError}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
