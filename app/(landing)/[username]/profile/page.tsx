'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	Edit2,
	Save,
	Globe,
	MapPin,
	Twitter,
	Youtube,
	Linkedin,
	Github,
	Loader2,
} from 'lucide-react';

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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams, useRouter } from 'next/navigation';
import { getUsername } from '@/lib/getUsername';
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { toast } from 'sonner';

// Define the Profile interface
interface Profile {
	_id?: string;
	user: string;
	bio: string;
	country: string;
	socials: {
		x: string;
		youtube: string;
		linkedin: string;
		github: string;
	};
	wallets: {
		sui: string;
		solana: string;
		ethereum: string;
	};
}

// Create form validation schema
const profileSchema = z.object({
	bio: z.string().max(500, { message: 'Bio must be less than 500 characters' }),
	country: z.string().min(1, { message: 'Please select a country' }),
	socials: z.object({
		x: z.string().optional(),
		youtube: z.string().optional(),
		linkedin: z.string().optional(),
		github: z.string().optional(),
	}),
	wallets: z.object({
		sui: z.string().optional(),
	}),
});

// List of countries for dropdown
const countries = [
	'United States',
	'Canada',
	'United Kingdom',
	'Australia',
	'Germany',
	'France',
	'Japan',
	'Nepal',
	'India',
	'Brazil',
	'Nigeria',
	'South Africa',
	'China',
	'Russia',
	'Mexico',
	'Spain',
	'Italy',
	'South Korea',
];

const formatWalletAddress = (address: string): string => {
	if (!address) return '';
	if (address.length <= 14) return address;
	return `${address.substring(0, 6)}...${address.substring(
		address.length - 4
	)}`;
};

