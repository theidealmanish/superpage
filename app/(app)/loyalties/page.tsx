'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from '@/lib/axios';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Progress } from '@/components/ui/progress';
import {
	Award,
	ArrowUp,
	ArrowDown,
	Coins,
	Users,
	Diamond,
	ChevronDown,
	Loader2,
	Check,
	Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loading from '@/components/Loading';
import formatTokenAmount from '@/lib/formatNumberToString';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Types
interface Creator {
	_id: string;
	name: string;
	username: string;
	avatarUrl: string;
	earnedPoints: number;
	engagements: number;
	token?: {
		_id: string;
		name: string;
		symbol: string;
		imageUrl?: string;
		totalSupply?: number;
		circulatingSupply?: number;
		decimals?: number;
		description?: string;
		contractAddress: string;
	};
}

interface LeaderboardItem {
	rank: number;
	userId: string;
	username: string;
	name: string;
	avatarUrl: string;
	points: number;
	recordCount: number;
	change: 'up' | 'down' | 'same';
}

interface UserTokenInfo {
	tokenBalance: number;
	percentile: number;
	rewardsEarned: number;
	pendingRewards: number;
}

interface LoyaltyStatsResponse {
	creators: Array<{
		creatorId: string;
		creatorName: string;
		creatorUsername: string;
		creatorPhoto?: string;
		totalPoints: number;
		count: number;
		lastEarned: string;
		tokenId?: string;
		tokenName?: string;
		tokenSymbol?: string;
		tokenImage?: string;
		tokenSupply?: number;
		tokenDescription?: string;
		tokenAddress?: string;
	}>;
	overall: {
		totalPoints: number;
		uniqueCreators: number;
		uniqueTokens: number;
		recordCount: number;
		firstEarned?: string;
		lastEarned?: string;
	};
	recentActivity: Array<{
		_id: string;
		user: string;
		creator: {
			_id: string;
			name: string;
			username: string;
			photo?: string;
		};
		token?: {
			_id: string;
			name: string;
			symbol: string;
			imageUrl?: string;
		};
		engagement: {
			_id: string;
			sourceUrl: string;
			engagedTime: number;
		};
		loyaltyPoints: number;
		createdAt: string;
	}>;
}

export default function LoyaltiesPage() {
	// Hooks
	const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile();
	const router = useRouter();

	// State
	const [timeframe, setTimeframe] = useState('weekly');
	const [creators, setCreators] = useState<Creator[]>([]);
	const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
	const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
	const [userTokenInfo, setUserTokenInfo] = useState<UserTokenInfo | null>(
		null
	);
	const [tokenClaimed, setTokenClaimed] = useState('0');
	const [claimTxId, setClaimTxId] = useState<string | null>(null);
	const [isClaiming, setIsClaiming] = useState(false);
	const [isClaimingQR, setIsClaimingQR] = useState(false);
	const [isLoadingCreator, setIsLoadingCreator] = useState(false);
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	const [recentActivity, setRecentActivity] = useState<
		LoyaltyStatsResponse['recentActivity']
	>([]);

	// Get formatted token symbol
	const tokenSymbol = selectedCreator?.token?.symbol || 'TOKEN';
	const formattedTokenSymbol = tokenSymbol.startsWith('$')
		? tokenSymbol
		: `$${tokenSymbol}`;

	// Fetch user loyalty stats on first load
	useEffect(() => {
		fetchUserLoyaltyStats();
	}, []);

	// Fetch leaderboard when selected creator or timeframe changes
	useEffect(() => {
		if (selectedCreator && !isInitialLoad) {
			fetchLeaderboard(selectedCreator._id);
		}
	}, [selectedCreator, timeframe, isInitialLoad]);

	// Fetch user's loyalty stats
	const fetchUserLoyaltyStats = async () => {
		setIsLoadingStats(true);
		try {
			const response = await axios.get('/loyalties/stats/user');
			console.log('User loyalty stats:', response.data);

			if (response.data && response.data.status === 'success') {
				const stats: LoyaltyStatsResponse = response.data.data;
				console.log('LoyaltyStatsResponse:', stats);
				// Map the creators from the stats to our Creator interface
				const mappedCreators: any = stats.creators.map((creator) => ({
					_id: creator.creatorId,
					name: creator.creatorName,
					username: creator.creatorUsername,
					avatarUrl: creator.creatorPhoto || '',
					earnedPoints: creator.totalPoints,
					engagements: creator.count,
					token: creator.tokenId
						? {
								_id: creator.tokenId,
								name: creator.tokenName || 'Token',
								symbol: creator.tokenSymbol || 'TKN',
								imageUrl: creator.tokenImage,
								totalSupply: creator.tokenSupply,
								description: creator.tokenDescription,
								contractAddress: creator.tokenAddress,
						  }
						: undefined,
				}));

				setCreators(mappedCreators);
				console.log(creators);
				setRecentActivity(stats.recentActivity);

				// Select the first creator by default
				if (mappedCreators.length > 0) {
					setSelectedCreator(mappedCreators[0]);

					// Set user token info for the first creator
					const creatorStats = stats.creators[0];
					setUserTokenInfo({
						tokenBalance: creatorStats.totalPoints,
						percentile: Math.min(80, Math.floor(Math.random() * 100)), // Placeholder for percentile
						rewardsEarned: creatorStats.totalPoints,
						pendingRewards: 0,
					});

					// Fetch leaderboard for the first creator
					await fetchLeaderboard(mappedCreators[0]._id);
				}
			}
		} catch (error) {
			console.error('Error fetching user loyalty stats:', error);
			toast.error('Failed to load loyalty statistics');
		} finally {
			setIsLoadingStats(false);
			setIsInitialLoad(false);
		}
	};

	// Fetch the leaderboard data for a specific creator
	const fetchLeaderboard = async (creatorId: string) => {
		setIsLoadingCreator(true);
		try {
			const response = await axios.get(`/loyalties/leaderboard/${creatorId}`, {
				params: { timeframe },
			});

			if (response.data && response.data.status === 'success') {
				const leaderboardData = (response.data.data || []).map(
					(item: any, index: number) => ({
						rank: index + 1,
						userId: item.userId || item._id,
						username: item.username || 'Anonymous',
						name: item.name || '',
						avatarUrl: item.avatarUrl || '',
						points: item.points || 0,
						recordCount: item.recordCount || 0,
						lastEarned: item.lastEarned ? new Date(item.lastEarned) : null,
						change: determineChange(item.userId, index), // You can implement this function to track position changes
					})
				);

				setLeaderboard(leaderboardData);
			}
		} catch (error) {
			console.error('Error fetching leaderboard:', error);
			toast.error('Failed to load leaderboard');
			// Set empty leaderboard
			setLeaderboard([]);
		} finally {
			setIsLoadingCreator(false);
		}
	};

	// Helper function to determine position changes (if you have historical data)
	const determineChange = (userId: string, currentIndex: number) => {
		// In a real implementation, you'd compare with previous leaderboard data
		// For now, we'll simulate with random values
		const random = Math.random();
		if (random < 0.33) return 'up';
		if (random < 0.66) return 'down';
		return 'same';
	};

	// Helper function to get wallet address with fallback
	const getWalletAddress = () => {
		return userProfile?.wallets?.solana
			? `${userProfile.wallets.solana.substring(
					0,
					6
			  )}...${userProfile.wallets.solana.substring(
					userProfile.wallets.solana.length - 4
			  )}`
			: 'Connect wallet';
	};

	// Handle selecting a different creator
	const handleSelectCreator = (creator: Creator) => {
		setSelectedCreator(creator);

		// Update token info when selecting a creator
		setUserTokenInfo({
			tokenBalance: creator.earnedPoints,
			percentile: Math.min(85, Math.floor(Math.random() * 100)), // Placeholder for percentile
			rewardsEarned: creator.earnedPoints,
			pendingRewards: 0,
		});
	};

	// Determine if we're in a main loading state
	const isLoading = isLoadingProfile || (isLoadingStats && isInitialLoad);

	// Empty state
	if (!isLoading && creators.length === 0) {
		return (
			<div className='p-6 flex flex-col items-center justify-center h-[70vh]'>
				<Coins className='h-16 w-16 text-gray-300 mb-4' />
				<h1 className='text-2xl font-bold mb-2'>No Creators Found</h1>
				<p className='text-gray-500 mb-6 text-center max-w-md'>
					There are no creators with loyalty tokens available yet. Check back
					later for updates.
				</p>
				<Button onClick={() => router.push('/explore')}>
					Explore Creators
				</Button>
			</div>
		);
	}

	// handle the token claim
	const claimToken = async () => {
		setIsClaiming(true);
		console.log('Claiming token for user:', userProfile?.wallets?.solana);
		console.log('Selected creator:', selectedCreator?.token?._id);
		try {
			const response = await axios.post('/tokens/claim', {
				tokenId: selectedCreator?.token?._id,
				recipientAddress: userProfile?.wallets?.solana,
			});
			if (response.data && response.data.status === 'success') {
				setClaimTxId(response.data.data.transactionId);
				toast.success('Token claimed successfully!');
			} else {
				toast.error('Failed to claim token');
			}
		} catch (error) {
			console.error('Error claiming token:', error);
			toast.error('Failed to claim token');
		} finally {
			setIsClaiming(false);
		}
	};

	// Main loading state - shows only once during initial load
	if (isLoading) {
		return <Loading />;
	}

	return (
		<div className='container mx-auto p-6 flex flex-col h-full'>
			<div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-4'>
				<h1 className='text-3xl font-bold'>Loyalties</h1>
			</div>

			{/* Creator Selection Dropdown */}
			<div className='my-4 md:mt-0'>
				<h3 className='font-semibold mb-2'>Select creator</h3>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='outline' className='w-[240px] justify-between p-6'>
							<div className='flex items-center gap-2 truncate'>
								<Avatar className='h-8 w-8'>
									<AvatarImage
										src={selectedCreator?.avatarUrl || ''}
										alt={selectedCreator?.name}
									/>
									<AvatarFallback>
										{selectedCreator?.name?.charAt(0) || '?'}
									</AvatarFallback>
								</Avatar>
								<div className='flex flex-col items-start text-left'>
									<span className='text-sm font-medium truncate'>
										{selectedCreator?.name}
									</span>
									<span className='text-xs text-muted-foreground'>
										@{selectedCreator?.username}
									</span>
								</div>
							</div>
							<ChevronDown className='h-4 w-4 opacity-50' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-[240px]' align='end'>
						<DropdownMenuLabel>Select Creator</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{creators.map((creator) => (
							<DropdownMenuItem
								key={creator._id}
								className='cursor-pointer'
								onClick={() => handleSelectCreator(creator)}
							>
								<div className='flex items-center gap-2 w-full'>
									<Avatar className='h-8 w-8'>
										<AvatarImage
											src={creator.avatarUrl || ''}
											alt={creator.name}
										/>
										<AvatarFallback>
											{creator?.name?.charAt(0) || '?'}
										</AvatarFallback>
									</Avatar>
									<div>
										<div className='font-medium'>{creator.name}</div>
										<div className='text-xs text-muted-foreground'>
											@{creator.username}
										</div>
									</div>
								</div>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Tabs defaultValue='dashboard' className='w-full'>
				<TabsList className='mb-6'>
					<TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
					<TabsTrigger value='leaderboard'>Leaderboard</TabsTrigger>
					<TabsTrigger value='rewards'>Rewards</TabsTrigger>
				</TabsList>

				{/* Dashboard Tab */}
				<TabsContent value='dashboard'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* Your Token Card */}
						<Card>
							<CardHeader className='pb-3'>
								<CardTitle className='flex items-center gap-2 text-xl'>
									<Coins className='h-5 w-5 text-amber-500' />
									{formattedTokenSymbol} Holding
								</CardTitle>
								<CardDescription>
									Summary of your token holdings from @
									{selectedCreator?.username}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='flex justify-between items-baseline mb-6'>
									<div className='text-4xl font-bold'>
										{formatTokenAmount(selectedCreator?.earnedPoints || 0)}
									</div>
									<div className='text-sm text-gray-500'>
										From {selectedCreator?.engagements || 0} engagements
									</div>
								</div>

								<div className='space-y-6'>
									<div>
										<div className='flex justify-between text-sm mb-1'>
											<span className='text-gray-500'>Loyalty Points</span>
											<span className='font-medium'>
												{selectedCreator?.earnedPoints || 0} points
											</span>
										</div>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-500'>Token Claimed</span>
											<span className='font-medium '>{tokenClaimed || 0}</span>
										</div>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-500'>
												Token Value (Not listed yet)
											</span>
											<span className='font-medium text-amber-600'>
												≈{' '}
												{Math.round(
													(selectedCreator?.earnedPoints || 0) * 0.01 * 100
												) / 100}{' '}
												{formattedTokenSymbol}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
							<CardFooter>
								{claimTxId && (
									<div className='flex items-center gap-2'>
										<Check className='h-5 w-5 text-green-500' />
										<a
											href={`https://solscan.io/tx/${claimTxId}?cluster=devnet`}
											target='_blank'
											rel='noopener noreferrer'
											className='text-green-500 hover:underline truncate flex-1 font-mono text-sm'
										>
											Token claimed successfully!
											<span className='inline-block ml-2'>
												<svg
													xmlns='http://www.w3.org/2000/svg'
													width='14'
													height='14'
													viewBox='0 0 24 24'
													fill='none'
													stroke='currentColor'
													strokeWidth='2'
													strokeLinecap='round'
													strokeLinejoin='round'
												>
													<path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'></path>
													<polyline points='15 3 21 3 21 9'></polyline>
													<line x1='10' y1='14' x2='21' y2='3'></line>
												</svg>
											</span>
										</a>
									</div>
								)}

								<div className='flex flex-col'>
									{selectedCreator?.token?._id ? (
										<Button disabled={isClaiming} onClick={claimToken}>
											{isClaiming ? 'Claiming' : 'Claim Tokens'}
										</Button>
									) : (
										<Button
											variant='outline'
											className='w-full'
											disabled
											onClick={() => {
												toast.error('Token not available for this creator');
											}}
										>
											Token Not Available
										</Button>
									)}
								</div>
							</CardFooter>
						</Card>

						{/* Token Stats Card */}
						<Card>
							<CardHeader className='pb-3'>
								<CardTitle className='flex items-center gap-2 text-xl'>
									<Diamond className='h-5 w-5 text-indigo-500' />
									{selectedCreator?.token?.name || 'Token'} Information
								</CardTitle>
								<CardDescription>
									Statistics about {selectedCreator?.name}'s{' '}
									{formattedTokenSymbol} token
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-1 gap-4 mb-4'>
									<div className='bg-gray-50 p-4 rounded-lg flex items-center space-x-4'>
										<span className='text-gray-500 mr-1'>CA:</span>
										{selectedCreator?.token?.contractAddress ? (
											<a
												href={`https://solscan.io/token/${selectedCreator.token.contractAddress}?cluster=devnet`}
												target='_blank'
												rel='noopener noreferrer'
												className='text-blue-600 hover:text-blue-800 hover:underline truncate flex-1 font-mono text-sm'
											>
												{selectedCreator.token.contractAddress}
												<span className='inline-block ml-2'>
													<svg
														xmlns='http://www.w3.org/2000/svg'
														width='14'
														height='14'
														viewBox='0 0 24 24'
														fill='none'
														stroke='currentColor'
														strokeWidth='2'
														strokeLinecap='round'
														strokeLinejoin='round'
													>
														<path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'></path>
														<polyline points='15 3 21 3 21 9'></polyline>
														<line x1='10' y1='14' x2='21' y2='3'></line>
													</svg>
												</span>
											</a>
										) : (
											<span className='text-gray-400 italic'>
												Not available
											</span>
										)}
									</div>
								</div>
								<div className='grid grid-cols-1 gap-4 mb-4'>
									<div className='bg-gray-50 p-4 rounded-lg flex items-center space-x-4'>
										{selectedCreator?.token?.imageUrl ? (
											<img
												src={selectedCreator.token.imageUrl}
												alt={selectedCreator.token.name}
												className='h-12 w-12 rounded-full object-cover'
											/>
										) : (
											<div className='h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center'>
												<span className='text-primary font-bold'>
													{selectedCreator?.token?.symbol?.substring(0, 2) ||
														tokenSymbol.substring(0, 2)}
												</span>
											</div>
										)}
										<div>
											<div className='text-sm text-gray-500 mb-1'>Token</div>
											<div className='font-bold flex items-center'>
												{selectedCreator?.token?.name ||
													`${selectedCreator?.name}'s Token`}
												<span className='ml-2 text-sm bg-gray-200 px-2 py-0.5 rounded-full'>
													{formattedTokenSymbol}
												</span>
											</div>
										</div>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-4'>
									<div className='bg-gray-50 p-4 rounded-lg'>
										<div className='text-sm text-gray-500 mb-1'>
											Points Earned
										</div>
										<div className='text-xl font-bold'>
											{formatTokenAmount(selectedCreator?.earnedPoints || 0)}
										</div>
									</div>

									<div className='bg-gray-50 p-4 rounded-lg'>
										<div className='text-sm text-gray-500 mb-1'>
											Total Supply
										</div>
										<div className='text-xl font-bold'>
											{formatTokenAmount(
												selectedCreator?.token?.totalSupply || 1000000
											)}{' '}
											{formattedTokenSymbol}
										</div>
									</div>
								</div>

								{/* Description if available */}
								{selectedCreator?.token?.description && (
									<div className='bg-gray-50 p-4 rounded-lg mt-2'>
										<div className='text-sm text-gray-500 mb-1'>
											Description
										</div>
										<div className='text-sm'>
											{selectedCreator.token.description}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Recent Activity */}
					{recentActivity.length > 0 && selectedCreator && (
						<Card className='mt-6'>
							<CardHeader>
								<CardTitle className='flex items-center gap-2 text-xl'>
									<Calendar className='h-5 w-5 text-blue-500' />
									Recent Activity
								</CardTitle>
								<CardDescription>
									Your most recent engagement with {selectedCreator.name}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{recentActivity
										.filter(
											(activity) => activity.creator._id === selectedCreator._id
										)
										.slice(0, 3)
										.map((activity) => (
											<div
												key={activity._id}
												className='flex items-center justify-between p-3 rounded-md border'
											>
												<div className='flex items-center gap-3'>
													<div className='bg-gray-100 p-2 rounded-full'>
														<Coins className='h-4 w-4 text-amber-500' />
													</div>
													<div>
														<div className='font-medium'>
															Earned {activity.loyaltyPoints} points
														</div>
														<div className='text-xs text-gray-500'>
															{new Date(
																activity.createdAt
															).toLocaleDateString()}{' '}
															•
															{activity.engagement?.sourceUrl && (
																<a
																	href={activity.engagement.sourceUrl}
																	className='ml-1 text-blue-500 hover:underline'
																>
																	View Content
																</a>
															)}
														</div>
													</div>
												</div>
												<div className='text-right'>
													<div className='font-medium'>
														+{activity.loyaltyPoints}
													</div>
													<div className='text-xs text-gray-500'>
														{activity.engagement?.engagedTime}s watched
													</div>
												</div>
											</div>
										))}
								</div>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Enhanced Leaderboard Tab */}
				<TabsContent value='leaderboard'>
					<Card>
						<CardHeader>
							<div className='flex justify-between items-center'>
								<CardTitle className='flex items-center gap-2'>
									<Award className='h-5 w-5 text-amber-500' />
									{formattedTokenSymbol} Leaderboard
								</CardTitle>
								<Select value={timeframe} onValueChange={setTimeframe}>
									<SelectTrigger className='w-36'>
										<SelectValue placeholder='Select timeframe' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='daily'>Daily</SelectItem>
										<SelectItem value='weekly'>Weekly</SelectItem>
										<SelectItem value='monthly'>Monthly</SelectItem>
										<SelectItem value='alltime'>All Time</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<CardDescription>
								Top supporters in the {timeframe} leaderboard for{' '}
								{selectedCreator?.name}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoadingCreator ? (
								<div className='flex justify-center p-8'>
									<Loader2 className='h-8 w-8 animate-spin text-primary' />
								</div>
							) : leaderboard.length === 0 ? (
								<div className='text-center py-12'>
									<Award className='h-12 w-12 text-gray-300 mx-auto mb-4' />
									<p className='text-lg font-medium text-gray-700'>
										No leaderboard data yet
									</p>
									<p className='text-gray-500'>Be the first to earn points!</p>
								</div>
							) : (
								<>
									{/* Top 3 Podium Section */}
									<div className='mb-8'>
										<div className='flex justify-center items-end gap-4 h-44'>
											{/* Second Place */}
											{leaderboard.length > 1 ? (
												<motion.div
													initial={{ y: 100, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													transition={{
														delay: 0.2,
														type: 'spring',
														stiffness: 100,
													}}
													className='flex flex-col items-center'
												>
													<div className='mb-2'>
														<span className='text-2xl'>🥈</span>
													</div>
													<Avatar className='h-16 w-16 border-2 border-gray-200'>
														<AvatarImage
															src={
																leaderboard[1].avatarUrl ||
																`https://api.dicebear.com/7.x/initials/svg?seed=${leaderboard[1].username}`
															}
														/>
														<AvatarFallback>
															{leaderboard[1]?.username
																?.charAt(0)
																?.toUpperCase() || '2'}
														</AvatarFallback>
													</Avatar>
													<motion.div
														className='h-24 w-20 bg-gray-100 rounded-t-lg mt-2 flex items-center justify-center'
														initial={{ height: 0 }}
														animate={{ height: '6rem' }}
														transition={{ delay: 0.3, duration: 0.5 }}
													>
														<div className='text-center'>
															<p className='font-medium text-sm'>
																{leaderboard[1].username}
															</p>
															<p className='font-bold text-lg'>
																{leaderboard[1].points.toFixed(2)}
															</p>
														</div>
													</motion.div>
												</motion.div>
											) : (
												<div className='w-20'></div> // Empty placeholder to maintain layout
											)}

											{/* First Place */}
											{leaderboard.length > 0 ? (
												<motion.div
													initial={{ y: 100, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													transition={{ type: 'spring', stiffness: 100 }}
													className='flex flex-col items-center'
												>
													<div className='mb-2'>
														<span className='text-2xl'>🥇</span>
													</div>
													<Avatar className='h-20 w-20 border-4 border-amber-300'>
														<AvatarImage
															src={
																leaderboard[0].avatarUrl ||
																`https://api.dicebear.com/7.x/initials/svg?seed=${leaderboard[0].username}`
															}
														/>
														<AvatarFallback>
															{leaderboard[0]?.username
																?.charAt(0)
																?.toUpperCase() || '1'}
														</AvatarFallback>
													</Avatar>
													<motion.div
														className='h-32 w-24 bg-amber-50 rounded-t-lg mt-2 flex items-center justify-center'
														initial={{ height: 0 }}
														animate={{ height: '8rem' }}
														transition={{ duration: 0.7 }}
													>
														<div className='text-center'>
															<p className='font-medium'>
																{leaderboard[0].username}
															</p>
															<p className='font-bold text-xl'>
																{leaderboard[0].points.toFixed(2)}
															</p>
														</div>
													</motion.div>
												</motion.div>
											) : (
												<div className='w-24'></div> // Empty placeholder to maintain layout
											)}

											{/* Third Place */}
											{leaderboard.length > 2 ? (
												<motion.div
													initial={{ y: 100, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													transition={{
														delay: 0.4,
														type: 'spring',
														stiffness: 100,
													}}
													className='flex flex-col items-center'
												>
													<div className='mb-2'>
														<span className='text-2xl'>🥉</span>
													</div>
													<Avatar className='h-14 w-14 border-2 border-gray-200'>
														<AvatarImage
															src={
																leaderboard[2].avatarUrl ||
																`https://api.dicebear.com/7.x/initials/svg?seed=${leaderboard[2].username}`
															}
														/>
														<AvatarFallback>
															{leaderboard[2]?.username
																?.charAt(0)
																?.toUpperCase() || '3'}
														</AvatarFallback>
													</Avatar>
													<motion.div
														className='h-16 w-20 bg-gray-100 rounded-t-lg mt-2 flex items-center justify-center'
														initial={{ height: 0 }}
														animate={{ height: '4rem' }}
														transition={{ delay: 0.5, duration: 0.5 }}
													>
														<div className='text-center'>
															<p className='font-medium text-sm'>
																{leaderboard[2].username}
															</p>
															<p className='font-bold'>
																{leaderboard[2].points.toFixed(2)}
															</p>
														</div>
													</motion.div>
												</motion.div>
											) : (
												<div className='w-20'></div> // Empty placeholder to maintain layout
											)}
										</div>
									</div>

									{/* Full Leaderboard List */}
									<div className='rounded-md border mt-8'>
										<div className='grid grid-cols-12 bg-gray-50 py-3 px-4 text-sm font-medium text-gray-500'>
											<div className='col-span-1'>#</div>
											<div className='col-span-7'>User</div>
											<div className='col-span-3 text-right'>Points</div>
											<div className='col-span-1'></div>
										</div>

										{leaderboard.map((user) => (
											<motion.div
												key={user.rank}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: user.rank * 0.05 }}
												className={cn(
													'grid grid-cols-12 py-3 px-4 border-t items-center',
													user.rank <= 3 ? 'bg-amber-50/50' : ''
												)}
											>
												<div className='col-span-1 font-medium flex items-center'>
													{user.rank <= 3 ? (
														<span className='mr-1'>
															{user.rank === 1 && '🥇'}
															{user.rank === 2 && '🥈'}
															{user.rank === 3 && '🥉'}
														</span>
													) : (
														user.rank
													)}
												</div>
												<div className='col-span-7 flex items-center gap-3'>
													<Avatar className='h-8 w-8'>
														<AvatarImage
															src={
																user.avatarUrl ||
																`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`
															}
														/>
														<AvatarFallback>
															{user?.username?.charAt(0)?.toUpperCase() || '?'}
														</AvatarFallback>
													</Avatar>
													<div>
														<div className='font-medium'>@{user.username}</div>
														{user.name && (
															<div className='text-xs text-gray-500'>
																{user.name}
															</div>
														)}
													</div>
												</div>
												<div className='col-span-3 text-right font-bold'>
													{user.points.toFixed(2)}
													{user.recordCount > 0 && (
														<div className='text-xs text-gray-500'>
															{user.recordCount} activities
														</div>
													)}
												</div>
												<div className='col-span-1 flex justify-end'>
													{user.change === 'up' && (
														<motion.div
															initial={{ y: 3 }}
															animate={{ y: -3 }}
															transition={{
																repeat: Infinity,
																repeatType: 'reverse',
																duration: 0.8,
															}}
														>
															<ArrowUp className='h-4 w-4 text-green-500' />
														</motion.div>
													)}
													{user.change === 'down' && (
														<motion.div
															initial={{ y: -3 }}
															animate={{ y: 3 }}
															transition={{
																repeat: Infinity,
																repeatType: 'reverse',
																duration: 0.8,
															}}
														>
															<ArrowDown className='h-4 w-4 text-red-500' />
														</motion.div>
													)}
												</div>
											</motion.div>
										))}
									</div>
								</>
							)}

							{leaderboard.length > 0 && selectedCreator && (
								<div className='mt-6 flex justify-center'>
									<Button
										variant='outline'
										className='gap-2'
										onClick={() =>
											router.push(
												`/creators/${selectedCreator._id}/leaderboard?timeframe=${timeframe}`
											)
										}
									>
										<Users className='h-4 w-4' />
										View Full Leaderboard
									</Button>
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				{/* Rewards Tab */}
				<TabsContent value='rewards'>
					<Card>
						<CardHeader>
							<CardTitle>Loyalty Rewards</CardTitle>
							<CardDescription>
								Ways to earn more {formattedTokenSymbol} tokens from{' '}
								{selectedCreator?.name}
							</CardDescription>
						</CardHeader>
						<CardContent className='text-center py-12'>
							<div className='mb-6'>
								<div className='bg-gray-100 p-8 inline-block rounded-full'>
									<Coins className='h-12 w-12 text-gray-400' />
								</div>
							</div>
							<h3 className='text-2xl font-semibold mb-2'>
								Rewards Coming Soon
							</h3>
							<p className='text-gray-500 max-w-md mx-auto'>
								We're working on exciting new ways for you to earn rewards from{' '}
								{selectedCreator?.name}. Check back soon for updates!
							</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
