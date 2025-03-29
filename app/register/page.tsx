'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	Eye,
	EyeOff,
	Wallet,
	ArrowRight,
	ChevronDown,
	Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { register } from '@/api/auth';
import { ethers } from 'ethers';

// For Polkadot integration
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

// Form validation schema matching the User interface
const signUpSchema = z.object({
	name: z
		.string()
		.min(2, { message: 'Name must be at least 2 characters' })
		.max(100, { message: 'Name must be less than 100 characters' }),
	username: z
		.string()
		.min(3, { message: 'Username must be at least 3 characters' })
		.max(30, { message: 'Username must be less than 30 characters' })
		.regex(/^[a-zA-Z0-9_]+$/, {
			message: 'Username can only contain letters, numbers and underscores',
		}),
	email: z.string().email({ message: 'Please enter a valid email address' }),
	password: z
		.string()
		.min(8, { message: 'Password must be at least 8 characters' })
		.max(100, { message: 'Password must be less than 100 characters' }),
	walletAddress: z.string(),
});

export default function SignUpPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Wallet states
	const [isWalletLoading, setIsWalletLoading] = useState(false);
	const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
	const [walletType, setWalletType] = useState<'ethereum' | 'polkadot'>(
		'ethereum'
	);

	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: '',
			username: '',
			email: '',
			password: '',
			walletAddress: '',
		},
	});

	async function onSubmit(values: z.infer<typeof signUpSchema>) {
		setIsLoading(true);
		setError(null);

		register({
			name: values.name,
			username: values.username,
			email: values.email,
			password: values.password,
			walletAddress: values.walletAddress,
		})
			.then((res) => {
				console.log(res.data);
				router.push('/dashboard');
			})
			.catch((err) => {
				console.error(err.response?.data?.message || 'Failed to register');
				setError(err.response?.data?.message || 'Failed to register');
			})
			.finally(() => {
				setIsLoading(false);
			});
	}

	// Connect to Ethereum wallet (MetaMask)
	async function connectEthereumWallet() {
		setIsWalletLoading(true);
		setWalletType('ethereum');

		try {
			// @ts-ignore
			const ethereum = window.ethereum;

			if (ethereum) {
				try {
					// Request account access
					const accounts = await ethereum.request({
						method: 'eth_requestAccounts',
					});

					if (accounts && accounts.length > 0) {
						form.setValue('walletAddress', accounts[0]);
					}
				} catch (error) {
					console.error('Error connecting to MetaMask', error);
					setError('Failed to connect to MetaMask. Please try again.');
				}
			} else {
				setError('Please install MetaMask to connect your Ethereum wallet');
			}
		} finally {
			setIsWalletLoading(false);
		}
	}

	// Connect to Polkadot wallet
	async function connectPolkadotWallet() {
		setIsWalletLoading(true);
		setWalletType('polkadot');

		try {
			// Enable the Polkadot extension
			const extensions = await web3Enable('SuperPage Signup');

			if (extensions.length === 0) {
				setError(
					'No Polkadot extension found. Please install the extension and try again.'
				);
				return;
			}

			// Get all accounts from the extension
			const polkadotAccounts = await web3Accounts();
			setAccounts(polkadotAccounts);

			if (polkadotAccounts.length > 0) {
				// Set the first account as default
				form.setValue('walletAddress', polkadotAccounts[0].address);
			} else {
				setError('No accounts found in your Polkadot extension');
			}
		} catch (error) {
			console.error('Error connecting to Polkadot extension', error);
			setError('Failed to connect to Polkadot extension. Please try again.');
		} finally {
			setIsWalletLoading(false);
		}
	}

	// Get a shortened address for display
	const shortenAddress = (address: string) => {
		if (!address) return '';
		return `${address.substring(0, 6)}...${address.substring(
			address.length - 4
		)}`;
	};

	// Select a specific account from the dropdown
	const selectAccount = (account: InjectedAccountWithMeta) => {
		form.setValue('walletAddress', account.address);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<Card className='w-full max-w-xl'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-center'>
						Create your account
					</CardTitle>
					<CardDescription className='text-center'>
						Enter your information to get started with SuperPage
					</CardDescription>
				</CardHeader>

				<CardContent>
					{error && (
						<Alert variant='destructive' className='mb-6'>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
							<FormField
								control={form.control}
								name='name'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Full Name</FormLabel>
										<FormControl>
											<Input
												placeholder='John Doe'
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='username'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input
												placeholder='johndoe'
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormDescription className='text-xs'>
											Your unique username for SuperPage
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='email'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input
												type='email'
												placeholder='name@example.com'
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<div className='relative'>
											<FormControl>
												<Input
													type={showPassword ? 'text' : 'password'}
													placeholder='••••••••'
													{...field}
													disabled={isLoading}
												/>
											</FormControl>
											<Button
												type='button'
												variant='ghost'
												size='sm'
												className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
												onClick={() => setShowPassword(!showPassword)}
												disabled={isLoading}
											>
												{showPassword ? (
													<EyeOff className='h-4 w-4 text-gray-400' />
												) : (
													<Eye className='h-4 w-4 text-gray-400' />
												)}
											</Button>
										</div>
										<FormDescription className='text-xs'>
											Must be at least 8 characters
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='walletAddress'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Wallet Address</FormLabel>
										<div className='space-y-3'>
											<div className='flex space-x-2'>
												<FormControl>
													<Input
														placeholder={
															walletType === 'ethereum' ? '0x...' : '5...'
														}
														{...field}
														disabled={isLoading}
														className='flex-1'
													/>
												</FormControl>

												<div className='flex space-x-2'>
													{/* Wallet Connect Button with Options */}
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant='outline'
																disabled={isLoading || isWalletLoading}
																className='flex items-center gap-1'
															>
																{isWalletLoading ? (
																	<Loader2 className='h-4 w-4 animate-spin' />
																) : (
																	<Wallet className='h-4 w-4' />
																)}
																Connect
																<ChevronDown className='h-3 w-3 ml-1 opacity-70' />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align='end'>
															<DropdownMenuItem onClick={connectEthereumWallet}>
																Connect Ethereum Wallet
															</DropdownMenuItem>
															<DropdownMenuItem onClick={connectPolkadotWallet}>
																Connect Polkadot Wallet
															</DropdownMenuItem>
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</div>

											{/* Account selector for Polkadot */}
											{walletType === 'polkadot' && accounts.length > 0 && (
												<div className='border rounded-md overflow-hidden divide-y'>
													<div className='p-3 bg-muted/50'>
														<h4 className='text-sm font-medium'>
															Select Account
														</h4>
													</div>
													<div className='max-h-40 overflow-y-auto'>
														{accounts.map((account, index) => (
															<button
																key={account.address}
																type='button'
																onClick={() => selectAccount(account)}
																className={`w-full text-left p-2.5 flex items-center hover:bg-muted transition-colors ${
																	field.value === account.address
																		? 'bg-muted/70'
																		: ''
																}`}
															>
																<div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3 text-xs font-medium text-primary'>
																	{index + 1}
																</div>
																<div>
																	<p className='font-medium text-sm'>
																		{account.meta.name ||
																			'Account ' + (index + 1)}
																	</p>
																	<p className='text-xs text-muted-foreground truncate max-w-[220px]'>
																		{shortenAddress(account.address)}
																	</p>
																</div>
																{field.value === account.address && (
																	<div className='ml-auto w-4 h-4 rounded-full bg-primary flex items-center justify-center'>
																		<span className='text-white text-[10px]'>
																			✓
																		</span>
																	</div>
																)}
															</button>
														))}
													</div>
												</div>
											)}
										</div>
										<FormDescription className='text-xs'>
											{walletType === 'ethereum'
												? 'Your Ethereum wallet address for transactions'
												: 'Your Polkadot wallet address for transactions'}
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button type='submit' className='w-full' disabled={isLoading}>
								{isLoading ? (
									<span className='flex items-center'>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Creating account...
									</span>
								) : (
									<>
										Create Account
										<ArrowRight className='ml-2 h-4 w-4' />
									</>
								)}
							</Button>
						</form>
					</Form>
				</CardContent>

				<CardFooter className='flex flex-col items-center space-y-4 border-t pt-6'>
					<div className='text-sm text-gray-600 text-center'>
						By creating an account, you agree to our{' '}
						<Link
							href='/terms'
							className='underline text-primary hover:text-primary/80'
						>
							Terms of Service
						</Link>{' '}
						and{' '}
						<Link
							href='/privacy'
							className='underline text-primary hover:text-primary/80'
						>
							Privacy Policy
						</Link>
						.
					</div>

					<div className='text-sm'>
						Already have an account?{' '}
						<Link
							href='/signin'
							className='text-primary font-medium hover:underline'
						>
							Sign in
						</Link>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