export default function ProfilePage() {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [user, setUser] = useState<any | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const router = useRouter();
	const suiAccount = useCurrentAccount();

	let { username } = useParams();
	username = getUsername(username);

	const form = useForm<z.infer<typeof profileSchema>>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			bio: '',
			country: '',
			socials: {
				x: '',
				youtube: '',
				linkedin: '',
				github: '',
			},
			wallets: {
				sui: '',
			},
		},
	});

	// Fetch profile data
	useEffect(() => {
		const fetchProfile = async () => {
			try {
				setIsLoading(true);

				// First get user info
				const userResponse = await axios.get('/auth/current-user');
				setUser(userResponse.data.data);
				console.log(userResponse.data.data);

				// Then get profile
				const profileResponse = await axios.get(`/profile/${username}`);
				setProfile(profileResponse.data.data);
				console.log(profileResponse.data.data);

				// Set form values
				form.reset({
					bio: profileResponse.data.data.bio,
					country: profileResponse.data.data.country,
					socials: {
						x: profileResponse.data.data.socials.x || '',
						youtube: profileResponse.data.data.socials.youtube || '',
						linkedin: profileResponse.data.data.socials.linkedin || '',
						github: profileResponse.data.data.socials.github || '',
					},
					wallets: {
						sui: profileResponse.data.data?.wallets?.sui || '',
					},
				});
				setError(null);
			} catch (err) {
				console.error('Error fetching profile:', err);
				toast.error('Failed to load profile');
			} finally {
				setIsLoading(false);
			}
		};

		fetchProfile();
	}, []);

	const onSubmit = async (values: z.infer<typeof profileSchema>) => {
		setIsSaving(true);

		if (suiAccount?.address) {
			values.wallets.sui = suiAccount.address;
		} else {
			values.wallets.sui = '';
		}

		if (!values.wallets.sui) {
			toast.error('Please connect your Sui wallet.');
			setIsSaving(false);
			return;
		}

		console.log('Form values:', values);
		try {
			const response = await axios.post('/profile', values);
			console.log('Profile updated:', response.data);
			router.push(`/${user.username}`);
			setProfile(response.data);
			setError(null);
			setIsEditing(false);
		} catch (err) {
			console.error('Failed to update profile:', err);
			setError('Failed to update profile. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoading) {
		return (
			<div className='container mx-auto mt-16'>
				<div className='max-w-3xl mx-auto'>
					<div className='flex items-center gap-4 mb-6'>
						<Skeleton className='h-16 w-16 rounded-full' />
						<div className='space-y-2'>
							<Skeleton className='h-6 w-40' />
							<Skeleton className='h-4 w-60' />
						</div>
					</div>
					<Card>
						<CardHeader>
							<Skeleton className='h-8 w-40' />
						</CardHeader>
						<CardContent className='space-y-6'>
							<Skeleton className='h-20 w-full' />
							<Skeleton className='h-10 w-1/2' />
							<div className='grid grid-cols-2 gap-4'>
								<Skeleton className='h-10 w-full' />
								<Skeleton className='h-10 w-full' />
								<Skeleton className='h-10 w-full' />
								<Skeleton className='h-10 w-full' />
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-10 mt-16'>
			<div className='max-w-3xl mx-auto'>
				<div className='flex flex-col sm:flex-row sm:items-center gap-4 mb-8'>
					<Avatar className='h-16 w-16 sm:h-20 sm:w-20'>
						<AvatarImage
							src={`https://api.dicebear.com/7.x/initials/svg?seed=${
								user?.name || 'User'
							}`}
						/>
						<AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
					</Avatar>

					<div>
						<h1 className='text-2xl font-bold'>{user?.name || 'User'}</h1>
						<p className='text-gray-500'>@{user?.username || 'username'}</p>
						{profile?.country && (
							<div className='flex items-center gap-2 text-sm text-gray-500 mt-1'>
								<MapPin size={14} />
								<span>{profile.country}</span>
							</div>
						)}
					</div>

					<div className='sm:ml-auto'>
						<Button
							variant={isEditing ? 'outline' : 'default'}
							onClick={() => setIsEditing(!isEditing)}
							disabled={isSaving}
							className='gap-2'
						>
							{isEditing ? (
								<>Cancel</>
							) : (
								<>
									<Edit2 size={16} />
									Edit Profile
								</>
							)}
						</Button>
					</div>
				</div>

				<Tabs defaultValue='profile'>
					<TabsList className='mb-6'>
						<TabsTrigger value='profile'>Profile</TabsTrigger>
						<TabsTrigger value='activity'>Activity</TabsTrigger>
						<TabsTrigger value='settings'>Settings</TabsTrigger>
					</TabsList>

					<TabsContent value='profile'>
						<Card>
							<CardHeader>
								<CardTitle>Profile Information</CardTitle>
								<CardDescription>
									{isEditing
										? 'Edit your profile information below.'
										: 'View your profile information.'}
								</CardDescription>
							</CardHeader>

							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)}>
									<CardContent className='space-y-6'>
										{/* Bio */}
										<FormField
											control={form.control}
											name='bio'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Bio</FormLabel>
													{isEditing ? (
														<>
															<FormControl>
																<Textarea
																	placeholder='Tell us about yourself...'
																	className='resize-none'
																	rows={4}
																	{...field}
																/>
															</FormControl>
															<FormDescription>
																Brief description about yourself. Max 500
																characters.
															</FormDescription>
															<FormMessage />
														</>
													) : (
														<div className='p-4 bg-gray-50 rounded-md text-gray-700'>
															{profile?.bio || 'No bio provided.'}
														</div>
													)}
												</FormItem>
											)}
										/>

										{/* Country */}
										<FormField
											control={form.control}
											name='country'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Country</FormLabel>
													{isEditing ? (
														<>
															<Select
																onValueChange={field.onChange}
																defaultValue={field.value}
															>
																<FormControl>
																	<SelectTrigger>
																		<SelectValue placeholder='Select your country' />
																	</SelectTrigger>
																</FormControl>
																<SelectContent>
																	{countries.map((country) => (
																		<SelectItem key={country} value={country}>
																			{country}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<FormMessage />
														</>
													) : (
														<div className='flex items-center gap-2 text-gray-700'>
															<Globe size={16} />
															{profile?.country || 'Not specified'}
														</div>
													)}
												</FormItem>
											)}
										/>

										{/* Social Links */}
										<div>
											<h3 className='text-lg font-medium mb-3'>Social Links</h3>
											<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
												{/* Twitter */}
												<FormField
													control={form.control}
													name='socials.x'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Twitter size={16} className='text-[#1DA1F2]' />
																Twitter (X)
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.x ? (
																<a
																	href={'https://x.com/' + profile.socials.x}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='hover:underline'
																>
																	{profile.socials.x}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* Facebook */}
												<FormField
													control={form.control}
													name='socials.youtube'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Youtube size={16} className='text-[#FF0000]' />
																Youtube
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='@username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.youtube ? (
																<a
																	href={
																		'https://youtube.com/@' +
																		profile.socials.youtube
																	}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='hover:underline'
																>
																	{profile.socials.youtube}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* LinkedIn */}
												<FormField
													control={form.control}
													name='socials.linkedin'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Linkedin
																	size={16}
																	className='text-[#0A66C2]'
																/>
																LinkedIn
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.linkedin ? (
																<a
																	href={
																		'https://github.com/' +
																		profile.socials.github
																	}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='hover:underline'
																>
																	{profile.socials.linkedin}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>

												{/* GitHub */}
												<FormField
													control={form.control}
													name='socials.github'
													render={({ field }) => (
														<FormItem>
															<FormLabel className='flex items-center gap-2'>
																<Github size={16} />
																GitHub
															</FormLabel>
															{isEditing ? (
																<>
																	<FormControl>
																		<Input placeholder='username' {...field} />
																	</FormControl>
																	<FormMessage />
																</>
															) : profile?.socials?.github ? (
																<a
																	href={
																		'https://github.com/' +
																		profile.socials.github
																	}
																	target='_blank'
																	rel='noopener noreferrer'
																	className='hover:underline'
																>
																	{profile.socials.github}
																</a>
															) : (
																<span className='text-gray-400'>
																	Not linked
																</span>
															)}
														</FormItem>
													)}
												/>
											</div>
										</div>

										{/* Wallets Section */}
										<div>
											<h3 className='text-lg font-medium mb-3'>Wallets</h3>
											<div className='space-y-4'>
												{/* SUI Wallet */}
												<FormField
													control={form.control}
													name='wallets.sui'
													render={({ field }) => (
														<FormItem>
															<div className='bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-100'>
																<div className='flex items-center justify-between'>
																	<div className='flex items-center gap-3'>
																		<div className='bg-blue-100 p-2 rounded-full'>
																			<svg
																				width='20'
																				height='20'
																				viewBox='0 0 128 128'
																				fill='none'
																				xmlns='http://www.w3.org/2000/svg'
																			>
																				<path
																					d='M91.5572 101.084C86.6873 109.406 78.4937 112 63.9998 112C49.5058 112 41.3122 109.456 36.4423 101.084C31.5724 92.7123 31.5724 80.8059 36.4423 53.9081C41.3122 26.9603 49.5058 17.0879 63.9998 17.0879C78.4937 17.0879 86.6873 26.9603 91.5572 53.9081C96.4271 80.8059 96.4271 92.7123 91.5572 101.084Z'
																					fill='#6CBBEB'
																				/>
																				<path
																					d='M35.6574 71.9069C27.3353 70.5821 23.1742 67.5888 21 61.0802C21 61.0802 22.4262 68.364 30.5326 75.1486C38.6391 81.9332 52.4524 79.9338 52.4524 79.9338C44.6595 77.9345 41.664 72.7911 35.6574 71.9069Z'
																					fill='#4599DC'
																				/>
																				<path
																					d='M93.4946 71.9069C101.782 70.5821 105.958 67.5888 108.132 61.0802C108.132 61.0802 106.706 68.364 98.6188 75.1486C90.5316 81.9332 76.789 79.9338 76.789 79.9338C84.5326 77.9345 87.488 72.7911 93.4946 71.9069Z'
																					fill='#4599DC'
																				/>
																			</svg>
																		</div>
																		<div>
																			<div className='font-medium'>
																				Sui Network
																			</div>
																			<div className='text-sm text-gray-500'>
																				Connect your Sui wallet to receive
																				rewards
																			</div>
																		</div>
																	</div>

																	{/* Conditional rendering for wallet status */}
																	{isEditing ? (
																		// If editing mode and we have a wallet address from the database
																		profile?.wallets?.sui ? (
																			<div className='flex flex-col items-end'>
																				<div className='flex items-center gap-2'>
																					<div className='h-2 w-2 rounded-full bg-green-500'></div>
																					<span className='text-sm text-green-600 font-medium'>
																						Connected
																					</span>
																				</div>
																				<div className='font-mono text-xs text-gray-500 mt-1'>
																					{formatWalletAddress(
																						profile?.wallets?.sui || ''
																					)}
																				</div>
																				{/* Option to change wallet */}
																				<Button
																					variant='ghost'
																					size='sm'
																					className='text-xs text-blue-500 hover:text-blue-600 mt-1 p-0 h-auto'
																					onClick={() => {
																						form.setValue(
																							'wallets.sui',
																							suiAccount?.address
																						); // Clear the wallet value in form
																					}}
																				>
																					Change wallet
																				</Button>
																			</div>
																		) : (
																			// If editing mode but no wallet connected - show connect button
																			<ConnectButton
																				connectText='Connect Sui Wallet'
																				className='bg-blue-500 hover:bg-blue-600 text-white'
																			/>
																		)
																	) : // View mode - just show the wallet if it exists
																	profile?.wallets?.sui ? (
																		<div className='flex items-center gap-2'>
																			<div className='h-2 w-2 rounded-full bg-green-500'></div>
																			<span className='font-mono text-sm'>
																				{formatWalletAddress(
																					profile.wallets.sui
																				)}
																			</span>
																		</div>
																	) : (
																		<span className='text-sm text-gray-400'>
																			Not connected
																		</span>
																	)}
																</div>
															</div>
														</FormItem>
													)}
												/>

												{/* You can add more wallet types here with similar logic */}
											</div>
										</div>
									</CardContent>

									{isEditing && (
										<CardFooter className='flex justify-items-end mt-4'>
											<Button type='submit' disabled={isSaving}>
												{isSaving ? (
													<>
														<Loader2 className='mr-2 h-4 w-4 animate-spin' />
														Saving...
													</>
												) : (
													<>
														<Save className='mr-2 h-4 w-4' />
														Save Changes
													</>
												)}
											</Button>
										</CardFooter>
									)}
								</form>
							</Form>
						</Card>
					</TabsContent>

					<TabsContent value='activity'>
						<Card>
							<CardHeader>
								<CardTitle>Activity</CardTitle>
								<CardDescription>
									Your recent activity and interactions.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='text-center py-10'>
									<p className='text-gray-500'>
										No recent activity to display.
									</p>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value='settings'>
						<Card>
							<CardHeader>
								<CardTitle>Settings</CardTitle>
								<CardDescription>
									Manage your account preferences and settings.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='space-y-6'>
									<div>
										<h3 className='text-lg font-medium'>Email Notifications</h3>
										<p className='text-gray-500 text-sm mt-1'>
											Configure what emails you want to receive.
										</p>
										<div className='mt-4'>
											{/* Settings content would go here */}
											<p className='text-center text-gray-500 py-4'>
												Settings options coming soon.
											</p>
										</div>
									</div>
									<Separator />
									<div>
										<h3 className='text-lg font-medium'>Privacy</h3>
										<p className='text-gray-500 text-sm mt-1'>
											Control your profile visibility and data sharing
											preferences.
										</p>
										<div className='mt-4'>
											{/* Privacy content would go here */}
											<p className='text-center text-gray-500 py-4'>
												Privacy options coming soon.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
