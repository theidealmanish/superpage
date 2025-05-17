'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import {
	BarChart3,
	Users,
	DollarSign,
	ArrowUpRight,
	LayoutDashboard,
	Star,
	Gift,
	Clock,
	Gift as GiftIcon,
	Bell,
	BarChart,
	Activity,
	TrendingUp,
	User,
	Link,
	ExternalLink,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface User {
	_id: string;
	name: string;
	photo?: string;
	username: string;
	role: string;
	followers: number;
	following: number;
}

interface TokenStats {
	price: number;
	marketCap: number;
	volume24h: number;
	holders: number;
	changePercentage: number;
}

interface Notification {
	_id: string;
	type: 'transaction' | 'follower' | 'system' | 'marketplace';
	title: string;
	message: string;
	createdAt: string;
	read: boolean;
	link?: string;
	sender?: {
		_id: string;
		name: string;
		photo?: string;
		username: string;
	};
}

export default function HomePage() {
	const router = useRouter();

	// State
	const [isLoading, setIsLoading] = useState(true);
	const [user, setUser] = useState<User | null>(null);
	const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [activities, setActivities] = useState<any[]>([]);

	// Mock data for demo purposes
	const mockUser = {
		_id: '1',
		name: 'Jane Smith',
		photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
		username: 'janesmith',
		role: 'creator',
		followers: 2547,
		following: 168,
	};

	const mockTokenStats = {
		price: 2.45,
		marketCap: 245000,
		volume24h: 18760,
		holders: 342,
		changePercentage: 4.2,
	};

	const mockNotifications = [
		{
			_id: 'n1',
			type: 'follower',
			title: 'New Follower',
			message: 'Alex Johnson started following you',
			createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
			read: false,
			sender: {
				_id: 'u2',
				name: 'Alex Johnson',
				photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
				username: 'alexj',
			},
		},
		{
			_id: 'n2',
			type: 'transaction',
			title: 'Token Purchase',
			message: 'Someone purchased 50 of your tokens',
			createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
			read: true,
		},
		{
			_id: 'n3',
			type: 'marketplace',
			title: 'New Sale',
			message: 'Your Premium Template was purchased',
			createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
			read: false,
			link: '/marketplace/sales',
		},
		{
			_id: 'n4',
			type: 'system',
			title: 'Welcome to Superpage',
			message: 'Thanks for joining! Complete your profile to get started.',
			createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
			read: true,
			link: '/profile',
		},
	] as Notification[];

	const mockActivities = [
		{
			type: 'token_purchase',
			user: {
				name: 'Michael Chen',
				username: 'michaelc',
				photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
			},
			amount: 25,
			price: 57.5,
			createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
		},
		{
			type: 'marketplace_purchase',
			user: {
				name: 'Sarah Williams',
				username: 'sarahw',
				photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
			},
			item: 'Premium Design Templates',
			price: 49.99,
			createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
		},
		{
			type: 'new_follower',
			user: {
				name: 'David Kim',
				username: 'davidk',
				photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
			},
			createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
		},
	];

	// Load data
	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// In a real app, make API calls to fetch actual data
				// const userResponse = await axios.get('/me');
				// setUser(userResponse.data);

				// For demo purposes, use mock data
				setUser(mockUser);
				setTokenStats(mockTokenStats);
				setNotifications(mockNotifications);
				setActivities(mockActivities);

				// Simulate loading
				setTimeout(() => {
					setIsLoading(false);
				}, 1000);
			} catch (error) {
				console.error('Error fetching data:', error);
				toast.error('Failed to load dashboard data');
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	// Mark notification as read
	const markAsRead = (notificationId: string) => {
		setNotifications((prev) =>
			prev.map((notification) =>
				notification._id === notificationId
					? { ...notification, read: true }
					: notification
			)
		);

		// In a real app, make an API call
		// axios.put(`/notifications/${notificationId}/read`);
	};

	// Format large numbers
	const formatNumber = (num: number) => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	};

	// Format date as relative time
	const formatRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();

		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
		const diffInMinutes = Math.floor(diffInSeconds / 60);
		const diffInHours = Math.floor(diffInMinutes / 60);
		const diffInDays = Math.floor(diffInHours / 24);

		if (diffInSeconds < 60) {
			return 'just now';
		} else if (diffInMinutes < 60) {
			return `${diffInMinutes}m ago`;
		} else if (diffInHours < 24) {
			return `${diffInHours}h ago`;
		} else if (diffInDays < 7) {
			return `${diffInDays}d ago`;
		} else {
			return date.toLocaleDateString();
		}
	};

	// Loading skeleton
	if (isLoading) {
		return (
			<div className='container mx-auto p-6 space-y-8'>
				<div className='flex justify-between items-center'>
					<Skeleton className='h-8 w-[200px]' />
					<Skeleton className='h-10 w-[120px]' />
				</div>

				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className='h-[180px] w-full rounded-lg' />
					))}
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					<Skeleton className='h-[400px] w-full rounded-lg lg:col-span-2' />
					<Skeleton className='h-[400px] w-full rounded-lg' />
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto p-6 space-y-8'>
			{/* Welcome header */}
			<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Welcome back!</h1>
					<p className='text-muted-foreground'>
						Here's an overview of your activity and stats
					</p>
				</div>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className='relative'>
							<Bell className='mr-2 h-4 w-4' />
							Notifications
							{notifications.filter((n) => !n.read).length > 0 && (
								<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
									{notifications.filter((n) => !n.read).length}
								</span>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end' className='w-[360px]'>
						<DropdownMenuLabel>Notifications</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{notifications.length === 0 ? (
							<div className='py-4 px-2 text-center text-muted-foreground'>
								No notifications
							</div>
						) : (
							notifications.slice(0, 5).map((notification) => (
								<DropdownMenuItem
									key={notification._id}
									className={cn(
										'flex items-start gap-2 p-3 cursor-pointer',
										!notification.read && 'bg-muted/50'
									)}
									onClick={() => {
										markAsRead(notification._id);
										if (notification.link) {
											router.push(notification.link);
										}
									}}
								>
									<div className='flex-shrink-0 mt-1'>
										{notification.type === 'follower' && notification.sender ? (
											<Avatar className='h-8 w-8'>
												<AvatarImage src={notification.sender.photo} />
												<AvatarFallback>
													{notification.sender.name[0]}
												</AvatarFallback>
											</Avatar>
										) : notification.type === 'transaction' ? (
											<div className='h-8 w-8 bg-green-100 rounded-full flex items-center justify-center'>
												<DollarSign className='h-4 w-4 text-green-600' />
											</div>
										) : notification.type === 'marketplace' ? (
											<div className='h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center'>
												<Gift className='h-4 w-4 text-purple-600' />
											</div>
										) : (
											<div className='h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center'>
												<Bell className='h-4 w-4 text-blue-600' />
											</div>
										)}
									</div>
									<div className='flex-1 min-w-0'>
										<div className='font-medium'>{notification.title}</div>
										<p className='text-sm text-muted-foreground line-clamp-2'>
											{notification.message}
										</p>
										<p className='text-xs text-muted-foreground mt-1'>
											{formatRelativeTime(notification.createdAt)}
										</p>
									</div>
									{!notification.read && (
										<div className='w-2 h-2 bg-blue-500 rounded-full mt-2' />
									)}
								</DropdownMenuItem>
							))
						)}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className='text-center justify-center font-medium'
							onClick={() => router.push('/notifications')}
						>
							View all notifications
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Stats cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				{/* Followers card */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Followers</CardTitle>
						<Users className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							{formatNumber(user?.followers || 0)}
						</div>
						<p className='text-xs text-muted-foreground'>+12 from last week</p>
					</CardContent>
				</Card>

				{/* Token Price card */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Token Price</CardTitle>
						<DollarSign className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>
							${tokenStats?.price.toFixed(2)}
						</div>
						<div className='flex items-center mt-1'>
							<Badge
								className={cn(
									'text-xs',
									tokenStats?.changePercentage &&
										tokenStats.changePercentage > 0
										? 'bg-green-100 text-green-800 hover:bg-green-100'
										: 'bg-red-100 text-red-800 hover:bg-red-100'
								)}
							>
								{tokenStats?.changePercentage && tokenStats.changePercentage > 0
									? '+'
									: ''}
								{tokenStats?.changePercentage?.toFixed(2)}%
							</Badge>
							<span className='text-xs text-muted-foreground ml-2'>
								past 24h
							</span>
						</div>
					</CardContent>
				</Card>

				{/* Token Holders card */}
				<Card>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-sm font-medium'>Token Holders</CardTitle>
						<Star className='h-4 w-4 text-muted-foreground' />
					</CardHeader>
					<CardContent>
						<div className='text-2xl font-bold'>{tokenStats?.holders || 0}</div>
						<p className='text-xs text-muted-foreground'>
							+{Math.floor(Math.random() * 10)} new this week
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Main content */}
			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Activity feed - takes 2/3 width on desktop */}
				<Card className='lg:col-span-2'>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
						<CardDescription>
							Latest transactions and interactions
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className='space-y-8'>
							{activities.length === 0 ? (
								<div className='text-center py-8'>
									<Clock className='h-12 w-12 text-muted-foreground mx-auto mb-3' />
									<h3 className='text-lg font-medium'>No recent activity</h3>
									<p className='text-muted-foreground'>
										Your recent interactions will appear here
									</p>
								</div>
							) : (
								activities.map((activity, index) => (
									<div key={index} className='flex'>
										<div className='relative mr-4'>
											<Avatar>
												<AvatarImage src={activity.user.photo} />
												<AvatarFallback>{activity.user.name[0]}</AvatarFallback>
											</Avatar>
											<span
												className={cn(
													'absolute -bottom-0.5 -right-0.5 rounded-full p-1',
													activity.type === 'token_purchase'
														? 'bg-green-500'
														: activity.type === 'marketplace_purchase'
														? 'bg-purple-500'
														: 'bg-blue-500'
												)}
											>
												{activity.type === 'token_purchase' ? (
													<DollarSign className='h-3 w-3 text-white' />
												) : activity.type === 'marketplace_purchase' ? (
													<GiftIcon className='h-3 w-3 text-white' />
												) : (
													<Users className='h-3 w-3 text-white' />
												)}
											</span>
										</div>
										<div className='flex-1 space-y-1'>
											<p>
												<span className='font-medium'>
													{activity.user.name}
												</span>
												{activity.type === 'token_purchase' ? (
													<>
														{' '}
														purchased {activity.amount} tokens for $
														{activity.price}
													</>
												) : activity.type === 'marketplace_purchase' ? (
													<>
														{' '}
														bought{' '}
														<span className='font-medium'>
															{activity.item}
														</span>{' '}
														for ${activity.price}
													</>
												) : (
													<> started following you</>
												)}
											</p>
											<p className='text-sm text-muted-foreground'>
												{formatRelativeTime(activity.createdAt)}
											</p>
										</div>
										<Button
											variant='ghost'
											size='sm'
											className='ml-auto'
											onClick={() => router.push(`/@${activity.user.username}`)}
										>
											View
										</Button>
									</div>
								))
							)}
						</div>

						{activities.length > 0 && (
							<Button
								variant='outline'
								className='w-full mt-6'
								onClick={() => router.push('/activity')}
							>
								View All Activity
							</Button>
						)}
					</CardContent>
				</Card>

				{/* Quick actions card - takes 1/3 width on desktop */}
				<div className='space-y-6'>
					{/* Profile card */}
					<Card>
						<CardHeader className='pb-3'>
							<div className='flex items-center space-x-4'>
								<Avatar className='h-12 w-12'>
									<AvatarImage src={user?.photo} />
									<AvatarFallback>{user?.name[0]}</AvatarFallback>
								</Avatar>
								<div>
									<CardTitle>{user?.name}</CardTitle>
									<CardDescription>@{user?.username}</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className='pb-3'>
							<div className='flex justify-around text-center'>
								<div>
									<div className='font-bold'>
										{formatNumber(user?.followers || 0)}
									</div>
									<div className='text-xs text-muted-foreground'>Followers</div>
								</div>
								<Separator orientation='vertical' className='h-10' />
								<div>
									<div className='font-bold'>
										{formatNumber(user?.following || 0)}
									</div>
									<div className='text-xs text-muted-foreground'>Following</div>
								</div>
								<Separator orientation='vertical' className='h-10' />
								<div>
									<div className='font-bold'>
										${tokenStats?.price.toFixed(2)}
									</div>
									<div className='text-xs text-muted-foreground'>
										Token Price
									</div>
								</div>
							</div>
						</CardContent>
						<CardFooter className='pt-1'>
							<Button
								variant='outline'
								className='w-full'
								onClick={() => router.push(`/@${user?.username}`)}
							>
								<User className='mr-2 h-4 w-4' />
								View Profile
							</Button>
						</CardFooter>
					</Card>

					{/* Quick links card */}
					<Card>
						<CardHeader>
							<CardTitle>Quick Actions</CardTitle>
						</CardHeader>
						<CardContent className='grid gap-2'>
							<Button
								variant='outline'
								className='w-full justify-start'
								onClick={() => router.push('/marketplace')}
							>
								<Gift className='mr-2 h-4 w-4' />
								Marketplace
							</Button>
							<Button
								variant='outline'
								className='w-full justify-start'
								onClick={() => router.push('/loyalties')}
							>
								<Star className='mr-2 h-4 w-4' />
								Token Management
							</Button>
							<Button
								variant='outline'
								className='w-full justify-start'
								onClick={() => router.push('/analytics')}
							>
								<BarChart className='mr-2 h-4 w-4' />
								Analytics
							</Button>
							<Button
								variant='outline'
								className='w-full justify-start'
								onClick={() => router.push('/settings')}
							>
								<User className='mr-2 h-4 w-4' />
								Profile Settings
							</Button>
						</CardContent>
					</Card>

					{/* Token stats summary */}
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium'>
								Token Stats Summary
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-2'>
							<div className='flex justify-between'>
								<span className='text-sm'>Market Cap</span>
								<span className='font-medium'>
									${formatNumber(tokenStats?.marketCap || 0)}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-sm'>24h Volume</span>
								<span className='font-medium'>
									${formatNumber(tokenStats?.volume24h || 0)}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-sm'>Token Holders</span>
								<span className='font-medium'>
									{formatNumber(tokenStats?.holders || 0)}
								</span>
							</div>
							<div className='flex justify-between'>
								<span className='text-sm'>Price Change (24h)</span>
								<span
									className={cn(
										'font-medium',
										tokenStats?.changePercentage &&
											tokenStats.changePercentage > 0
											? 'text-green-600'
											: 'text-red-600'
									)}
								>
									{tokenStats?.changePercentage &&
									tokenStats.changePercentage > 0
										? '+'
										: ''}
									{tokenStats?.changePercentage?.toFixed(2)}%
								</span>
							</div>
						</CardContent>
						<CardFooter className='pt-2'>
							<Button
								variant='outline'
								size='sm'
								className='w-full text-xs'
								onClick={() => router.push('/analytics')}
							>
								<BarChart3 className='mr-2 h-3 w-3' />
								View Detailed Analytics
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
