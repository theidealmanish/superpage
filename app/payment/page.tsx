'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	Loader2,
	AlertCircle,
	CheckCircle2,
	Copy,
	ExternalLink,
} from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePolkadotPayment } from '@/hooks/usePolkadotPayment';

export default function PaymentPage() {
	const [recipient, setRecipient] = useState(
		'1ZcadMuo1X7NWdNCk8vXZccqzKtoBKjQ4CFVNvpVbu1QPs2'
	);
	const [amount, setAmount] = useState('0.1');
	const [hashCopied, setHashCopied] = useState(false);

	const {
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
	} = usePolkadotPayment('SuperPay');

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setHashCopied(true);
		setTimeout(() => setHashCopied(false), 2000);
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/[^0-9.]/g, '');
		setAmount(value);
	};

	// Simple loading UI for SSR
	if (!isClient) {
		return (
			<div className='container mx-auto mt-20 p-6 flex items-center justify-center min-h-screen'>
				<Card className='w-full max-w-md'>
					<CardHeader>
						<CardTitle>Payment</CardTitle>
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
							onClick={connectWallet}
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
							{/* Account display and selection UI */}
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

							{/* Payment form */}
							<div className='space-y-4'>
								<div>
									<Label htmlFor='recipient'>Recipient Address</Label>
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

							{/* Transaction status display */}
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
										{txnState.message}
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

							{/* Action buttons */}
							{txnState.status === 'success' ? (
								<Button onClick={resetTransaction} className='w-full mt-2'>
									Make Another Payment
								</Button>
							) : (
								<Button
									onClick={() => makePayment(recipient, amount)}
									className='w-full mt-2'
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
