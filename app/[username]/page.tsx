'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getUsername } from '@/lib/getUsername';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
	Twitter,
	Instagram,
	Github,
	Youtube,
	Twitch,
	Linkedin,
	Globe,
	ExternalLink,
	Share2,
	Copy,
	Check,
	Mail,
} from 'lucide-react';

// Mock user data - replace with API call in production
const mockUserData = {
	name: 'Sarah Johnson',
	username: 'beyond',
	bio: 'Digital creator passionate about web3 and creative technology. Building the future of creator monetization at SuperPage.',
	avatar: '/images/avatars/beyond.jpg',
	coverImage: '/images/cover-bg.jpg',
	verified: true,
	followers: 4582,
	following: 325,
	memberSince: 'May 2023',
	location: 'San Francisco, CA',
	social: [
		{ type: 'twitter', url: 'https://twitter.com/beyond', username: 'beyond' },
		{
			type: 'instagram',
			url: 'https://instagram.com/beyond',
			username: 'beyond',
		},
		{ type: 'github', url: 'https://github.com/beyond', username: 'beyond' },
		{
			type: 'youtube',
			url: 'https://youtube.com/c/beyond',
			username: 'Beyond Creative',
		},
		{
			type: 'linkedin',
			url: 'https://linkedin.com/in/beyond',
			username: 'sarahjohnson',
		},
		{ type: 'website', url: 'https://beyond.dev', username: 'beyond.dev' },
	],
	links: [
		{
			title: 'My Latest Project',
			url: 'https://project.beyond.dev',
			description: "Check out what I've been working on!",
		},
		{
			title: 'Web3 Tutorial Series',
			url: 'https://beyond.dev/tutorials',
			description: 'Learn how to build on blockchain',
		},
	],
};

