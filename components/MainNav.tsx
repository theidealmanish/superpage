'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MainNavProps {
	className?: string;
}

const MainNav: React.FC<MainNavProps> = ({ className }) => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const router = useRouter();
	const path = usePathname();

	useEffect(() => {
		const controlNavbar = () => {
			if (typeof window !== 'undefined') {
				// Check if scrolled more than 20px to add transparency
				if (window.scrollY > 20) {
					setIsScrolled(true);
				} else {
					setIsScrolled(false);
				}

				// Hide on scroll down, show on scroll up
				if (window.scrollY > lastScrollY + 10) {
					// Added threshold to avoid flickering
					setIsVisible(false);
				} else if (window.scrollY < lastScrollY - 10) {
					setIsVisible(true);
				}

				setLastScrollY(window.scrollY);
			}
		};

		window.addEventListener('scroll', controlNavbar);

		// Cleanup event listener
		return () => {
			window.removeEventListener('scroll', controlNavbar);
		};
	}, [lastScrollY]);

	return (
		<nav
			className={cn(
				'fixed top-2 w-11/12 max-w-6xl mx-auto left-0 right-0 z-50 px-6 py-4 transition-all duration-300 rounded-lg',
				isScrolled
					? 'bg-white/70 backdrop-blur-md shadow-md'
					: 'bg-transparent',
				isVisible ? 'transform translate-y-0' : 'transform -translate-y-full',
				className
			)}
		>
			<div className='flex items-center justify-between'>
				<Link href='/' className='font-bold text-xl text-primary'>
					SuperPage
				</Link>

				<div className='flex items-center space-x-4'>
					<Link
						href='/login'
						className={cn(
							'px-4 py-2 rounded-md transition-colors',
							'hover:bg-primary/10',
							path === '/login' ? 'font-medium text-primary' : 'text-gray-700'
						)}
					>
						Log in
					</Link>

					<Link
						href='/register'
						className={cn(
							'px-4 py-2 rounded-md text-white bg-primary',
							'hover:bg-primary/90 transition-colors'
						)}
					>
						Register
					</Link>
				</div>
			</div>
		</nav>
	);
};

export default MainNav;
