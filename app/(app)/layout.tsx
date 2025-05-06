'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Home,
	User,
	Bell,
	Mail,
	Bookmark,
	Search,
	LayoutDashboard,
	Settings,
	LogOut,
	Globe,
	Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import '@/app/globals.css';
import Image from 'next/image';

interface AuthLayoutProps {
	children: React.ReactNode;
}

const navigation = [
	{ name: 'Home', icon: Home, href: '/home' },
	{ name: 'Explore', icon: Search, href: '/explore' },
	{ name: 'Notifications', icon: Bell, href: '/notifications' },
	{ name: 'Messages', icon: Mail, href: '/messages' },
	{ name: 'Engagement', icon: LayoutDashboard, href: '/engagements' },
	{ name: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
	{ name: 'Profile', icon: User, href: '/profile' },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
	const pathname = usePathname();

	// Mock user data - replace with your authentication logic
	const user = {
		name: 'Jane Doe',
		username: 'janedoe',
		avatarUrl: '', // Leave empty for fallback
	};

	const NavContent = () => (
		<div className='flex h-full flex-col justify-between'>
			<div className='space-y-2'>
				<Link href='/home' className='flex items-center p-3 mb-6'>
					<Image
						src='/images/super.png'
						alt='Logo'
						width={48}
						height={48}
						className='rounded-full'
					/>
					<span className='sr-only'>SuperPage</span>
				</Link>

				<nav className='flex flex-col space-y-1'>
					{navigation.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.name}
								href={item.href}
								className={cn(
									'flex items-center px-3 py-3 text-gray-700 rounded-full hover:bg-gray-100 transition-colors',
									isActive && 'font-medium bg-gray-100'
								)}
							>
								<item.icon
									className={cn(
										'h-6 w-6',
										isActive ? 'text-primary' : 'text-gray-500'
									)}
								/>
								<span className='ml-4 text-lg hidden lg:inline-block'>
									{item.name}
								</span>
							</Link>
						);
					})}
				</nav>

				<Button
					className='mt-4 rounded-full hidden lg:flex lg:w-[90%] mx-auto'
					size='lg'
				>
					Post
				</Button>

				<Button
					className='mt-4 rounded-full flex lg:hidden justify-center items-center p-3 w-12 h-12 mx-auto'
					size='icon'
				>
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M22 2L11 13'
							stroke='white'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
						<path
							d='M22 2L15 22L11 13L2 9L22 2Z'
							stroke='white'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</Button>
			</div>

			<div className='mt-auto mb-4'>
				<div className='flex items-center p-3 rounded-full hover:bg-gray-100 transition-colors cursor-pointer'>
					<Avatar>
						<AvatarImage src={user.avatarUrl} />
						<AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
					</Avatar>

					<div className='ml-3 hidden lg:block'>
						<p className='font-medium text-sm'>{user.name}</p>
						<p className='text-gray-500 text-sm'>@{user.username}</p>
					</div>

					<div className='ml-auto hidden lg:block'>
						<svg
							width='16'
							height='16'
							viewBox='0 0 16 16'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path d='M8 10L12 6L4 6L8 10Z' fill='#6B7280' />
						</svg>
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<>
			<div className='flex min-h-screen'>
				{/* Desktop Sidebar */}
				<div className='hidden sm:flex sm:flex-col border-r border-gray-200 w-[80px] lg:w-[280px] p-2'>
					<NavContent />
				</div>

				{/* Mobile Sidebar */}
				<div className='sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-2'>
					<div className='flex justify-around'>
						{navigation.slice(0, 5).map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.name}
									href={item.href}
									className='flex flex-col items-center px-3 py-2'
								>
									<item.icon
										className={cn(
											'h-6 w-6',
											isActive ? 'text-primary' : 'text-gray-500'
										)}
									/>
								</Link>
							);
						})}

						<Sheet>
							<SheetTrigger asChild>
								<Button variant='ghost' size='icon' className='rounded-full'>
									<Menu className='h-6 w-6 text-gray-500' />
								</Button>
							</SheetTrigger>
							<SheetContent side='left' className='p-0 w-[280px]'>
								<div className='h-full'>
									<NavContent />
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>

				{/* Main Content */}
				<div className='flex-1'>{children}</div>
			</div>
		</>
	);
}