export default function UsernamePage() {
	const params = useParams();
	const username = getUsername(params.username);

	// State for fetching user data
	const [user, setUser] = useState(mockUserData);
	const [isLoading, setIsLoading] = useState(true);
	const [linkCopied, setLinkCopied] = useState(false);

	// In real app, fetch user data here
	useEffect(() => {
		// Simulate API fetch
		setTimeout(() => {
			setUser({ ...mockUserData, username });
			setIsLoading(false);
		}, 500);
	}, [username]);

	// Handle copy link
	const handleCopyLink = () => {
		navigator.clipboard.writeText(`${window.location.origin}/@${username}`);
		setLinkCopied(true);
		setTimeout(() => setLinkCopied(false), 2000);
	};

	// Social media icon mapping
	const SocialIcon = ({ type }: { type: string }) => {
		switch (type) {
			case 'twitter':
				return <Twitter className='h-5 w-5' />;
			case 'instagram':
				return <Instagram className='h-5 w-5' />;
			case 'github':
				return <Github className='h-5 w-5' />;
			case 'youtube':
				return <Youtube className='h-5 w-5' />;
			case 'linkedin':
				return <Linkedin className='h-5 w-5' />;
			case 'twitch':
				return <Twitch className='h-5 w-5' />;
			case 'website':
			default:
				return <Globe className='h-5 w-5' />;
		}
	};

	// Loading state
	if (isLoading) {
		return (
			<div className='container mx-auto max-w-4xl py-8 px-4'>
				<div className='animate-pulse'>
					<div className='h-48 bg-gray-200 rounded-lg mb-6'></div>
					<div className='flex items-center mb-8'>
						<div className='h-24 w-24 rounded-full bg-gray-200 -mt-12 border-4 border-white'></div>
						<div className='ml-4 space-y-2 flex-1'>
							<div className='h-6 bg-gray-200 rounded w-1/3'></div>
							<div className='h-4 bg-gray-200 rounded w-1/2'></div>
						</div>
					</div>
					<div className='h-20 bg-gray-200 rounded mb-6'></div>
					<div className='grid grid-cols-2 gap-4'>
						<div className='h-32 bg-gray-200 rounded'></div>
						<div className='h-32 bg-gray-200 rounded'></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col min-h-screen bg-gray-50'>
			{/* Cover Image */}
			<div
				className='h-48 md:h-64 w-full bg-cover bg-center'
				style={{
					backgroundImage: user.coverImage
						? `url(${user.coverImage})`
						: 'linear-gradient(to right, #4f46e5, #7c3aed)',
				}}
			></div>

			<div className='container mx-auto max-w-4xl px-4'>
				{/* Profile Header */}
				<div className='flex flex-col sm:flex-row sm:items-end -mt-12 sm:-mt-16 mb-6'>
					<Avatar className='h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-lg'>
						<AvatarImage src={user.avatar} alt={user.name} />
						<AvatarFallback className='text-2xl bg-primary/10 text-primary'>
							{user.name.substring(0, 2)}
						</AvatarFallback>
					</Avatar>

					<div className='mt-4 sm:mt-0 sm:ml-6 flex flex-col sm:flex-row sm:items-center justify-between flex-1'>
						<div>
							<div className='flex items-center'>
								<h1 className='text-2xl sm:text-3xl font-bold'>{user.name}</h1>
								{user.verified && (
									<Badge
										variant='outline'
										className='ml-2 bg-blue-50 text-blue-600 border-blue-200'
									>
										Verified
									</Badge>
								)}
							</div>
							<p className='text-gray-500 text-sm sm:text-base'>
								@{user.username}
							</p>
						</div>

						<div className='flex mt-4 sm:mt-0 gap-2'>
							<Button
								variant='outline'
								size='sm'
								onClick={handleCopyLink}
								className='flex items-center gap-1'
							>
								{linkCopied ? (
									<>
										<Check className='h-4 w-4' />
										Copied
									</>
								) : (
									<>
										<Copy className='h-4 w-4' />
										Copy Link
									</>
								)}
							</Button>

							<Button
								variant='secondary'
								size='sm'
								onClick={() =>
									(window.location.href = `mailto:${user.username}@example.com`)
								}
								className='flex items-center gap-1'
							>
								<Mail className='h-4 w-4' />
								Contact
							</Button>

							<Button size='sm'>Support</Button>
						</div>
					</div>
				</div>

				{/* Bio */}
				<div className='mb-8'>
					<p className='text-gray-700'>{user.bio}</p>

					<div className='flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-500'>
						{user.location && (
							<span className='flex items-center gap-1'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-4 w-4'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
									/>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
									/>
								</svg>
								{user.location}
							</span>
						)}

						<span className='flex items-center gap-1'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-4 w-4'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
								/>
							</svg>
							Member since {user.memberSince}
						</span>

						<span className='flex items-center gap-1'>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-4 w-4'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
								/>
							</svg>
							<span className='font-medium'>
								{user.followers.toLocaleString()}
							</span>{' '}
							followers ·{' '}
							<span className='font-medium'>
								{user.following.toLocaleString()}
							</span>{' '}
							following
						</span>
					</div>
				</div>

				{/* Tabs */}
				<Tabs defaultValue='links' className='mb-12'>
					<TabsList className='grid w-full grid-cols-2 sm:w-auto sm:inline-flex'>
						<TabsTrigger value='links'>Links</TabsTrigger>
						<TabsTrigger value='social'>Social Media</TabsTrigger>
					</TabsList>

					<TabsContent value='links' className='mt-6'>
						<div className='grid gap-4 md:grid-cols-2'>
							{user.links &&
								user.links.map((link, i) => (
									<Card key={i} className='overflow-hidden'>
										<CardHeader className='p-4 pb-2'>
											<CardTitle className='text-base'>{link.title}</CardTitle>
											<CardDescription className='text-xs'>
												{link.description}
											</CardDescription>
										</CardHeader>
										<CardContent className='p-4 pt-2'>
											<a
												href={link.url}
												target='_blank'
												rel='noopener noreferrer'
												className='flex items-center justify-between text-primary text-sm hover:underline'
											>
												Visit Link <ExternalLink className='h-3 w-3 ml-1' />
											</a>
										</CardContent>
									</Card>
								))}
						</div>

						{(!user.links || user.links.length === 0) && (
							<div className='text-center p-8 bg-gray-50 border border-dashed rounded-lg'>
								<p className='text-gray-500'>No links available</p>
							</div>
						)}
					</TabsContent>

					<TabsContent value='social' className='mt-6'>
						<Card>
							<CardContent className='p-6'>
								<div className='grid gap-4 md:grid-cols-2'>
									{user.social &&
										user.social.map((social, i) => (
											<a
												key={i}
												href={social.url}
												target='_blank'
												rel='noopener noreferrer'
												className='flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors'
											>
												<div
													className={`p-2 rounded-md ${getSocialColor(
														social.type
													)}`}
												>
													<SocialIcon type={social.type} />
												</div>
												<div className='ml-3'>
													<p className='font-medium capitalize'>
														{social.type}
													</p>
													<p className='text-sm text-gray-500'>
														@{social.username}
													</p>
												</div>
												<ExternalLink className='h-4 w-4 ml-auto text-gray-400' />
											</a>
										))}
								</div>

								{(!user.social || user.social.length === 0) && (
									<div className='text-center p-8'>
										<p className='text-gray-500'>
											No social media accounts linked
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

// Helper function to get social media brand colors
function getSocialColor(type: string): string {
	switch (type) {
		case 'twitter':
			return 'bg-blue-100 text-blue-600';
		case 'instagram':
			return 'bg-pink-100 text-pink-600';
		case 'github':
			return 'bg-gray-100 text-gray-800';
		case 'youtube':
			return 'bg-red-100 text-red-600';
		case 'linkedin':
			return 'bg-blue-100 text-blue-700';
		case 'twitch':
			return 'bg-purple-100 text-purple-600';
		case 'website':
		default:
			return 'bg-green-100 text-green-600';
	}
}
