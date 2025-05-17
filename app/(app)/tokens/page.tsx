'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
	DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Plus,
	ArrowRight,
	Copy,
	Check,
	X,
	Info,
	RefreshCcw,
	Search,
	Coins,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import Loading from '@/components/Loading';
import formatTokenAmount from '@/lib/formatNumberToString';
import uploadImage from '@/lib/uploadImage';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Token type definition
interface Token {
	_id: string;
	name: string;
	symbol: string;
	contractAddress: string;
	network: string;
	decimals: number;
	totalSupply: number;
	imageUrl: string;
	description: string;
	isVerified: boolean;
	isListed: boolean;
	createdAt: string;
}

// Form schema for token creation
const tokenFormSchema = z.object({
	name: z.string().min(2, { message: 'Token name is required' }),
	symbol: z.string().min(1, { message: 'Token symbol is required' }).max(10),
	network: z.string().min(1, { message: 'Please select a network' }),
	decimals: z.coerce.number().int().min(0).max(18),
	totalSupply: z.coerce.number().positive(),
	imageUrl: z
		.string()
		.url({ message: 'Please enter a valid URL' })
		.or(z.literal('')),
	description: z.string().max(512),
});

export default function TokensPage() {
	const [tokens, setTokens] = useState<Token[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [activeFilter, setActiveFilter] = useState('all');
	const [isCreating, setIsCreating] = useState(false);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const router = useRouter();

	const form = useForm<z.infer<typeof tokenFormSchema>>({
		resolver: zodResolver(tokenFormSchema),
		defaultValues: {
			name: '',
			symbol: '',
			network: '',
			decimals: 2,
			totalSupply: 1_000_000_000,
			imageUrl: '',
			description: '',
		},
	});

	useEffect(() => {
		fetchTokens();
	}, []);

	const fetchTokens = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get('/tokens/me');
			setTokens(response.data.data);
			console.log('Fetched tokens:', response.data.data);
		} catch (error) {
			console.error('Error fetching tokens:', error);
			toast.error('Failed to fetch tokens');
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (values: z.infer<typeof tokenFormSchema>) => {
		try {
			setIsCreating(true);
			const response = await axios.post('/tokens', values);
			setTokens([...tokens, response.data.data]);
			toast.success('Token created successfully');
			setIsDialogOpen(false);
			form.reset();
		} catch (error) {
			console.error('Error creating token:', error);
			toast.error('Failed to create token');
		}
	};

	const truncateAddress = (address: string) => {
		if (!address) return '';
		return `${address.substring(0, 6)}...${address.substring(
			address.length - 4
		)}`;
	};

	const formatSupply = (supply: number, decimals: number) => {
		return (supply / Math.pow(10, decimals)).toLocaleString();
	};

	const getNetworkColor = (network: string) => {
		switch (network.toLowerCase()) {
			case 'ethereum':
				return 'bg-blue-100 text-blue-800';
			// case 'binance':
			// 	return 'bg-yellow-100 text-yellow-800';
			case 'solana':
				return 'bg-purple-100 text-purple-800';
			// case 'polygon':
			// 	return 'bg-pink-100 text-pink-800';
			// case 'avalanche':
			// 	return 'bg-red-100 text-red-800';
			case 'sui':
				return 'bg-sky-100 text-sky-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const filteredTokens = tokens.filter((token) => {
		// First apply search filter
		const matchesSearch =
			token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
			token.contractAddress.toLowerCase().includes(searchQuery.toLowerCase());

		// Then apply tab filter
		if (activeFilter === 'verified') {
			return matchesSearch && token.isVerified;
		} else if (activeFilter === 'listed') {
			return matchesSearch && token.isListed;
		}
		return matchesSearch;
	});

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (event.target.files && event.target.files[0]) {
			const file = event.target.files[0];

			// First show preview immediately
			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target?.result) {
					setImagePreview(e.target.result as string);
				}
			};
			reader.readAsDataURL(file);

			// Then upload to cloudinary
			setIsUploading(true);
			try {
				const data = await uploadImage(file);
				// Set the secure URL from cloudinary to the form
				form.setValue('imageUrl', data.secure_url);
				toast.success('Token logo uploaded successfully');
			} catch (error) {
				console.error('Error uploading image:', error);
				toast.error('Failed to upload token logo');
			} finally {
				setIsUploading(false);
			}
		}
	};

	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className='container mx-auto p-6'>
			<div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-8'>
				<div>
					<h1 className='text-3xl font-bold'>Token Manager</h1>
					<p className='text-gray-500'>
						Manage your tokens and track their performance
					</p>
				</div>

				<div className='mt-4 md:mt-0'>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button className='gap-2'>
								<Plus size={18} />
								<span>Create Token</span>
							</Button>
						</DialogTrigger>
						<DialogContent className='sm:max-w-[600px]'>
							<DialogHeader>
								<DialogTitle>Create New Token</DialogTitle>
								<DialogDescription>
									Add details about your token to create a new entry
								</DialogDescription>
							</DialogHeader>

							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className='space-y-6 py-4'
								>
									<div className='grid grid-cols-2 gap-4'>
										<FormField
											control={form.control}
											name='name'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Token Name</FormLabel>
													<FormControl>
														<Input placeholder='Super Page Token' {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name='symbol'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Symbol</FormLabel>
													<FormControl>
														<Input placeholder='SPT' {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<div className='grid grid-cols-3 gap-4'>
										<FormField
											control={form.control}
											name='network'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Network</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder='Select network' />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value='ethereum'>Ethereum</SelectItem>
															<SelectItem value='solana'>Solana</SelectItem>
															<SelectItem value='sui'>Sui</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='decimals'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Decimals</FormLabel>
													<FormControl>
														<Input type='number' {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='totalSupply'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Total Supply</FormLabel>
													<FormControl>
														<Input type='number' {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name='imageUrl'
										render={({ field }) => (
											<FormItem>
												<FormLabel>Token Logo</FormLabel>
												<FormControl>
													<div className='space-y-3'>
														{/* Image preview */}
														{(imagePreview || field.value) && (
															<div className='flex items-center gap-2'>
																<Avatar className='h-16 w-16 rounded-md'>
																	<AvatarImage
																		src={imagePreview || field.value}
																		alt='Token logo preview'
																		className='object-cover'
																	/>
																	<AvatarFallback className='rounded-md bg-primary/10 text-lg'>
																		{form
																			.watch('symbol')
																			.substring(0, 2)
																			.toUpperCase() || 'TK'}
																	</AvatarFallback>
																</Avatar>

																<Button
																	type='button'
																	variant='destructive'
																	size='sm'
																	onClick={() => {
																		field.onChange('');
																		setImagePreview(null);
																	}}
																>
																	<X size={16} className='mr-1' /> Remove
																</Button>
															</div>
														)}

														{/* File input and URL option */}
														<div className='flex gap-2'>
															<div className='relative flex-1'>
																<Input
																	type='file'
																	accept='image/*'
																	onChange={handleImageUpload}
																	disabled={isUploading}
																	className='cursor-pointer'
																/>
																{isUploading && (
																	<div className='absolute right-2 top-1/2 transform -translate-y-1/2'>
																		<div className='animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full'></div>
																	</div>
																)}
															</div>

															<Button
																type='button'
																variant='outline'
																onClick={() => {
																	const url = prompt('Or enter an image URL:');
																	if (url) {
																		field.onChange(url);
																		setImagePreview(url);
																	}
																}}
																disabled={isUploading}
															>
																Use URL
															</Button>
														</div>
														<p className='text-xs text-muted-foreground'>
															Upload a logo for your token (recommended:
															256×256px)
														</p>
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={form.control}
										name='description'
										render={({ field }) => (
											<FormItem>
												<FormLabel>Description</FormLabel>
												<FormControl>
													<Textarea
														placeholder='Enter token description...'
														className='resize-none h-20'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<DialogFooter>
										<Button
											type='button'
											variant='outline'
											onClick={() => setIsDialogOpen(false)}
										>
											Cancel
										</Button>
										<Button type='submit' disabled={isCreating}>
											{!isCreating ? 'Create Token' : 'Creating...'}
										</Button>
									</DialogFooter>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Search and filters */}
			<div className='flex flex-col md:flex-row gap-4 mb-6'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
					<Input
						placeholder='Search tokens by name, symbol or address...'
						className='pl-10'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<Button
					variant='outline'
					size='icon'
					onClick={fetchTokens}
					title='Refresh tokens'
				>
					<RefreshCcw size={16} />
				</Button>
			</div>

			{/* Token lists */}
			<Tabs defaultValue='all' onValueChange={setActiveFilter}>
				<TabsList className='mb-6'>
					<TabsTrigger value='all'>All Tokens</TabsTrigger>
					<TabsTrigger value='verified'>Verified</TabsTrigger>
					<TabsTrigger value='listed'>Listed</TabsTrigger>
				</TabsList>

				<TabsContent value='all' className='mt-0'>
					{tokens.length === 0 ? (
						<div className='text-center py-12 border rounded-lg bg-gray-50'>
							<Coins className='mx-auto h-12 w-12 text-gray-400' />
							<h3 className='mt-4 text-lg font-medium text-gray-900'>
								No tokens yet
							</h3>
							<p className='mt-2 text-gray-500'>
								Get started by creating your first token.
							</p>
							<Button
								onClick={() => setIsDialogOpen(true)}
								className='mt-6 gap-2'
							>
								<Plus size={18} />
								Create token
							</Button>
						</div>
					) : (
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{filteredTokens.map((token) => (
								<Card key={token._id} className='overflow-hidden'>
									<CardHeader className='pb-2'>
										<div className='flex justify-between items-start'>
											<div className='flex items-center gap-3'>
												{token.imageUrl ? (
													<img
														src={token.imageUrl}
														alt={token.name}
														className='h-10 w-10 rounded-full object-cover'
													/>
												) : (
													<div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
														<span className='text-primary font-semibold'>
															{token.symbol.substring(0, 2).toUpperCase()}
														</span>
													</div>
												)}
												<div>
													<CardTitle className='text-lg'>
														{token.name}
													</CardTitle>
													<div className='flex items-center gap-2 mt-1'>
														<span className='text-sm font-medium text-gray-500'>
															${token.symbol}
														</span>
														<Badge
															variant='outline'
															className={getNetworkColor(token.network)}
														>
															{token.network}
														</Badge>
													</div>
												</div>
											</div>
											<div className='flex'>
												{token.isVerified && (
													<Badge variant='secondary' className='mr-1'>
														<Check size={12} className='mr-1' /> Verified
													</Badge>
												)}
												{token.isListed && <Badge>Listed</Badge>}
											</div>
										</div>
									</CardHeader>
									<CardContent className='pb-2'>
										<div className='mt-2 space-y-2'>
											<div className='flex justify-between'>
												<div>
													<div className='text-xs text-gray-500 mb-0.5'>
														Total Supply
													</div>
													<div className='text-sm font-medium'>
														{formatTokenAmount(token.totalSupply)}
													</div>
												</div>
												<div>
													<div className='text-xs text-gray-500 mb-0.5'>
														Decimals
													</div>
													<div className='text-sm font-medium'>
														{token.decimals}
													</div>
												</div>
											</div>
											{token.description && (
												<div>
													<div className='text-xs text-gray-500 mb-0.5'>
														Description
													</div>
													<p className='text-sm line-clamp-2'>
														{token.description}
													</p>
												</div>
											)}
											<div>
												<div className='text-xs text-gray-500 mb-0.5'>
													Contract Address
												</div>
												<p className='text-sm line-clamp-2'>
													<a
														href={`https://solscan.io/token/${token.contractAddress}?cluster=devnet`}
														target='_blank'
														rel='noopener noreferrer'
														className='text-blue-500 hover:underline'
													>
														{truncateAddress(token.contractAddress)}
													</a>
												</p>
											</div>
										</div>
									</CardContent>
									<CardFooter className='pt-4'>
										<Button
											variant='outline'
											size='sm'
											className='w-full flex gap-2'
											onClick={() => router.push(`/tokens/${token._id}`)}
										>
											View Details
											<ArrowRight size={14} />
										</Button>
									</CardFooter>
								</Card>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value='verified' className='mt-0'>
					{filteredTokens.length === 0 && (
						<div className='text-center py-12 border rounded-lg bg-gray-50'>
							<Info className='mx-auto h-12 w-12 text-gray-400' />
							<h3 className='mt-4 text-lg font-medium text-gray-900'>
								No verified tokens
							</h3>
							<p className='mt-2 text-gray-500'>
								Verified tokens will appear here.
							</p>
						</div>
					)}
				</TabsContent>

				<TabsContent value='listed' className='mt-0'>
					{filteredTokens.length === 0 && (
						<div className='text-center py-12 border rounded-lg bg-gray-50'>
							<Info className='mx-auto h-12 w-12 text-gray-400' />
							<h3 className='mt-4 text-lg font-medium text-gray-900'>
								No listed tokens
							</h3>
							<p className='mt-2 text-gray-500'>
								Listed tokens will appear here.
							</p>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
