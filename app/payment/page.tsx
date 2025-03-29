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
	CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	Loader2,
	AlertCircle,
	CheckCircle2,
	Copy,
	ExternalLink,
	ChevronDown,
} from 'lucide-react';
import { formatBalance } from '@polkadot/util';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type TransactionStatus = 'idle' | 'preparing' | 'pending' | 'success' | 'error';

interface TransactionState {
	status: TransactionStatus;
	message: string;
	hash?: string;
	blockHash?: string;
	timestamp?: number;
}

export default function PaymentPage() {
	const [api, setApi] = useState<ApiPromise | null>(null);
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [selectedAccount, setSelectedAccount] =
		useState<InjectedAccountWithMeta | null>(null);
	const [isClient, setIsClient] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [connectionError, setConnectionError] = useState<string | null>(null);
	const [recipient, setRecipient] = useState('');
	const [amount, setAmount] = useState('0.1');
	const [txnState, setTxnState] = useState<TransactionState>({
		status: 'idle',
		message: '',
	});
	const [hashCopied, setHashCopied] = useState(false);

	// get the recipient address from the recipient input
	const [recipientAddress, setRecipientAddress] = useState('');
	const [isRecipientValid, setIsRecipientValid] = useState(false);

	// Function to validate the recipient address
	const getRecipientAddress = (username: string) => {};

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
			setConnectionError(
				'Failed to connect to Polkadot network. Please try again later.'
			);
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

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setHashCopied(true);
		setTimeout(() => setHashCopied(false), 2000);
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		// Allow only numbers and decimals
		const value = e.target.value.replace(/[^0-9.]/g, '');
		setAmount(value);
	};

	// create a function to send the fund to another account
	const handlePayment = async () => {
		if (!selectedAccount) {
			setTxnState({
				status: 'error',
				message: 'No account selected. Please connect your wallet first.',
			});
			return;
		}

		if (!api) {
			setTxnState({
				status: 'error',
				message: 'API not connected. Please refresh the page and try again.',
			});
			return;
		}

		try {
			setTxnState({
				status: 'preparing',
				message: 'Preparing your transaction...',
			});

			// Convert the amount from DOT to Planck
			// For Polkadot, 1 DOT = 10^10 Planck
			const amountInPlanck = BigInt(parseFloat(amount) * 10000000000);

			const injector = await web3FromAddress(selectedAccount.address);

			setTxnState({
				status: 'pending',
				message:
					'Transaction pending. Please sign the transaction in your wallet extension.',
			});

			const unsub = await api.tx.balances
				.transferKeepAlive(recipient, amountInPlanck)
				.signAndSend(
					selectedAccount.address,
					{ signer: injector.signer },
					(result) => {
						console.log(`Current status is ${result.status}`);

						if (result.status.isInBlock) {
							const blockHash = result.status.asInBlock.toString();
							setTxnState({
								status: 'pending',
								message: `Transaction included in block ${blockHash.slice(
									0,
									10
								)}...`,
								hash: result.txHash.toString(),
								blockHash: blockHash,
							});
						} else if (result.status.isFinalized) {
							const finalizedHash = result.status.asFinalized.toString();
							setTxnState({
								status: 'success',
								message: 'Transaction successful!',
								hash: result.txHash.toString(),
								blockHash: finalizedHash,
								timestamp: Date.now(),
							});
							unsub();
						} else if (result.isError) {
							setTxnState({
								status: 'error',
								message: `Transaction failed: ${
									result.dispatchError?.toString() || 'Unknown error'
								}`,
							});
							unsub();
						}
					}
				);
		} catch (error: any) {
			console.error('Payment failed:', error);
			setTxnState({
				status: 'error',
				message: `Error: ${error.message || 'Unknown error occurred'}`,
			});
		}
	};

	// Reset transaction state
	const resetTransaction = () => {
		setTxnState({
			status: 'idle',
			message: '',
		});
	};

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

	return (
		<div className='container mx-auto mt-20 p-4'>
			<Card className='w-full max-w-md mx-auto gap-2 py-4'>
				<CardHeader>
					<CardTitle className='text-xl flex items-center justify-center font-semibold'>
						<div>
							<span className='mr-2'>💸</span>SuperPay
						</div>
					</CardTitle>
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

							{accounts.length > 1 && (
								<div>
									<Label htmlFor='account-select'>Choose Account</Label>
									<Select
										value={selectedAccount?.address}
										onValueChange={(value) => {
											const account = accounts.find(
												(acc) => acc.address === value
											);
											if (account) setSelectedAccount(account);
										}}
									>
										<SelectTrigger id='account-select' className='w-full mt-1'>
											<SelectValue placeholder='Select an account' />
										</SelectTrigger>
										<SelectContent>
											{accounts.map((account) => (
												<SelectItem
													key={account.address}
													value={account.address}
												>
													{account.meta.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							<Separator className='my-4' />

							<div className='space-y-4'>
								<div>
									<Label htmlFor='recipient'>Recipient</Label>
									<Input
										id='recipient'
										value={recipient}
										onChange={(e) => setRecipient(e.target.value)}
										className='mt-1 font-mono text-sm'
									/>
								</div>

								<div>
									<Label htmlFor='amount'>Amount (DOT)</Label>
									<Input
										id='amount'
										type='text'
										value={amount}
										onChange={handleAmountChange}
										className='mt-1'
									/>
								</div>
							</div>

							{/* Show transaction status */}
							{txnState.status !== 'idle' && (
								<Alert
									className={
										txnState.status === 'success'
											? 'bg-green-50 border-green-200'
											: txnState.status === 'error'
											? 'bg-red-50 border-red-200'
											: 'bg-blue-50 border-blue-200'
									}
								>
									<AlertTitle className='flex items-center'>
										<div>
											{txnState.status === 'pending' ||
											txnState.status === 'preparing' ? (
												<Loader2 className='h-4 w-4 text-blue-600 mr-2 animate-spin' />
											) : txnState.status === 'success' ? (
												<CheckCircle2 className='h-4 w-4 text-green-600 mr-2' />
											) : (
												<AlertCircle className='h-4 w-4 text-red-600 mr-2' />
											)}
										</div>

										<div className='text-sm font-medium'>
											{txnState.status === 'success'
												? 'Payment Successful'
												: txnState.status === 'error'
												? 'Payment Failed'
												: 'Processing Payment'}
										</div>
									</AlertTitle>
									<AlertDescription className='text-xs'>
										{txnState.hash && (
											<div className='mt-2 p-2 bg-white/50 rounded-md border w-full'>
												<div className='flex items-center justify-between w-full'>
													<span className='text-xs font-medium truncate pr-2'>
														Transaction Hash:
													</span>
													<Button
														variant='ghost'
														size='sm'
														className='h-6 p-0 px-2 flex-shrink-0'
														onClick={() => copyToClipboard(txnState.hash!)}
													>
														{hashCopied ? (
															<CheckCircle2 className='h-3 w-3 text-green-500' />
														) : (
															<Copy className='h-3 w-3' />
														)}
													</Button>
												</div>
												<div className='mt-1 w-full bg-white/70 p-1.5 rounded overflow-x-auto'>
													<code className='text-xs break-all block w-full'>
														{txnState.hash}
													</code>
												</div>
											</div>
										)}
									</AlertDescription>

									{txnState.status === 'success' && (
										<div className='mt-3'>
											<Button
												variant='outline'
												size='sm'
												className='text-xs h-7'
												onClick={() =>
													window.open(
														`https://polkadot.subscan.io/extrinsic/${txnState.hash}`,
														'_blank'
													)
												}
											>
												View on Subscan
												<ExternalLink className='ml-1 h-3 w-3' />
											</Button>
										</div>
									)}
								</Alert>
							)}

							{txnState.status === 'success' ? (
								<Button onClick={resetTransaction} className='w-full mt-4'>
									Make Another Payment
								</Button>
							) : (
								<Button
									onClick={handlePayment}
									className='w-full mt-4'
									disabled={
										txnState.status === 'pending' ||
										txnState.status === 'preparing'
									}
								>
									{txnState.status === 'pending' ||
									txnState.status === 'preparing' ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Processing...
										</>
									) : (
										'Proceed to Payment'
									)}
								</Button>
							)}
						</>
					)}

					{connectionError && (
						<Alert variant='destructive'>
							<AlertCircle className='h-4 w-4' />
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{connectionError}</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
