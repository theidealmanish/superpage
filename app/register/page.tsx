'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
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
});

export default function SignUpPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			name: '',
			username: '',
			email: '',
			password: '',
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
		})
			.then((res) => {
				console.log(res.data);
				// save the token
				localStorage.setItem('token', res.token);
				router.push(`/${res.data.username}/profile`);
				return res;
			})
			.catch((err) => {
				console.error(err.response?.data?.message || 'Failed to register');
				setError(err.response?.data?.message || 'Failed to register');
			})
			.finally(() => {
				setIsLoading(false);
			});
	}

	// Get a shortened address for display
	const shortenAddress = (address: string) => {
		if (!address) return '';
		return `${address.substring(0, 6)}...${address.substring(
			address.length - 4
		)}`;
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
