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
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import TokenClaimQR from '@/components/TokenClaimQR';

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
	};
}

interface LeaderboardItem {
	rank: number;
	userId: string;
	username: string;
	avatarUrl: string;
	points: number;
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
	const [isLoadingCreator, setIsLoadingCreator] = useState(false);
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [showClaimModal, setShowClaimModal] = useState(false);
	const [qrRef, setQrRef] = useState<HTMLDivElement | null>(null);
	const [isClaiming, setIsClaiming] = useState(false);
	const [claimTxId, setClaimTxId] = useState<string | null>(null);
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
		if (selectedCreator) {
			fetchLeaderboard(selectedCreator._id);
		}
	}, [selectedCreator, timeframe]);

	// Fetch user's loyalty stats
	const fetchUserLoyaltyStats = async () => {
		setIsLoadingStats(true);
		try {
			const response = await axios.get('/loyalties/stats/user');
			console.log('User loyalty stats:', response.data);

			if (response.data && response.data.status === 'success') {
				const stats: LoyaltyStatsResponse = response.data.data;

				// Map the creators from the stats to our Creator interface
				const mappedCreators: Creator[] = stats.creators.map((creator) => ({
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
						  }
						: undefined,
				}));

				setCreators(mappedCreators);
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
				}
			}
		} catch (error) {
			console.error('Error fetching user loyalty stats:', error);
			toast.error('Failed to load loyalty statistics');
		} finally {
			setIsLoadingStats(false);
		}
	};

	// Fetch the leaderboard data for a specific creator
	const fetchLeaderboard = async (creatorId: string) => {
		setIsLoadingCreator(true);
		try {
			const response = await axios.get(`/loyalty/leaderboard/${creatorId}`, {
				params: { timeframe },
			});

			if (response.data && response.data.status === 'success') {
				const leaderboardData = (response.data.data || []).map(
					(item: any, index: number) => ({
						rank: index + 1,
						userId: item.userId || item._id,
						username: item.username || 'Anonymous',
						avatarUrl: item.photo || '',
						points: item.points || 0,
						change:
							Math.random() > 0.5 ? 'up' : ('down' as 'up' | 'down' | 'same'), // This would be determined by historical data
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

	// Loading state
	if (isLoadingProfile || isLoadingStats) {
		return <Loading />;
	}

	// Empty state
	if (creators.length === 0) {
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

	// Loading creator state
	if (!selectedCreator) {
		return <Loading />;
	}

	return (
		<div className='p-6 flex flex-col h-full'>
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
										src={selectedCreator.avatarUrl || ''}
										alt={selectedCreator.name}
									/>
									<AvatarFallback>
										{selectedCreator?.name?.charAt(0) || '?'}
									</AvatarFallback>
								</Avatar>
								<div className='flex flex-col items-start text-left'>
									<span className='text-sm font-medium truncate'>
										{selectedCreator.name}
									</span>
									<span className='text-xs text-muted-foreground'>
										@{selectedCreator.username}
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

			{isLoadingCreator ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			) : (
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
										{selectedCreator.username}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className='flex justify-between items-baseline mb-6'>
										<div className='text-4xl font-bold'>
											{formatTokenAmount(selectedCreator.earnedPoints)}
										</div>
										<div className='text-sm text-gray-500'>
											From {selectedCreator.engagements} engagements
										</div>
									</div>

									<div className='space-y-6'>
										<div>
											<div className='flex justify-between text-sm mb-1'>
												<span className='text-gray-500'>Loyalty Points</span>
												<span className='font-medium'>
													{selectedCreator.earnedPoints} points
												</span>
											</div>
											<div className='flex justify-between text-sm'>
												<span className='text-gray-500'>
													Token Value (Est.)
												</span>
												<span className='font-medium text-amber-600'>
													≈{' '}
													{Math.round(
														selectedCreator.earnedPoints * 0.01 * 100
													) / 100}{' '}
													{formattedTokenSymbol}
												</span>
											</div>
										</div>

										<div>
											<div className='flex justify-between mb-1'>
												<span className='text-sm text-gray-500'>
													Your Position
												</span>
												<span className='text-sm font-medium'>
													Top {100 - (userTokenInfo?.percentile || 0)}%
												</span>
											</div>
											<Progress
												value={userTokenInfo?.percentile || 0}
												className='h-2'
											/>
										</div>
									</div>
								</CardContent>
								<CardFooter>
									{selectedCreator?.token?._id ? (
										<TokenClaimQR
											tokenId={selectedCreator.token._id}
											tokenName={selectedCreator.token.name || 'Token'}
											tokenSymbol={formattedTokenSymbol}
											amount={
												Math.round(selectedCreator.earnedPoints * 0.01 * 100) /
												100
											}
											recipientAddress={userProfile?.wallets?.solana || ''}
										/>
									) : (
										<Button
											variant='outline'
											className='w-full'
											disabled
											onClick={() => setShowClaimModal(true)}
										>
											Token Not Available
										</Button>
									)}
								</CardFooter>
							</Card>

							{/* Token Stats Card */}
							<Card>
								<CardHeader className='pb-3'>
									<CardTitle className='flex items-center gap-2 text-xl'>
										<Diamond className='h-5 w-5 text-indigo-500' />
										{selectedCreator.token?.name || 'Token'} Information
									</CardTitle>
									<CardDescription>
										Statistics about {selectedCreator.name}'s{' '}
										{formattedTokenSymbol} token
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='grid grid-cols-1 gap-4 mb-4'>
										<div className='bg-gray-50 p-4 rounded-lg flex items-center space-x-4'>
											{selectedCreator.token?.imageUrl ? (
												<img
													src={selectedCreator.token.imageUrl}
													alt={selectedCreator.token.name}
													className='h-12 w-12 rounded-full'
												/>
											) : (
												<div className='h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center'>
													<span className='text-primary font-bold'>
														{selectedCreator.token?.symbol?.substring(0, 2) ||
															tokenSymbol.substring(0, 2)}
													</span>
												</div>
											)}
											<div>
												<div className='text-sm text-gray-500 mb-1'>Token</div>
												<div className='font-bold flex items-center'>
													{selectedCreator.token?.name ||
														`${selectedCreator.name}'s Token`}
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
												{formatTokenAmount(selectedCreator.earnedPoints)}
											</div>
										</div>

										<div className='bg-gray-50 p-4 rounded-lg'>
											<div className='text-sm text-gray-500 mb-1'>
												Total Supply
											</div>
											<div className='text-xl font-bold'>
												{formatTokenAmount(
													selectedCreator.token?.totalSupply || 1000000
												)}{' '}
												{formattedTokenSymbol}
											</div>
										</div>
									</div>

									{/* Description if available */}
									{selectedCreator.token?.description && (
										<div className='bg-gray-50 p-4 rounded-lg mt-2'>
											<div className='text-sm text-gray-500 mb-1'>
												Description
											</div>
											<div className='text-sm'>
												{selectedCreator.token.description}
											</div>
										</div>
									)}

									<div className='pt-2'>
										<Button
											variant='outline'
											className='w-full'
											onClick={() => {
												if (selectedCreator.token?._id) {
													router.push(`/tokens/${selectedCreator.token._id}`);
												}
											}}
											disabled={!selectedCreator.token?._id}
										>
											View Token Details
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Recent Activity */}
						{recentActivity.length > 0 && (
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
												(activity) =>
													activity.creator._id === selectedCreator._id
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

					{/* Leaderboard Tab */}
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
									Top supporters in the {timeframe} leaderboard
								</CardDescription>
							</CardHeader>
							<CardContent>
								{leaderboard.length === 0 ? (
									<div className='text-center py-12'>
										<Award className='h-12 w-12 text-gray-300 mx-auto mb-4' />
										<p className='text-lg font-medium text-gray-700'>
											No leaderboard data yet
										</p>
										<p className='text-gray-500'>
											Be the first to earn points!
										</p>
									</div>
								) : (
									<div className='rounded-md border'>
										<div className='grid grid-cols-12 bg-gray-50 py-3 px-4 text-sm font-medium text-gray-500'>
											<div className='col-span-1'>#</div>
											<div className='col-span-7'>User</div>
											<div className='col-span-3 text-right'>Points</div>
											<div className='col-span-1'></div>
										</div>

										{leaderboard.map((user) => (
											<div
												key={user.rank}
												className='grid grid-cols-12 py-3 px-4 border-t items-center'
											>
												<div className='col-span-1 font-medium'>
													{user.rank}
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
													<div className='font-medium'>@{user.username}</div>
												</div>
												<div className='col-span-3 text-right font-bold'>
													{user.points.toLocaleString()}
												</div>
												<div className='col-span-1 flex justify-end'>
													{user.change === 'up' && (
														<ArrowUp className='h-4 w-4 text-green-500' />
													)}
													{user.change === 'down' && (
														<ArrowDown className='h-4 w-4 text-red-500' />
													)}
												</div>
											</div>
										))}
									</div>
								)}

								{leaderboard.length > 0 && (
									<div className='mt-4 flex justify-center'>
										<Button
											variant='outline'
											className='gap-2'
											onClick={() =>
												router.push(
													`/creators/${selectedCreator._id}/leaderboard`
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
									{selectedCreator.name}
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
									We're working on exciting new ways for you to earn rewards
									from {selectedCreator.name}. Check back soon for updates!
								</p>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			)}

			{/* QR Code Dialog */}
			<Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
				<DialogContent className='sm:max-w-[425px]'>
					<DialogHeader>
						<DialogTitle>Claim {formattedTokenSymbol} Tokens</DialogTitle>
						<DialogDescription>
							Scan this QR code with your wallet to claim your tokens
						</DialogDescription>
					</DialogHeader>

					<div className='flex flex-col items-center justify-center py-4'>
						{claimTxId ? (
							<div className='text-center space-y-4'>
								<div className='bg-green-100 rounded-full p-3 inline-flex'>
									<Check className='h-6 w-6 text-green-600' />
								</div>
								<p className='font-medium'>Tokens claimed successfully!</p>
								<p className='text-sm text-gray-500'>
									Your tokens have been transferred to your wallet.
								</p>
								<Button
									className='w-full'
									onClick={() => {
										setClaimTxId(null);
										setShowClaimModal(false);
									}}
								>
									Close
								</Button>
							</div>
						) : (
							<>
								<div
									ref={setQrRef}
									className='qr-container bg-white p-4 rounded-lg mb-4 relative min-h-[300px] min-w-[300px] flex items-center justify-center'
								>
									{/* QR code will be rendered here */}
									{isClaiming && (
										<div className='absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg'>
											<Loader2 className='h-8 w-8 animate-spin text-primary' />
										</div>
									)}
								</div>

								<div className='text-sm text-gray-500 text-center mb-4'>
									<p>Scan with your wallet to claim</p>
									<p className='mt-1 font-medium'>
										{Math.round(
											(selectedCreator?.earnedPoints || 0) * 0.01 * 100
										) / 100}{' '}
										{formattedTokenSymbol}
									</p>
									<p className='mt-2'>Wallet: {getWalletAddress()}</p>
								</div>

								<Button
									variant='outline'
									className='w-full'
									onClick={() => setShowClaimModal(false)}
								>
									Cancel
								</Button>
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
