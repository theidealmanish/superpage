'use client';

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
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
import { Progress } from '@/components/ui/progress';
import {
	Award,
	ArrowUp,
	ArrowDown,
	Coins,
	Users,
	Diamond,
	Share2,
	ChevronDown,
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

// Creator data for dropdown
const creators = [
	{
		id: 1,
		name: 'Jane Cooper',
		username: 'janecooper',
		token: '$JANE',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=JC',
	},
	{
		id: 2,
		name: 'Alex Rivera',
		username: 'alexr',
		token: '$ALEX',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=AR',
	},
	{
		id: 3,
		name: 'Devon Lane',
		username: 'devonlane',
		token: '$DEVON',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=DL',
	},
	{
		id: 4,
		name: 'Leslie Alexander',
		username: 'leslieaaa',
		token: '$LESLI',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=LA',
	},
	{
		id: 5,
		name: 'Robert Fox',
		username: 'robfox',
		token: '$ROB',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=RF',
	},
];

// Dummy data for the leaderboard
const leaderboardData = [
	{
		rank: 1,
		username: 'cryptomaster',
		avatarUrl: '',
		points: 4850,
		change: 'up',
	},
	{
		rank: 2,
		username: 'blockchaindev',
		avatarUrl: '',
		points: 4230,
		change: 'same',
	},
	{
		rank: 3,
		username: 'tokentrader',
		avatarUrl: '',
		points: 4100,
		change: 'down',
	},
	{
		rank: 4,
		username: 'web3pioneer',
		avatarUrl: '',
		points: 3890,
		change: 'up',
	},
	{ rank: 5, username: 'defiwhale', avatarUrl: '', points: 3740, change: 'up' },
	{
		rank: 6,
		username: 'nftcollector',
		avatarUrl: '',
		points: 3520,
		change: 'down',
	},
	{
		rank: 7,
		username: 'daohacker',
		avatarUrl: '',
		points: 3320,
		change: 'same',
	},
	{
		rank: 8,
		username: 'satoshifan',
		avatarUrl: '',
		points: 3150,
		change: 'up',
	},
	{
		rank: 9,
		username: 'alicecrypto',
		avatarUrl: '',
		points: 2980,
		change: 'down',
	},
	{ rank: 10, username: 'bobweb3', avatarUrl: '', points: 2850, change: 'up' },
];

// Dummy data for your tokens
const userTokenInfo = {
	tokenName: '$PAGE',
	tokenBalance: 2485,
	maxSupply: 10000000,
	circulatingSupply: 3750000,
	yourPercentile: 92, // Top 8%
	rewardsEarned: 125,
	pendingRewards: 45,
};

export default function LoyaltiesPage() {
	const [timeframe, setTimeframe] = useState('weekly');
	const [selectedCreator, setSelectedCreator] = useState(creators[0]);

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
										src={selectedCreator.avatarUrl}
										alt={selectedCreator.name}
									/>
									<AvatarFallback>
										{selectedCreator.name.charAt(0)}
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
								key={creator.id}
								className='cursor-pointer'
								onClick={() => setSelectedCreator(creator)}
							>
								<div className='flex items-center gap-2 w-full'>
									<Avatar className='h-8 w-8'>
										<AvatarImage src={creator.avatarUrl} alt={creator.name} />
										<AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
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
									{selectedCreator.token} Holding
								</CardTitle>
								<CardDescription>
									Summary of your token holdings from @
									{selectedCreator.username}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='flex justify-between items-baseline mb-6'>
									<div className='text-4xl font-bold'>
										{userTokenInfo.tokenBalance.toLocaleString()}
									</div>
								</div>

								<div className='space-y-6'>
									<div>
										<div className='flex justify-between text-sm mb-1'>
											<span className='text-gray-500'>Rewards Earned</span>
											<span className='font-medium'>
												{userTokenInfo.rewardsEarned} tokens
											</span>
										</div>
										<div className='flex justify-between text-sm'>
											<span className='text-gray-500'>Pending Rewards</span>
											<span className='font-medium text-amber-600'>
												+{userTokenInfo.pendingRewards} tokens
											</span>
										</div>
									</div>

									<div>
										<div className='flex justify-between mb-1'>
											<span className='text-sm text-gray-500'>
												Your Position
											</span>
											<span className='text-sm font-medium'>
												Top {100 - userTokenInfo.yourPercentile}%
											</span>
										</div>
										<Progress
											value={userTokenInfo.yourPercentile}
											className='h-2'
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Token Stats Card */}
						<Card>
							<CardHeader className='pb-3'>
								<CardTitle className='flex items-center gap-2 text-xl'>
									<Diamond className='h-5 w-5 text-indigo-500' />
									Token Information
								</CardTitle>
								<CardDescription>
									Statistics about {selectedCreator.name}'s{' '}
									{userTokenInfo.tokenName} token
								</CardDescription>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-2 gap-4'>
									<div className='bg-gray-50 p-4 rounded-lg'>
										<div className='text-sm text-gray-500 mb-1'>Max Supply</div>
										<div className='text-xl font-bold'>
											{userTokenInfo.maxSupply.toLocaleString()}
										</div>
									</div>

									<div className='bg-gray-50 p-4 rounded-lg'>
										<div className='text-sm text-gray-500 mb-1'>
											Circulating Supply
										</div>
										<div className='text-xl font-bold'>
											{userTokenInfo.circulatingSupply.toLocaleString()}
										</div>
									</div>
								</div>

								<div>
									<div className='flex justify-between mb-1'>
										<span className='text-sm text-gray-500'>
											Distribution Progress
										</span>
										<span className='text-sm font-medium'>
											{Math.round(
												(userTokenInfo.circulatingSupply /
													userTokenInfo.maxSupply) *
													100
											)}
											%
										</span>
									</div>
									<Progress
										value={
											(userTokenInfo.circulatingSupply /
												userTokenInfo.maxSupply) *
											100
										}
										className='h-2'
									/>
								</div>

								<div className='pt-2'>
									<Button variant='outline' className='w-full'>
										View Token Details
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				{/* Leaderboard Tab */}
				<TabsContent value='leaderboard'>
					<Card>
						<CardHeader>
							<div className='flex justify-between items-center'>
								<CardTitle className='flex items-center gap-2'>
									<Award className='h-5 w-5 text-amber-500' />
									{selectedCreator.token}'s Leaderboard
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
							<div className='rounded-md border'>
								<div className='grid grid-cols-12 bg-gray-50 py-3 px-4 text-sm font-medium text-gray-500'>
									<div className='col-span-1'>#</div>
									<div className='col-span-7'>User</div>
									<div className='col-span-3 text-right'>Points</div>
									<div className='col-span-1'></div>
								</div>

								{leaderboardData.map((user) => (
									<div
										key={user.rank}
										className='grid grid-cols-12 py-3 px-4 border-t items-center'
									>
										<div className='col-span-1 font-medium'>{user.rank}</div>
										<div className='col-span-7 flex items-center gap-3'>
											<Avatar className='h-8 w-8'>
												<AvatarImage
													src={
														user.avatarUrl ||
														`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`
													}
												/>
												<AvatarFallback>
													{user.username.charAt(0).toUpperCase()}
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

							<div className='mt-4 flex justify-center'>
								<Button variant='outline' className='gap-2'>
									<Users className='h-4 w-4' />
									View Full Leaderboard
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Rewards Tab */}
				<TabsContent value='rewards'>
					<Card>
						<CardHeader>
							<CardTitle>Loyalty Rewards</CardTitle>
							<CardDescription>
								Ways to earn more {userTokenInfo.tokenName} tokens from{' '}
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
								We're working on exciting new ways for you to earn rewards from{' '}
								{selectedCreator.name}. Check back soon for updates!
							</p>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
