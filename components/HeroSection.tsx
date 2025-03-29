import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
	className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
	return (
		<div
			className={cn(
				'relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden',
				className
			)}
		>
			{/* Gradient background */}
			<div className='absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background z-0'></div>

			{/* Decorative elements */}
			<div className='absolute top-20 left-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl'></div>
			<div className='absolute bottom-10 right-10 w-80 h-80 rounded-full bg-primary/20 blur-3xl'></div>

			{/* Content container */}
			<div className='relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center'>
				<div className='max-w-3xl mx-auto'>
					<h1 className='text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-primary'>
						Superpage: The Future of Creator Economies.
					</h1>

					<p className='text-xl text-gray-700 mb-10 max-w-2xl mx-auto'>
						Web3 tools for creators and their communities.
					</p>

					<div className='flex flex-col sm:flex-row gap-4 justify-center'>
						<Button
							size='lg'
							className='bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6'
						>
							Get Started for Free
							<ArrowRight className='ml-2 h-5 w-5' />
						</Button>

						<Button
							size='lg'
							variant='outline'
							className='text-primary border-primary hover:bg-primary/10 text-lg px-8 py-6'
						>
							See Examples
						</Button>
					</div>

					<div className='mt-12 text-sm text-gray-500'>
						<p>No credit card required • Free 14-day trial • Cancel anytime</p>
					</div>
				</div>
			</div>

			{/* Wave pattern at the bottom */}
			<div className='absolute bottom-0 left-0 right-0 h-16 bg-wave-pattern bg-repeat-x bg-contain opacity-10'></div>
		</div>
	);
};

export default HeroSection;
